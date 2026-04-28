import "./polyfill/index.js"
import { Api, getApi } from "./api.js";
import { Component } from "./component/index.js";
import { showErrorPopup } from "./component/error.js";
import { InfoEvent, Stream } from "./stream/index.js"
import { getModalBackground, Modal, showMessage, showModal } from "./component/modal/index.js";
import { getSidebarRoot, setSidebar, setSidebarExtended, setSidebarStyle, Sidebar } from "./component/sidebar/index.js";
import { defaultStreamInputConfig, MouseMode, ScreenKeyboardSetVisibleEvent, StreamInputConfig } from "./stream/input.js";
import { defaultSettings, getLocalStreamSettings, Settings } from "./component/settings_menu.js";
import { SelectComponent } from "./component/input.js";
import { LogMessageType, StreamCapabilities, StreamKeys } from "./api_bindings.js";
import { ScreenKeyboard, TextEvent } from "./screen_keyboard.js";
import { FormModal } from "./component/modal/form.js";
import { streamStatsToText } from "./stream/stats.js";

// Lock UI immediately
document.body.classList.add("loading")

function getStreamToken() {
    const host = window.location.hostname
    return host.split(".")[0]
}

function startHeartbeat() {
    const token = getStreamToken()

    if (!token) {
        console.warn("No stream token found")
        return
    }

    console.info("Starting heartbeat for token", token)

    setInterval(async () => {
        try {
            await fetch(`https://backend.rigzer.com/api/sessions/heartbeat-by-token/${token}`, {
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

    splash.classList.add("hidden")
    document.body.classList.remove("loading")

    setTimeout(() => splash.remove(), 500)
}

async function startApp() {
    const api = await getApi()

    const rootElement = document.getElementById("root");
    if (rootElement == null) {
        showErrorPopup("couldn't find root element", true)
        return;
    }

    const queryParams = new URLSearchParams(location.search)

    const hostIdStr = queryParams.get("hostId")
    const appIdStr = queryParams.get("appId")
    if (hostIdStr == null || appIdStr == null) {
        await showMessage("No Host or no App Id found")
        window.close()
        return
    }
    const hostId = Number.parseInt(hostIdStr)
    const appId = Number.parseInt(appIdStr)

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
    
    private immersiveTransitionInProgress = false

    private beforeUnloadHandler = (e: BeforeUnloadEvent) => {
        e.preventDefault()
        e.returnValue = ""
    }

    public allowPageReload() {
        window.removeEventListener("beforeunload", this.beforeUnloadHandler)
    }

    // -- Connection health tracking
    private navigatingHome = false
    private lastConnectionStatus: string = "Ok"
    private serverAliveCache: boolean | null = null
    private serverCheckPromise: Promise<boolean> | null = null

    constructor(api: Api, hostId: number, appId: number) {
        this.api = api

        history.replaceState(null, "", location.href)
        history.pushState(null, "", location.href)

        window.addEventListener("popstate", () => {
            history.pushState(null, "", location.href)
        })

        window.addEventListener("beforeunload", this.beforeUnloadHandler)

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

        const settings = getLocalStreamSettings() ?? defaultSettings()

        let browserWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
        let browserHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

        this.previousMouseMode = this.inputConfig.mouseMode
        this.toggleFullscreenWithKeybind = settings.toggleFullscreenWithKeybind
        this.startStream(hostId, appId, settings, [browserWidth, browserHeight])

        this.settings = settings

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


    private navigateHome() {
        if (this.navigatingHome) return
        this.navigatingHome = true

        window.removeEventListener("beforeunload", this.beforeUnloadHandler)
        const home = getHomeOrigin()
        console.info(`🏠 Navigating to home: ${home}`)
        window.location.replace(home)
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

    private async startStream(hostId: number, appId: number, settings: Settings, browserSize: [number, number]) {
        setSidebarStyle({
            edge: settings.sidebarEdge,
        })

        this.stream = new Stream(this.api, hostId, appId, settings, browserSize)

        this.stream.addInfoListener(this.onInfo.bind(this))

        this.stream.addGameExitListener(() => {
            console.info("🎮 Game session ended on server - navigating home")
            this.navigateHome()
        })

        let immersiveAttempted = false
        let streamReady = false

        const attemptImmersive = async () => {
            if (immersiveAttempted || !streamReady) return
            immersiveAttempted = true
            
            await new Promise(resolve => setTimeout(resolve, 2500))

            // Guard: don't attempt if already navigating away
            if (this.navigatingHome) return

            try {
                if (!this.isFullscreen()) {
                    await this.requestFullscreen()
                    await new Promise(resolve => setTimeout(resolve, 800))
                }
            // Only lock pointer if connection is still healthy
            if (!this.navigatingHome) {
                await this.requestPointerLock()
            }
            } catch (err) {
                console.error("❌ Immersive mode failed:", err)
                immersiveAttempted = false
            }
        }

        this.stream.addInfoListener((event) => {
            if (event.detail.type === "connectionComplete") {
                streamReady = true
                const onFirstInteraction = () => {
                    attemptImmersive()
                    window.removeEventListener("pointerdown", onFirstInteraction)
                    window.removeEventListener("keydown", onFirstInteraction)
                }
                window.addEventListener("pointerdown", onFirstInteraction)
                window.addEventListener("keydown", onFirstInteraction)
            }
        })

        const connectionInfo = new ConnectionInfoModal()
        this.stream.addInfoListener(connectionInfo.onInfo.bind(connectionInfo))
        showModal(connectionInfo)

        this.onTouchUpdate()
        this.onGamepadUpdate()

        this.stream.getInput().addScreenKeyboardVisibleEvent(this.onScreenKeyboardSetVisible.bind(this))

        this.stream.mount(this.div)
    }

    private async onInfo(event: InfoEvent) {
        const data = event.detail

        if (data.type === "app") {
            document.title = `Stream: ${data.app.title}`
            return
        }

        if (data.type === "connectionComplete") {
            this.sidebar.onCapabilitiesChange(data.capabilities)
            startHeartbeat()  
            requestAnimationFrame(() => hideSplash())
            return
        }

        if (data.type === "connectionStatus") {
            console.info(`🔌 Connection status: ${data.status}`)
            this.lastConnectionStatus = data.status
            return
        }

        if (data.type === "addDebugLine") {
            console.info(`[Stream] ${data.line}`)

            // Handle WebRTC-level fatal errors (network failure, not game exit)
            // ConnectionTerminated is handled by addGameExitListener, not here
            if (data.additional?.type === "fatalDescription") {
                this.handleConnectionFailed()
            }

            return
        }
    }

private async handleConnectionFailed() {
    if (this.navigatingHome) return

    console.warn("🔌 Connection lost - waiting for recovery...")

    const recoveryTimeout = setTimeout(() => {
        if (this.navigatingHome) return

        console.warn("⏰ Connection did not recover - offering reconnect")

        showMessage("Connection lost. Click OK to reconnect. Hold esc to get cursor if in fullscreen").then(() => {
            this.allowPageReload()
            window.location.reload()
        })
    }, 15000)

    const checkRecovery = () => {
        if (this.lastConnectionStatus === "Ok") {
            console.info("✅ Connection recovered")
            clearTimeout(recoveryTimeout)
        }
    }

    const recoveryCheckInterval = setInterval(checkRecovery, 1000)

    setTimeout(() => clearInterval(recoveryCheckInterval), 15000)
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

    async requestFullscreen() {
        const body = document.body
        this.immersiveTransitionInProgress = true
        try {
            if (body) {
                if (!("requestFullscreen" in body && typeof body.requestFullscreen == "function")) {
                    await showMessage("Fullscreen is not supported by your browser!")
                    return
                }

                this.focusInput()

                if (!this.isFullscreen()) {
                    try {
                        await body.requestFullscreen({ navigationUI: "hide" })
                        // Wait for fullscreenchange event to fire
                        await new Promise(resolve => {
                            const handler = () => {
                                document.removeEventListener("fullscreenchange", handler)
                                resolve(undefined)
                            }
                            document.addEventListener("fullscreenchange", handler, { once: true })
                            // Safety timeout in case event doesn't fire
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
                        await navigator.keyboard.lock()
                        if (!this.hasShownFullscreenEscapeWarning) {
                            await showMessage("To exit Fullscreen you'll have to hold ESC for a few seconds.")
                        }
                        this.hasShownFullscreenEscapeWarning = true
                    } catch (e) {
                        console.warn("keyboard lock failed", e)
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
            // Give browser time to stabilize after all fullscreen operations
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
        this.checkFullyImmersed()
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
            await showMessage("Pointer Lock not supported")
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


class ViewerSidebar implements Component, Sidebar {
    private app: ViewerApp

    private div = document.createElement("div")
    private buttonDiv = document.createElement("div")

    private sendKeycodeButton = document.createElement("button")
    private keyboardButton = document.createElement("button")
    private screenKeyboard = new ScreenKeyboard()
    private lockMouseButton = document.createElement("button")
    private fullscreenButton = document.createElement("button")
    private statsButton = document.createElement("button")
    private reconnectButton = document.createElement("button")

    private mouseMode: SelectComponent
    private touchMode: SelectComponent

    constructor(app: ViewerApp) {
        this.app = app

        this.div.classList.add("sidebar-stream")
        this.buttonDiv.classList.add("sidebar-stream-buttons")
        this.div.appendChild(this.buttonDiv)

        this.sendKeycodeButton.innerText = "Send Keycode"
        this.sendKeycodeButton.addEventListener("click", async () => {
            const key = await showModal(new SendKeycodeModal())
            if (key == null) return
            this.app.getStream()?.getInput().sendKey(true, key, 0)
            this.app.getStream()?.getInput().sendKey(false, key, 0)
        })
        this.buttonDiv.appendChild(this.sendKeycodeButton)

        this.lockMouseButton.innerText = "Lock Mouse"
        this.lockMouseButton.addEventListener("click", async () => {
            await this.app.requestPointerLock(true)
        })
        this.buttonDiv.appendChild(this.lockMouseButton)

        this.keyboardButton.innerText = "Keyboard"
        this.keyboardButton.addEventListener("click", async () => {
            setSidebarExtended(false)
            this.screenKeyboard.show()
        })
        this.buttonDiv.appendChild(this.keyboardButton)

        this.screenKeyboard.addKeyDownListener(this.onKeyDown.bind(this))
        this.screenKeyboard.addKeyUpListener(this.onKeyUp.bind(this))
        this.screenKeyboard.addTextListener(this.onText.bind(this))
        this.div.appendChild(this.screenKeyboard.getHiddenElement())

        this.fullscreenButton.innerText = "Fullscreen"
        this.fullscreenButton.addEventListener("click", async () => {
            if (this.app.isFullscreen()) {
                await this.app.exitFullscreen()
            } else {
                await this.app.requestFullscreen()
            }
        })
        this.buttonDiv.appendChild(this.fullscreenButton)

        this.statsButton.innerText = "Stats"
        this.statsButton.addEventListener("click", () => {
            const stats = this.app.getStream()?.getStats()
            if (stats) {
                stats.toggle()
            }
        })
        this.buttonDiv.appendChild(this.statsButton)

        this.reconnectButton.innerText = "Reconnect Stream"
        this.reconnectButton.addEventListener("click", async () => {
            await showMessage("Reconnecting… This may take 5–10 seconds.")
            this.app.allowPageReload()
            window.location.reload()
        })
        this.buttonDiv.appendChild(this.reconnectButton)

        this.mouseMode = new SelectComponent("mouseMode", [
            { value: "relative", name: "Relative" },
            { value: "follow", name: "Follow" },
            { value: "pointAndDrag", name: "Point and Drag" }
        ], {
            displayName: "Mouse Mode",
            preSelectedOption: this.app.getInputConfig().mouseMode
        })
        this.mouseMode.addChangeListener(this.onMouseModeChange.bind(this))
        this.mouseMode.mount(this.div)

        this.touchMode = new SelectComponent("touchMode", [
            { value: "touch", name: "Touch" },
            { value: "mouseRelative", name: "Relative" },
            { value: "pointAndDrag", name: "Point and Drag" }
        ], {
            displayName: "Touch Mode",
            preSelectedOption: this.app.getInputConfig().touchMode
        })
        this.touchMode.addChangeListener(this.onTouchModeChange.bind(this))
        this.touchMode.mount(this.div)
    }

    onCapabilitiesChange(capabilities: StreamCapabilities) {
        this.touchMode.setOptionEnabled("touch", capabilities.touch)
    }

    getScreenKeyboard(): ScreenKeyboard {
        return this.screenKeyboard
    }

    private onText(event: TextEvent) {
        this.app.getStream()?.getInput().sendText(event.detail.text)
    }
    private onKeyDown(event: KeyboardEvent) {
        this.app.getStream()?.getInput().onKeyDown(event)
    }
    private onKeyUp(event: KeyboardEvent) {
        this.app.getStream()?.getInput().onKeyUp(event)
    }

    private onMouseModeChange() {
        const config = this.app.getInputConfig()
        config.mouseMode = this.mouseMode.getValue() as any
        this.app.setInputConfig(config)
    }

    private onTouchModeChange() {
        const config = this.app.getInputConfig()
        config.touchMode = this.touchMode.getValue() as any
        this.app.setInputConfig(config)
    }

    extended(): void {}
    unextend(): void {}

    mount(parent: HTMLElement): void {
        parent.appendChild(this.div)
    }
    unmount(parent: HTMLElement): void {
        parent.removeChild(this.div)
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