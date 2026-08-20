import "./polyfill/index.js"
import { Api, getApi } from "./api.js";
import { Component } from "./component/index.js";
import { showErrorPopup } from "./component/error.js";
import { InfoEvent, Stream } from "./stream/index.js"
import { getModalBackground, Modal, showMessage, showModal } from "./component/modal/index.js";
import { getSidebarRoot, setSidebar, setSidebarExtended, setSidebarStyle, setSidebarVisible, Sidebar } from "./component/sidebar/index.js";
import { defaultStreamInputConfig, MouseMode, ScreenKeyboardSetVisibleEvent, StreamInputConfig } from "./stream/input.js";
import { defaultSettings, getLocalStreamSettings, Settings } from "./component/settings_menu.js";
import { SelectComponent } from "./component/input.js";
import { LogMessageType, StreamCapabilities, StreamKeys } from "./api_bindings.js";
import { ScreenKeyboard, TextEvent } from "./screen_keyboard.js";
import { FormModal } from "./component/modal/form.js";
import {
    streamStatsToText,
    type NetworkQuality
} from "./stream/stats.js";
const { BACKEND_URL, HOME_URL } = window.APP_CONFIG;

interface AppConfig {
    BACKEND_URL: string;
    HOME_URL: string;
}

declare global {
    interface Window {
        APP_CONFIG: AppConfig;
    }
}

// Lock UI immediately
document.body.classList.add("loading")

function getStreamToken() {
    const host = window.location.hostname
    return host.split(".")[0]
}

// Guard against a second heartbeat interval being started if
// ConnectionComplete fires again after a reconnect.
let heartbeatStarted = false

function startHeartbeat() {
    if (heartbeatStarted) return
    heartbeatStarted = true

    const token = getStreamToken()

    if (!token) {
        console.warn("No stream token found")
        return
    }

    console.info("Starting heartbeat for token", token)

    setInterval(async () => {
        try {
            await fetch(`${BACKEND_URL}/api/sessions/heartbeat-by-token/${token}`, {
                method: "POST",
                credentials: "include"
            })
        } catch (err) {
            console.warn("Heartbeat failed", err)
        }
    }, 20000)
}

let splashHidden = false

function hideSplash() {
    if (splashHidden) return
    splashHidden = true

    const splash = document.getElementById("splash-screen")
    if (!splash) return

    splash.classList.add("sc-fadeout")
    document.body.classList.remove("loading")

    // Wait for the 0.8s animation to finish, then clean up completely
    setTimeout(() => {
        // Stop the heavy canvas background animations to save CPU/Battery
        if (typeof (window as any).cleanupSplashScreen === "function") {
            (window as any).cleanupSplashScreen()
        }

        // Remove from DOM
        splash.remove()
    }, 800)
}

async function startApp() {
    const api = await getApi()

    const rootElement = document.getElementById("root");
    if (rootElement == null) {
        showErrorPopup("couldn't find root element", true)
        return;
    }

    const hostId = 2299598189
    const appId = 881448767

    const sidebarRoot = getSidebarRoot()
    if (sidebarRoot) {
        stopPropagationOn(sidebarRoot)
    }

    const modalBackground = getModalBackground()
    if (modalBackground) {
        stopPropagationOn(modalBackground)
    }

    const app = new ViewerApp(api, hostId, appId)
    app.mount(rootElement)
}

window.requestAnimationFrame(() => {
    const elements = document.getElementsByClassName("prevent-start-transition")
    while (elements.length > 0) {
        elements.item(0)?.classList.remove("prevent-start-transition")
    }
})

startApp()


function getHomeOrigin(): string {
    const meta = document.querySelector<HTMLMetaElement>(
        'meta[name="home-origin"]'
    )

    if (meta?.content) {
        return meta.content.replace(/\/$/, "")
    }

    if ((window as any).__HOME_ORIGIN__) {
        return (window as any).__HOME_ORIGIN__.replace(/\/$/, "")
    }

    try {
        if (document.referrer) {
            return new URL(document.referrer).origin
        }
    } catch {}

    return window.location.origin
}


class ViewerApp implements Component {
    private api: Api

    private sidebar: ViewerSidebar

    private div = document.createElement("div")

    private statsDiv = document.createElement("div")
    private stream: Stream | null = null

    private settings: Settings

    private inputConfig: StreamInputConfig = defaultStreamInputConfig()
    private previousMouseMode: MouseMode
private toggleFullscreenWithKeybind: boolean
private hasShownFullscreenEscapeWarning = false

// ESC handling:
// Quick press = send ESC to the game.
// Hold for 1 second = exit Rigzer fullscreen.
private escapeHoldTimer: number | null = null
private escapeHeld = false
private escapeSentToGame = false

private readonly ESC_HOLD_DURATION_MS = 1000

    // One-time onboarding for the navbar / fullscreen flow.
    // The large cursor and ESC prompt are shown only once per stream.
    private hasShownNavbarOnboarding = false
    private navbarGuideEl: HTMLDivElement | null = null

    private immersiveTransitionInProgress = false

    // -- Session identity, kept around so a reconnect can recreate Stream identically
    private hostId: number
    private appId: number
    private browserSize: [number, number] = [0, 0]

    // -- Reconnect state (ViewerApp owns the entire reconnect workflow)
    private reconnecting = false
    private reconnectAttemptCount = 0
    private currentStreamIsReconnect = false
    private reconnectWindowStart: number | null = null
    private reconnectTimer: number | null = null
    private permanentFailureShown = false

private readonly RECONNECT_DELAYS =
[
    0,
    1000,
    2000,
    4000,
    8000,
    8000,
    8000
]
    private readonly RECONNECT_WINDOW_MS = 90000 // ~30-45s of retrying before giving up
    private readonly RECONNECT_GRACE_MS = 15000 // let a brief "disconnected" blip self-heal before tearing Stream down

    private reconnectGraceTimer: number | null = null

    private toastEl: HTMLDivElement | null = null
private toastTimerWrapper: HTMLDivElement | null = null;

private toastTimerCircle: SVGCircleElement | null = null;

private toastTimerText: HTMLSpanElement | null = null;

private toastAnimation: number | null = null;

private countdownStart = 0;
    private toastTextEl: HTMLSpanElement | null = null

    // -- Legacy fallback dialog state, used only by navigateHome()'s
    //    "navigation didn't happen" safety net. Not part of the
    //    temporary-network-failure reconnect path.
    private connectionRecoveryInProgress = false;
    private recoveryTimeout: number | null = null;
    private recoveryInterval: number | null = null;
    private fallbackRecoveryTimer: number | null = null;

    // -- Connection health tracking
    private navigatingHome = false
    private lastConnectionStatus: string = "Ok"
    private transportConnected = false;
    private connectionCompleteReceived = false;
    private iceHealthy = false;
    private serverAliveCache: boolean | null = null
    private serverCheckPromise: Promise<boolean> | null = null
    private lastNetworkToast:
NetworkQuality | null = null;

private toastTimeout: number | null = null;

    constructor(api: Api, hostId: number, appId: number) {
        this.api = api
        this.hostId = hostId
        this.appId = appId

        history.replaceState(null, "", location.href)
        history.pushState(null, "", location.href)

        window.addEventListener("popstate", () => {
            history.pushState(null, "", location.href)
        })

        this.sidebar = new ViewerSidebar(this)
        setSidebar(this.sidebar)

        this.statsDiv.hidden = true
        this.statsDiv.classList.add("video-stats")

        setInterval(() => {
            const stats = this.getStream()?.getStats()
            if (stats && stats.isEnabled()) {
                this.statsDiv.hidden = false
                const text = streamStatsToText(stats.getCurrentStats())
                this.statsDiv.innerText = text
            } else {
                this.statsDiv.hidden = true
            }
        }, 1000)
        this.div.appendChild(this.statsDiv)

        this.buildReconnectToast()

        const settings = getLocalStreamSettings() ?? defaultSettings()

        this.previousMouseMode = this.inputConfig.mouseMode
        this.toggleFullscreenWithKeybind = settings.toggleFullscreenWithKeybind
        this.settings = settings

        this.startStream(hostId, appId, settings, [0, 0])

        this.addListeners(document)
        this.addListeners(document.getElementById("input") as HTMLDivElement)

        window.addEventListener("blur", () => {
            if (!this.immersiveTransitionInProgress) {
                this.stream?.getInput().raiseAllKeys()
            }
        })
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState !== "visible" && !this.immersiveTransitionInProgress) {
                this.stream?.getInput().raiseAllKeys()
            }
        })

        document.addEventListener("pointerlockchange", this.onPointerLockChange.bind(this))
        document.addEventListener("fullscreenchange", this.onFullscreenChange.bind(this))

        window.addEventListener("gamepadconnected", this.onGamepadConnect.bind(this))
        window.addEventListener("gamepaddisconnected", this.onGamepadDisconnect.bind(this))
        for (const gamepad of navigator.getGamepads()) {
            if (gamepad != null) {
                this.onGamepadAdd(gamepad)
            }
        }
    }


private onNetworkQualityChanged(quality: NetworkQuality) {

    // Ignore repeated values
    if (quality === this.lastNetworkToast) {
        return;
    }

    const previous = this.lastNetworkToast;
    this.lastNetworkToast = quality;

    switch (quality) {

        case "poor":
            this.showToast(
                "warn",
                "Poor connection",
                "Gameplay may stutter."
            );
            break;

        case "critical":
            this.showToast(
                "warn",
                "Very poor connection",
                "Connection may disconnect."
            );
            break;

        case "good":
        case "excellent":

            // Only notify if we were previously in a bad state
            if (previous === "poor" || previous === "critical") {

                this.showToast(
                    "ok",
                    "Connection restored",
                    ""
                );

                if (this.toastTimeout) {
                    clearTimeout(this.toastTimeout);
                }

                this.toastTimeout = window.setTimeout(() => {
                    this.hideToast();
                }, 2000);
            }

            return;

        default:
            return; // Ignore "fair"
    }

    if (this.toastTimeout) {
        clearTimeout(this.toastTimeout);
    }

    this.toastTimeout = window.setTimeout(() => {
        this.hideToast();
    }, 3000);
}

    private navigateHome(reason: string, homeUrl: string = getHomeOrigin()) {
        if (this.navigatingHome) return;

        this.navigatingHome = true;

        // We're leaving the page: any in-flight reconnect attempt is now moot.
        if (this.reconnectTimer != null) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
        }
        if (this.reconnectGraceTimer != null) {
            clearTimeout(this.reconnectGraceTimer)
            this.reconnectGraceTimer = null
        }
        this.reconnecting = false
        this.hideToast()

        window.location.replace(homeUrl);

        // If we're somehow still here after 2 seconds,
        // show the recovery dialog instead of leaving the
        // user on a frozen page.
        this.fallbackRecoveryTimer = window.setTimeout(() => {
            this.handleConnectionFailed(true);
        }, 2000);
    }

    private addListeners(element: GlobalEventHandlers) {
        element.addEventListener("keydown", this.onKeyDown.bind(this), { passive: false })
        element.addEventListener("keyup", this.onKeyUp.bind(this), { passive: false })

        element.addEventListener("mousedown", this.onMouseButtonDown.bind(this), { passive: false })
        element.addEventListener("mouseup", this.onMouseButtonUp.bind(this), { passive: false })
        element.addEventListener("mousemove", this.onMouseMove.bind(this), { passive: false })
        element.addEventListener("wheel", this.onMouseWheel.bind(this), { passive: false })
        element.addEventListener("contextmenu", this.onContextMenu.bind(this), { passive: false })

        element.addEventListener("touchstart", this.onTouchStart.bind(this), { passive: false })
        element.addEventListener("touchend", this.onTouchEnd.bind(this), { passive: false })
        element.addEventListener("touchcancel", this.onTouchCancel.bind(this), { passive: false })
        element.addEventListener("touchmove", this.onTouchMove.bind(this), { passive: false })
    }

    private async startStream(hostId: number, appId: number, settings: Settings, browserSize: [number, number], isReconnect: boolean = false) {
        this.hostId = hostId
        this.appId = appId
        this.browserSize = browserSize
        this.currentStreamIsReconnect = isReconnect
        

        setSidebarStyle({
            edge: settings.sidebarEdge,
        })

        this.stream = new Stream(this.api, hostId, appId, settings, browserSize)
        const stats = this.stream.getStats();

stats?.addNetworkQualityListener(
    this.onNetworkQualityChanged.bind(this)
);

        this.stream.addInfoListener(this.onInfo.bind(this))

        this.stream.addGameExitListener(async () => {
            const token = getStreamToken();

            const sleep = (ms: number) =>
                new Promise(resolve => setTimeout(resolve, ms));

            try {
                // Retry for up to 3 seconds because backend cleanup
                // may take a moment after GameExit.
                for (let attempt = 0; attempt < 6; attempt++) {

                    const res = await fetch(
                        `${BACKEND_URL}/api/sessions/status-by-token/${token}`,
                        {
                            method: "GET",
                            credentials: "include",
                        }
                    );


                    if (res.status === 404) {
                        this.navigateHome("Session ended (token not found)");
                        return;
                    }

                    if (!res.ok) {
                        throw new Error(`HTTP ${res.status}`);
                    }

                    const data = await res.json();

                    if (!data.active) {
                        this.navigateHome("Session ended");
                        return;
                    }

                    // Session still active.
                    // Wait 500ms before checking again because
                    // Redis cleanup may still be in progress.
                    await sleep(500);
                }

                // Token never disappeared.
                // Treat this as a normal network issue and let
                // transportState/handleConnectionFailed deal with it.

            } catch (err) {
                console.error("[STATUS] Check failed", err);
                this.navigateHome("Session ended (server error)");
            }
        });

        if (!isReconnect) {
            const connectionInfo = new ConnectionInfoModal()
            this.stream.addInfoListener(connectionInfo.onInfo.bind(connectionInfo))
            showModal(connectionInfo)
        }

        if (!isReconnect) {
            this.onTouchUpdate()
            this.onGamepadUpdate()
        }

        this.stream.getInput().addScreenKeyboardVisibleEvent(this.onScreenKeyboardSetVisible.bind(this))
        // Reapply saved input config (mouse mode, controller config, etc.)
        // so a reconnect doesn't reset it to defaults.
        this.stream.getInput().setConfig(this.inputConfig)

        this.stream.mount(this.div)
    }

    private async onInfo(event: InfoEvent) {
        const data = event.detail

        if (data.type === "app") {
            document.title = `Stream: ${data.app.title}`
            return
        }
        if (data.type === "connectionComplete") {
            this.sidebar.onCapabilitiesChange(data.capabilities);
            startHeartbeat();

            if (this.currentStreamIsReconnect) {
                // The new Stream instance reached ConnectionComplete —
                // the reconnect succeeded. Don't re-run the first-connect
                // splash/fullscreen prompt: the browser is already in
                // fullscreen from before, so requesting it again (and
                // showing the "press ESC" modal) would just force the
                // user to dismiss a modal for no reason.
                if (this.reconnecting) {
                    this.onReconnectSuccess()
                }
                return
            }

            requestAnimationFrame(async () => {
                hideSplash();

                // First-time onboarding:
                // 1. Keep the navbar visible and expanded.
                // 2. Show the large cursor pointing at the top-right 3-dots.
                // 3. Show the ESC/fullscreen prompt at the same time.
                // 4. Only after Continue do we enter fullscreen + pointer lock.
                if (!this.hasShownNavbarOnboarding) {
                    this.hasShownNavbarOnboarding = true;

                    setSidebar(this.sidebar);
                    setSidebarVisible(true);
                    setSidebarExtended(true);

                    this.showNavbarGuide();

                    try {
                        await showMessage(
                            "The 3 dots are in the top-right corner. They open the stream controls. " ,
                            {
                                title: "Stream Controls & Fullscreen",
                                confirmText: "Continue",
                                keyboardKey: "ESC",
                                keyboardHint: "Hold ESC to exit Fullscreen."
                            }
                        );

                        // Remove the onboarding cursor before pointer lock
                        // hides the normal mouse cursor.
                        this.hideNavbarGuide();

                        await this.requestFullscreen();

                        if (this.isFullscreen()) {
                            await this.requestPointerLock(true);
                        }
                    } catch (error) {
                        // If the modal/fullscreen flow is interrupted, keep the
                        // normal navbar available and do not show onboarding again.
                        this.hideNavbarGuide();
                        console.warn("Fullscreen onboarding interrupted", error);
                    }
                } else {
                    // Should normally only be reached after an unusual reconnect
                    // or repeated ConnectionComplete event.
                    this.hideNavbarGuide();
                }
            });

            return;
        }

        if (data.type === "transportState") {
            if (data.state === "failed") {
                // Definitive - skip the grace period and act immediately.
                if (this.reconnectGraceTimer != null) {
                    clearTimeout(this.reconnectGraceTimer)
                    this.reconnectGraceTimer = null
                }
                this.beginReconnect()
            } else if (data.state === "connected" && this.reconnecting) {
                this.onReconnectSuccess()
            }
            // "closed" is informational only here; voluntary teardown
            // (End Stream, GameExit, navigateHome) is handled elsewhere.
            return
        }

        if (data.type === "connectionStatus") {
            this.lastConnectionStatus = data.status;

            if (data.status === "Ok") {
                // Cancel a pending grace timer if the blip healed on its own.
                if (this.reconnectGraceTimer != null) {
                    clearTimeout(this.reconnectGraceTimer)
                    this.reconnectGraceTimer = null
                    this.hideToast()
                }
                // transportState "connected" is the normal success signal, but
                // fall back to this in case a transport path doesn't emit it.
                if (this.reconnecting) {
                    this.onReconnectSuccess()
                }

                if (this.recoveryTimeout) {
                    clearTimeout(this.recoveryTimeout);
                    this.recoveryTimeout = null;
                }

                if (this.recoveryInterval) {
                    clearInterval(this.recoveryInterval);
                    this.recoveryInterval = null;
                }

                this.connectionRecoveryInProgress = false;
            }

            // if (data.status === "Poor") {
            //     // React the moment the connection looks bad (fires on
            //     // WebRTC's "disconnected" state, well before "failed"),
            //     // instead of waiting for the slower "failed" transition.
            //     this.onConnectionPoor()
            // }

            return;
        }
        if (data.type === "addDebugLine") {
            console.info(`[Stream] ${data.line}`)
            return
        }
    }

    // ---------------------------------------------------------------
    // Reconnect workflow (temporary network loss). Owns: destroying
    // the old Stream, creating a fresh one, toast + backoff, and the
    // permanent-failure dialog. Never reloads the page.
    // ---------------------------------------------------------------

    private onConnectionPoor() {
        if (this.navigatingHome || this.permanentFailureShown) return
        if (this.reconnecting) return // already past the grace stage and retrying
        if (this.reconnectGraceTimer != null) return // grace already pending

        // Give feedback the moment things look bad, even though the
        // underlying transport may still self-heal within a couple seconds.
this.showToast(
"warn",
"Connection lost",
"Waiting for connection..."
);

this.startReconnectCountdown();

        this.reconnectGraceTimer = window.setTimeout(() => {
            this.reconnectGraceTimer = null
            this.beginReconnect()
        }, this.RECONNECT_GRACE_MS)
    }

    private beginReconnect() {

        if (this.navigatingHome || this.permanentFailureShown) return

        if (!this.reconnecting) {
            this.reconnecting = true
            this.reconnectAttemptCount = 0
            this.reconnectWindowStart = Date.now()
            this.transportConnected = false;
            this.connectionCompleteReceived = false;
            this.iceHealthy = false;
this.showToast(
"warn",
"Connecting...",
"Creating new stream..."
);
        }

        this.scheduleReconnectAttempt()
    }

    private scheduleReconnectAttempt() {
        if (this.reconnectTimer != null) return // an attempt is already queued

        const elapsed = Date.now() - (this.reconnectWindowStart ?? Date.now())
        if (elapsed >= this.RECONNECT_WINDOW_MS) {
            this.declarePermanentFailure()
            return
        }

        const delayIndex = Math.min(this.reconnectAttemptCount, this.RECONNECT_DELAYS.length - 1)
        const delay = this.RECONNECT_DELAYS[delayIndex]

        this.reconnectTimer = window.setTimeout(() => {
            this.reconnectTimer = null
            this.reconnectAttemptCount++
            this.performReconnectAttempt()
        }, delay)
    }

private async performReconnectAttempt() {

    if (!this.reconnecting || this.navigatingHome)
        return;

    const elapsed =
        Date.now() -
        (this.reconnectWindowStart ?? Date.now());

    if (elapsed >= this.RECONNECT_WINDOW_MS) {
        await this.declarePermanentFailure();
        return;
    }

    const oldStream = this.stream;

    this.stream = null;

    if (oldStream) {

        try {
            oldStream.unmount(this.div);
        } catch {}

        try {
            oldStream.destroy();
        } catch {}

    }

    await new Promise(resolve =>
        setTimeout(resolve, 500)
    );

    await this.startStream(
        this.hostId,
        this.appId,
        this.settings,
        this.browserSize,
        true
    );

    await new Promise(resolve =>
    setTimeout(resolve, 8000)
);

if (
    this.reconnecting &&
    this.lastConnectionStatus !== "Ok"
) {

    this.scheduleReconnectAttempt();

}

}

    private onReconnectSuccess() {
        if (this.reconnectTimer != null) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
        }
        if (this.reconnectGraceTimer != null) {
            clearTimeout(this.reconnectGraceTimer)
            this.reconnectGraceTimer = null
        }
        this.reconnecting = false
        this.reconnectAttemptCount = 0
        this.reconnectWindowStart = null
        this.permanentFailureShown = false

        this.showToast("ok", "Reconnected", "")
        window.setTimeout(() => this.hideToast(), 2000)
    }

    private async declarePermanentFailure() {
        this.reconnecting = false
        this.permanentFailureShown = true
        this.hideToast()

        // NOTE: assumes showMessage supports a second (cancel) button via
        // cancelText, returning a falsy/rejected result when it's chosen.
        // Verify against the actual Modal implementation before shipping.
        const modal = new PermanentFailureModal()
        const retried = await showModal(modal)

        if (retried) {
            this.permanentFailureShown = false
            this.reconnecting = true
            this.reconnectAttemptCount = 0
            this.reconnectWindowStart = Date.now()
            this.showToast("warn", "Connection lost", "Reconnecting…")
            this.performReconnectAttempt()
        } else {
            await this.exitStreamAndGoHome()
        }
    }

    private async exitStreamAndGoHome() {
        const token = getStreamToken()
        try {
            await fetch(
                `${BACKEND_URL}/api/sessions/cancel-by-token/${token}`,
                { method: "POST", credentials: "include" }
            )
        } catch (e) {
            console.error("Failed to cancel session on exit", e)
        }
        window.location.replace(getHomeOrigin())
    }

    // -- Toast (bottom-right) --------------------------------------

    private buildReconnectToast() {
        const toast = document.createElement("div")
        toast.style.cssText = `
            position: fixed;
            right: 20px;
            bottom: 20px;
            z-index: 100000;
            display: none;
            align-items: flex-start;
            gap: 10px;
            padding: 12px 16px;
            border-radius: 12px;
            background: rgba(13,13,13,0.92);
            border: 1px solid rgba(255,255,255,0.08);
            backdrop-filter: blur(12px);
            color: #f2f2f2;
            font-size: 13px;
            font-family: inherit;
            line-height: 1.3;
            box-shadow: 0 8px 24px rgba(0,0,0,0.4);
            pointer-events: none;
        `
        const timer=document.createElement("div");

timer.style.cssText=`
width:24px;
height:24px;
position:relative;
flex-shrink:0;
display:flex;
align-items:center;
justify-content:center;
`;

const svg=document.createElementNS(
"http://www.w3.org/2000/svg",
"svg"
);

svg.setAttribute("viewBox","0 0 24 24");

svg.style.cssText=`
width:24px;
height:24px;
`;

const bg=document.createElementNS(
"http://www.w3.org/2000/svg",
"circle"
);

bg.setAttribute("cx","12");
bg.setAttribute("cy","12");
bg.setAttribute("r","9");

bg.setAttribute("fill","none");
bg.setAttribute("stroke","rgba(255,255,255,.18)");
bg.setAttribute("stroke-width","2");

const fg=document.createElementNS(
"http://www.w3.org/2000/svg",
"circle"
);

fg.setAttribute("cx","12");
fg.setAttribute("cy","12");
fg.setAttribute("r","9");

fg.setAttribute("fill","none");
fg.setAttribute("stroke","#ffffff");
fg.setAttribute("stroke-width","2");
fg.setAttribute("stroke-linecap","round");

const circumference=2*Math.PI*9;

fg.style.strokeDasharray=`${circumference}`;
fg.style.strokeDashoffset="0";

fg.style.transform="rotate(-90deg)";
fg.style.transformOrigin="50% 50%";

svg.appendChild(bg);
svg.appendChild(fg);

const number=document.createElement("span");

number.style.cssText=`
position:absolute;
font-size:10px;
font-weight:600;
color:white;
line-height:1;
`;

timer.appendChild(svg);
timer.appendChild(number);

toast.appendChild(timer);

this.toastTimerWrapper=timer;
this.toastTimerCircle=fg;
this.toastTimerText=number;

const text=document.createElement("span");
toast.appendChild(text);
        toast.appendChild(text)
        document.body.appendChild(toast)

        this.toastEl = toast
this.toastTimerWrapper=timer;
this.toastTimerCircle=fg;
this.toastTimerText=number;
        this.toastTextEl = text
    }

    private startReconnectCountdown(){

    if(
        !this.toastTimerCircle||
        !this.toastTimerText
    ){
        return;
    }

    if(this.toastAnimation){
        cancelAnimationFrame(
            this.toastAnimation
        );
    }

    this.countdownStart=performance.now();

    const radius=9;

    const circumference=
        2*Math.PI*radius;

    const animate=(now:number)=>{

        const elapsed=
            now-this.countdownStart;

        const remaining=
            Math.max(
                0,
                this.RECONNECT_GRACE_MS-elapsed
            );

        const progress=
            elapsed/
            this.RECONNECT_GRACE_MS;

        this.toastTimerText!.textContent=
            `${Math.ceil(remaining/1000)}`;

        this.toastTimerCircle!.style.strokeDashoffset=
            `${circumference*progress}`;

        if(
            remaining>0 &&
            this.reconnectGraceTimer!=null
        ){

            this.toastAnimation=
                requestAnimationFrame(
                    animate
                );

        }
    };

    this.toastAnimation=
        requestAnimationFrame(
            animate
        );

}

    private showToast(kind: "warn" | "ok", title: string, subtitle: string) {
        if (!this.toastEl || !this.toastTextEl) {
            this.buildReconnectToast()
        }
        if (!this.toastEl || !this.toastTextEl) return

if(kind==="warn"){

    this.toastTimerWrapper!.style.display="flex";

}
else{

    this.toastTimerWrapper!.style.display="none";

}
        this.toastTextEl.innerHTML = subtitle
            ? `<div>${title}</div><div style="opacity:.65;font-size:11px;margin-top:2px;">${subtitle}</div>`
            : `<div>${title}</div>`

        this.toastEl.style.borderColor = kind === "warn"
            ? "rgba(255,196,0,0.35)"
            : "rgba(98,212,174,0.4)"

        this.toastEl.style.display = "flex"
    }

    private hideToast() {
        if(this.toastAnimation){

    cancelAnimationFrame(
        this.toastAnimation
    );

    this.toastAnimation=null;
}
        if (this.toastEl) {
            this.toastEl.style.display = "none"
        }
    }

    // ---------------------------------------------------------------
    // Legacy fallback path: used only when navigateHome()'s redirect
    // doesn't actually leave the page within 2s. Unrelated to the
    // temporary-network-loss reconnect flow above; right as-is.
    // ---------------------------------------------------------------

    private async handleConnectionFailed(isFallback: boolean = false) {
        if (this.navigatingHome && !isFallback) return;

        if (this.connectionRecoveryInProgress) {
            return;
        }

        this.connectionRecoveryInProgress = true;

        const timeout = isFallback ? 3000 : 15000;

        this.recoveryTimeout = window.setTimeout(async () => {
            this.connectionRecoveryInProgress = false;

            await showMessage(
                "Click Reconnect to continue.",
                {
                    title: "Connection Lost",
                    confirmText: "Reconnect",
                    variant: "error"
                }
            );

            // User clicked Reconnect
            window.location.reload();

        }, timeout);

        this.recoveryInterval = window.setInterval(() => {
            if (this.lastConnectionStatus === "Ok") {
                clearTimeout(this.recoveryTimeout!);
                clearInterval(this.recoveryInterval!);
                this.connectionRecoveryInProgress = false;
            }
        }, 1000);
    }

    private focusInput() {
        if (this.stream?.getInput().getCurrentPredictedTouchAction() != "screenKeyboard" && !this.sidebar.getScreenKeyboard().isVisible()) {
            const inputElement = document.getElementById("input") as HTMLDivElement
            inputElement.focus()
        }
    }

    onUserInteraction() {
        this.focusInput()

        this.stream?.getVideoRenderer()?.onUserInteraction()
        this.stream?.getAudioPlayer()?.onUserInteraction()
    }

    private onScreenKeyboardSetVisible(event: ScreenKeyboardSetVisibleEvent) {
        console.info(event.detail)
        const screenKeyboard = this.sidebar.getScreenKeyboard()

        const newShown = event.detail.visible
        if (newShown != screenKeyboard.isVisible()) {
            if (newShown) {
                screenKeyboard.show()
            } else {
                screenKeyboard.hide()
            }
        }
    }

    getInputConfig(): StreamInputConfig {
        return this.inputConfig
    }
    setInputConfig(config: StreamInputConfig) {
        Object.assign(this.inputConfig, config)
        this.stream?.getInput().setConfig(this.inputConfig)
    }

    onKeyDown(event: KeyboardEvent) {
        this.onUserInteraction()
        event.preventDefault()
        this.stream?.getInput().onKeyDown(event)
        event.stopPropagation()
    }

    private isTogglingFullscreenWithKeybind: "waitForCtrl" | "makingFullscreen" | "none" = "none"
    onKeyUp(event: KeyboardEvent) {
        this.onUserInteraction()
        event.preventDefault()
        this.stream?.getInput().onKeyUp(event)
        event.stopPropagation()

        if (this.toggleFullscreenWithKeybind && this.isTogglingFullscreenWithKeybind == "none" && event.ctrlKey && event.shiftKey && event.code == "KeyI") {
            this.isTogglingFullscreenWithKeybind = "waitForCtrl"
        }
        if (this.isTogglingFullscreenWithKeybind == "waitForCtrl" && (event.code == "ControlRight" || event.code == "ControlLeft")) {
            this.isTogglingFullscreenWithKeybind = "makingFullscreen";

            (async () => {
                if (this.isFullscreen()) {
                    await this.exitPointerLock()
                    await this.exitFullscreen()
                } else {
                    await this.requestFullscreen()
                    await this.requestPointerLock()
                }
                this.isTogglingFullscreenWithKeybind = "none"
            })()
        }
    }

    onMouseButtonDown(event: MouseEvent) {
        this.onUserInteraction()
        event.preventDefault()
        this.stream?.getInput().onMouseDown(event, this.getStreamRect());
        event.stopPropagation()
    }
    onMouseButtonUp(event: MouseEvent) {
        this.onUserInteraction()
        event.preventDefault()
        this.stream?.getInput().onMouseUp(event)
        event.stopPropagation()
    }
    onMouseMove(event: MouseEvent) {
        event.preventDefault()
        this.stream?.getInput().onMouseMove(event, this.getStreamRect())
        event.stopPropagation()
    }
    onMouseWheel(event: WheelEvent) {
        event.preventDefault()
        this.stream?.getInput().onMouseWheel(event)
        event.stopPropagation()
    }
    onContextMenu(event: MouseEvent) {
        event.preventDefault()
        event.stopPropagation()
    }

    onTouchStart(event: TouchEvent) {
        this.onUserInteraction()
        event.preventDefault()
        this.stream?.getInput().onTouchStart(event, this.getStreamRect())
        event.stopPropagation()
    }
    onTouchEnd(event: TouchEvent) {
        this.onUserInteraction()
        event.preventDefault()
        this.stream?.getInput().onTouchEnd(event, this.getStreamRect())
        event.stopPropagation()
    }
    onTouchCancel(event: TouchEvent) {
        this.onUserInteraction()
        event?.preventDefault()
        this.stream?.getInput().onTouchCancel(event, this.getStreamRect())
        event.stopPropagation()
    }
    onTouchUpdate() {
        this.stream?.getInput().onTouchUpdate(this.getStreamRect())
        window.requestAnimationFrame(this.onTouchUpdate.bind(this))
    }
    onTouchMove(event: TouchEvent) {
        event.preventDefault()
        this.stream?.getInput().onTouchMove(event, this.getStreamRect())
        event.stopPropagation()
    }

    onGamepadConnect(event: GamepadEvent) {
        this.onGamepadAdd(event.gamepad)
    }
    onGamepadAdd(gamepad: Gamepad) {
        this.stream?.getInput().onGamepadConnect(gamepad)
    }
    onGamepadDisconnect(event: GamepadEvent) {
        this.stream?.getInput().onGamepadDisconnect(event)
    }
    onGamepadUpdate() {
        this.stream?.getInput().onGamepadUpdate()
        window.requestAnimationFrame(this.onGamepadUpdate.bind(this))
    }

showNavbarGuide() {
    // Only show the guide while the navbar is available.
    if (this.isFullscreen() || this.navbarGuideEl) {
        return;
    }

    const guide = document.createElement("div");
    guide.id = "rigzer-navbar-guide";

guide.innerHTML = `
    <div class="rigzer-navbar-guide-arrow">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 238.136 248.064"
            aria-hidden="true"
        >
            <path
                d="M238.136,80.452,140.024,0l16.6,49.075C59.435,63.831-11.074,147.386,1.44,248.064c0,0,10.5-58.171,65.268-103.175a144.579,144.579,0,0,1,76.628-31.35c4.236-.386,8.645-.605,13.019-.595l-16.331,47.961Z"
                fill="white"
            />
        </svg>
    </div>
`;
guide.style.cssText = `
    position: fixed;

    top: 40px;
    right: 160px;

    width: 50px;
    height: 53px;

    z-index: 1000001;

    pointer-events: none;
    user-select: none;
`;

    const arrow = guide.querySelector(
        ".rigzer-navbar-guide-arrow"
    ) as HTMLDivElement | null;

if (arrow) {
    arrow.style.cssText = `
        width: 50px;
        height: 53px;

        display: flex;
        align-items: center;
        justify-content: center;

        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
    `;

    const svg = arrow.querySelector("svg") as SVGElement | null;

    if (svg) {
        svg.style.width = "50px";
        svg.style.height = "53px";
        svg.style.transform = "scaleY(-1)";
    }
}

    if (!document.getElementById("rigzer-navbar-guide-style")) {
        const style = document.createElement("style");

        style.id = "rigzer-navbar-guide-style";

        style.textContent = `

            @media (max-width: 900px) {
                #rigzer-navbar-guide {
                    top: 40px !important;
                    right: 160px !important;
                    width: 50px !important;
                    height: 53px !important;
                }

                #rigzer-navbar-guide .rigzer-navbar-guide-arrow {
                    width: 50px !important;
                    height: 53px !important;
                }

                #rigzer-navbar-guide svg {
                    width: 50px !important;
                    height: 53px !important;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /*
     * Keep the real navbar above the onboarding modal.
     * We do not create a fake navbar button.
     */
    const sidebarRoot = getSidebarRoot();

    if (sidebarRoot) {
        sidebarRoot.style.zIndex = "1000000";
    }

    document.body.appendChild(guide);

    this.navbarGuideEl = guide;
}

hideNavbarGuide() {
        if (!this.navbarGuideEl) {
            return;
        }

        this.navbarGuideEl.remove();
        this.navbarGuideEl = null;
    }

    async requestFullscreen() {
        const body = document.body
        this.immersiveTransitionInProgress = true
        try {
            if (body) {
                if (!("requestFullscreen" in body && typeof body.requestFullscreen == "function")) {
                    await showMessage(
                        "Fullscreen isn't supported by your browser.",
                        {
                            title: "Unsupported Browser",
                            confirmText: "OK",
                            variant: "warning"
                        }
                    );
                    return
                }

                this.focusInput()

                if (!this.isFullscreen()) {
                    try {
                        await body.requestFullscreen({ navigationUI: "hide" })
                        await new Promise(resolve => {
                            const handler = () => {
                                document.removeEventListener("fullscreenchange", handler)
                                resolve(undefined)
                            }
                            document.addEventListener("fullscreenchange", handler, { once: true })
                            setTimeout(() => {
                                document.removeEventListener("fullscreenchange", handler)
                                resolve(undefined)
                            }, 2000)
                        })
                    } catch (e) {
                        console.warn("failed to request fullscreen", e)
                    }
                }

                if ("keyboard" in navigator && navigator.keyboard && "lock" in navigator.keyboard) {
                    try {
                        await navigator.keyboard.lock();
                        this.hasShownFullscreenEscapeWarning = true;
                    } catch (e) {
                        console.warn("keyboard lock failed", e);
                    }
                }
                try {
                    if (screen && "orientation" in screen) {
                        const orientation = screen.orientation
                        if ("lock" in orientation && typeof orientation.lock == "function") {
                            await orientation.lock("landscape")
                        }
                    }
                } catch (e) {
                    console.warn("failed to set orientation to landscape", e)
                }
            } else {
                console.warn("root element not found")
            }
        } finally {
            setTimeout(() => { this.immersiveTransitionInProgress = false }, 2000)
        }
    }
    async exitFullscreen() {
        if ("keyboard" in navigator && navigator.keyboard && "unlock" in navigator.keyboard) {
            await navigator.keyboard.unlock()
        }
        if ("exitFullscreen" in document && typeof document.exitFullscreen == "function") {
            await document.exitFullscreen()
        }
    }
    isFullscreen(): boolean {
        return "fullscreenElement" in document && !!document.fullscreenElement
    }
    private async onFullscreenChange() {
        if (this.isFullscreen()) {
            this.hideNavbarGuide();
        }

        this.checkFullyImmersed();
    }

    async requestPointerLock(errorIfNotFound: boolean = false) {
        this.previousMouseMode = this.inputConfig.mouseMode

        const inputElement = document.getElementById("input") as HTMLDivElement

        if (inputElement && "requestPointerLock" in inputElement && typeof inputElement.requestPointerLock == "function") {
            this.focusInput()

            this.inputConfig.mouseMode = "relative"
            this.setInputConfig(this.inputConfig)

            setSidebarExtended(false)

            const onLockError = () => {
                document.removeEventListener("pointerlockerror", onLockError)
                inputElement.requestPointerLock()
            }

            document.addEventListener("pointerlockerror", onLockError, { once: true })

            try {
                let promise = inputElement.requestPointerLock({ unadjustedMovement: true })
                if (promise) {
                    await promise
                } else {
                    inputElement.requestPointerLock()
                }
            } catch (error) {
                if (error instanceof Error && error.name == "NotSupportedError") {
                    inputElement.requestPointerLock()
                } else {
                    throw error
                }
            } finally {
                document.removeEventListener("pointerlockerror", onLockError)
            }

        } else if (errorIfNotFound) {
            await showMessage(
                "Pointer Lock isn't supported by your browser.",
                {
                    title: "Unsupported Browser",
                    confirmText: "OK",
                    variant: "warning"
                }
            );
        }
    }
    async exitPointerLock() {
        if ("exitPointerLock" in document && typeof document.exitPointerLock == "function") {
            document.exitPointerLock()
        }
    }
    private onPointerLockChange() {
        this.checkFullyImmersed()

        if (!document.pointerLockElement) {
            this.inputConfig.mouseMode = this.previousMouseMode
            this.setInputConfig(this.inputConfig)
        }
    }

    private checkFullyImmersed() {
        if ("pointerLockElement" in document && document.pointerLockElement &&
            "fullscreenElement" in document && document.fullscreenElement) {
            setSidebar(null)
        } else {
            setSidebar(this.sidebar)
        }
        const isFullscreen = this.isFullscreen();
        const isPointerLocked = !!document.pointerLockElement;

        if (isFullscreen && isPointerLocked) {
            setSidebarVisible(false);
        } else {
            setSidebarVisible(true);
            setSidebar(this.sidebar);
        }
    }

    mount(parent: HTMLElement): void {
        parent.appendChild(this.div)
    }
    unmount(parent: HTMLElement): void {
        parent.removeChild(this.div)
    }

    getStreamRect(): DOMRect {
        return this.stream?.getVideoRenderer()?.getStreamRect() ?? new DOMRect()
    }
    getStream(): Stream | null {
        return this.stream
    }
}

class ConnectionInfoModal implements Modal<void> {
    private eventTarget = new EventTarget()
    private root = document.createElement("div")
    private text = document.createElement("p")

    constructor() {
        this.root.classList.add("modal-video-connect")
        this.text.innerText = "Starting game…"
        this.root.appendChild(this.text)
    }

    onInfo(event: InfoEvent) {
        const data = event.detail

        if (data.type === "connectionComplete") {
            this.text.innerText = "Connected! Click to start..."
            this.eventTarget.dispatchEvent(new Event("ml-connected"))
            return
        }

        if (data.type === "addDebugLine") {
            console.info(`[Stream] ${data.line}`)
            return
        }
    }

    onFinish(abort: AbortSignal): Promise<void> {
        return new Promise(resolve => {
            this.eventTarget.addEventListener("ml-connected", () => resolve(), {
                once: true,
                signal: abort
            })
        })
    }

    mount(parent: HTMLElement): void {
        parent.appendChild(this.root)
    }
    unmount(parent: HTMLElement): void {
        parent.removeChild(this.root)
    }
}

class PermanentFailureModal implements Modal<boolean> {
    private eventTarget = new EventTarget()
    private root = document.createElement("div")

    constructor() {
        this.root.classList.add("modal-video-connect")

        const text = document.createElement("p")
        text.innerText = "Unable to reconnect."
        this.root.appendChild(text)

        const buttonRow = document.createElement("div")
        buttonRow.style.cssText = "display:flex;gap:10px;margin-top:12px;"

        const retryBtn = document.createElement("button")
        retryBtn.innerText = "Retry"
        retryBtn.onclick = () => this.eventTarget.dispatchEvent(new CustomEvent("ml-choice", { detail: true }))

        const exitBtn = document.createElement("button")
        exitBtn.innerText = "Exit Stream"
        exitBtn.onclick = () => this.eventTarget.dispatchEvent(new CustomEvent("ml-choice", { detail: false }))

        buttonRow.appendChild(retryBtn)
        buttonRow.appendChild(exitBtn)
        this.root.appendChild(buttonRow)
    }

    onFinish(abort: AbortSignal): Promise<boolean> {
        return new Promise(resolve => {
            this.eventTarget.addEventListener("ml-choice", (e) => {
                resolve((e as CustomEvent<boolean>).detail)
            }, { once: true, signal: abort })
        })
    }

    mount(parent: HTMLElement): void {
        parent.appendChild(this.root)
    }
    unmount(parent: HTMLElement): void {
        parent.removeChild(this.root)
    }
}

class ViewerSidebar implements Component, Sidebar {
    private app: ViewerApp;
    private div = document.createElement("div");

    private screenKeyboard = new ScreenKeyboard();

    constructor(app: ViewerApp) {
        this.app = app;

        this.div.classList.add("gamebar-container");

        const btnFullscreen = document.createElement("button");
        btnFullscreen.className = "gamebar-btn";
        btnFullscreen.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
            <span>Fullscreen</span>
        `;
btnFullscreen.onclick = async () => {

    // If the onboarding ESC/fullscreen prompt is currently open,
    // close it immediately when the user chooses Fullscreen.
    showModal(null);

    // Also remove the arrow guide.
    this.app.hideNavbarGuide();

    if (this.app.isFullscreen()) {

        await this.app.exitPointerLock();
        await this.app.exitFullscreen();

    } else {

        await this.app.requestFullscreen();

        if (this.app.isFullscreen()) {
            await this.app.requestPointerLock(true);
        }
    }
};

        const btnEndStream = document.createElement("button");
        btnEndStream.className = "gamebar-btn btn-danger";
        btnEndStream.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
            <span>End Stream</span>
        `;
        btnEndStream.onclick = async () => {
            const token = window.location.hostname.split(".")[0];

            btnEndStream.innerHTML = `<span>Ending...</span>`;
            btnEndStream.disabled = true;

            try {
                await fetch(
                    `${BACKEND_URL}/api/sessions/cancel-by-token/${token}`,
                    {
                        method: "POST",
                        credentials: "include",
                    }
                );

                window.location.replace(HOME_URL);
            } catch (e) {
                console.error("Failed to end stream", e);

                btnEndStream.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                        <line x1="12" y1="2" x2="12" y2="12"></line>
                    </svg>
                    <span>End Stream</span>
                `;
                btnEndStream.disabled = false;

                await showMessage(
                    "Please try again.",
                    {
                        title: "Failed to End Stream",
                        confirmText: "OK",
                        variant: "error"
                    }
                );
            }
        };

        this.div.appendChild(btnFullscreen);
        this.div.appendChild(btnEndStream);

        this.screenKeyboard.addKeyDownListener(this.onKeyDown.bind(this));
        this.screenKeyboard.addKeyUpListener(this.onKeyUp.bind(this));
        this.screenKeyboard.addTextListener(this.onText.bind(this));
        this.div.appendChild(this.screenKeyboard.getHiddenElement());
    }

    onCapabilitiesChange(capabilities: StreamCapabilities) {
        // Required by ViewerApp
    }

    getScreenKeyboard(): ScreenKeyboard {
        return this.screenKeyboard;
    }

    private onText(event: TextEvent) {
        this.app.getStream()?.getInput().sendText(event.detail.text);
    }

    private onKeyDown(event: KeyboardEvent) {
        this.app.getStream()?.getInput().onKeyDown(event);
    }

    private onKeyUp(event: KeyboardEvent) {
        this.app.getStream()?.getInput().onKeyUp(event);
    }

    extended(): void {}
    unextend(): void {}

    mount(parent: HTMLElement): void {
        parent.appendChild(this.div);
    }
    unmount(parent: HTMLElement): void {
        parent.removeChild(this.div);
    }
}

class SendKeycodeModal extends FormModal<number> {
    private dropdownSearch: SelectComponent

    constructor() {
        super()

        const keyList = []
        for (const keyNameRaw in StreamKeys) {
            const keyName = keyNameRaw as keyof typeof StreamKeys
            const keyValue = StreamKeys[keyName]

            const PREFIX = "VK_"
            let name: string = keyName
            if (name.startsWith(PREFIX)) {
                name = name.slice(PREFIX.length)
            }

            keyList.push({ value: keyValue.toString(), name })
        }

        this.dropdownSearch = new SelectComponent("winKeycode", keyList, {
            hasSearch: true,
            displayName: "Select Keycode"
        })
    }

    mountForm(form: HTMLFormElement): void {
        this.dropdownSearch.mount(form)
    }

    reset(): void {
        this.dropdownSearch.reset()
    }

    submit(): number | null {
        const keyString = this.dropdownSearch.getValue()
        if (keyString == null) return null
        return parseInt(keyString)
    }
}

function stopPropagationOn(element: HTMLElement) {
    element.addEventListener("keydown", onStopPropagation)
    element.addEventListener("keyup", onStopPropagation)
    element.addEventListener("keypress", onStopPropagation)
    element.addEventListener("click", onStopPropagation)
    element.addEventListener("mousedown", onStopPropagation)
    element.addEventListener("mouseup", onStopPropagation)
    element.addEventListener("mousemove", onStopPropagation)
    element.addEventListener("wheel", onStopPropagation)
    element.addEventListener("contextmenu", onStopPropagation)
    element.addEventListener("touchstart", onStopPropagation)
    element.addEventListener("touchmove", onStopPropagation)
    element.addEventListener("touchend", onStopPropagation)
    element.addEventListener("touchcancel", onStopPropagation)
}
function onStopPropagation(event: Event) {
    event.stopPropagation()
}