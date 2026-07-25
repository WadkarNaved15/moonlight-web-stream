import { Component } from "../index.js"
import { showErrorPopup } from "../error.js"
import { FormModal } from "./form.js"

export interface Modal<Output> extends Component {
    onFinish(abort: AbortSignal): Promise<Output>
}

let modalAbort: AbortController | null = null
const modalBackground = document.getElementById("modal-overlay")
const modalParent = document.getElementById("modal-parent")
let previousModal: Modal<unknown> | null = null

// Don't allow context menu event through this background
modalBackground?.addEventListener("contextmenu", event => {
    event.stopImmediatePropagation()
})

export function getModalBackground(): HTMLElement | null {
    return modalBackground
}

export async function showModal<Output>(modal: Modal<Output> | null): Promise<Output | null> {
    if (modalParent == null) {
        showErrorPopup("cannot find modal parent")
        return null
    }
    if (modalBackground == null) {
        showErrorPopup("the modal overlay cannot be found")
    }

    if (modalAbort != null) {
        modalBackground?.classList.add("modal-disabled")
        modalAbort.abort()
        modalAbort = null
    }

    if (!modal) {
        return null
    }

    if (previousModal) {
        previousModal.unmount(modalParent)
    }
    previousModal = modal

    const abortController = new AbortController()

    modalAbort = abortController
    modal.mount(modalParent)
    modalBackground?.classList.remove("modal-disabled")

    const output = await modal.onFinish(abortController.signal)

    modalBackground?.classList.add("modal-disabled")
    modalAbort.abort()
    modalAbort = null

    return output
}

/// --- Helper Modals

export async function showPrompt(prompt: string, promptInit?: PromptInit): Promise<string | null> {
    const modal = new PromptModal(prompt, promptInit)

    return await showModal(modal)
}

type PromptInit = {
    defaultValue?: string,
    name?: string,
    type?: "text" | "password",
}

class PromptModal extends FormModal<string> {
    private message: HTMLElement = document.createElement("p")
    private textInput: HTMLInputElement = document.createElement("input")

    constructor(prompt: string, init?: PromptInit) {
        super()

        this.message.innerText = prompt

        if (init?.type) {
            this.textInput.type = init?.type
        }
        if (init?.defaultValue) {
            this.textInput.defaultValue = init?.defaultValue
        }
        if (init?.name) {
            this.textInput.name = init?.name
        }
    }

    reset(): void {
        this.textInput.value = ""
    }
    submit(): string | null {
        return this.textInput.value
    }

    mountForm(form: HTMLFormElement): void {
        form.appendChild(this.message)
        form.appendChild(this.textInput)
    }
}

type MessageInit = {
    signal?: AbortSignal;
    title?: string;
    confirmText?: string;
    keyboardKey?: string;
    keyboardHint?: string;

    variant?: "default" | "error" | "warning" | "success";
}

export async function showMessage(message: string, init?: MessageInit) {
    const modal = new MessageModal(message, init)

    await showModal(modal)
}

class MessageModal implements Component, Modal<void> {

    private signal?: AbortSignal
    private container = document.createElement("div");
    private title = document.createElement("h3");
    private textElement = document.createElement("p");
    private escHint = document.createElement("div");
    private escKey = document.createElement("span");
    private escText = document.createElement("span");
    private okButton = document.createElement("button");
    private icon = document.createElement("div");
    private header = document.createElement("div");

    constructor(message: string, init?: MessageInit) {
        this.signal = init?.signal;
        this.icon.className = "message-icon";

        this.container.className = "message-box";
        if (!init?.keyboardKey) {
            this.icon.className = "message-icon";

            switch (init?.variant) {
            case "error":
                this.icon.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="7" x2="12" y2="13"/>
                        <circle cx="12" cy="17" r="1"/>
                    </svg>
                `;
                this.container.classList.add("message-error");
                break;

            case "warning":
                this.icon.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round">
                        <path d="M12 3L2.8 19a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L12 3z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <circle cx="12" cy="17" r="1"/>
                    </svg>
                `;
                this.container.classList.add("message-warning");
                break;

            case "success":
                this.icon.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="8 12 11 15 16 9"/>
                    </svg>
                `;
                this.container.classList.add("message-success");
                break;

            default:
                this.icon.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="12" x2="12" y2="12"/>
                        <line x1="12" y1="8" x2="12" y2="8"/>
                    </svg>
                `;
                this.container.classList.add("message-default");
                break;
        }
}


        this.header.className = "message-header";

        this.title.className = "message-title";
        this.title.innerText = init?.title ?? "";

        if (!init?.keyboardKey) {
            this.header.append(this.icon);

            if (this.title.innerText) {
                this.header.append(this.title);
            }
        }

        this.textElement.className = "message-text";

        this.textElement.innerText = message;

        this.okButton.innerText = init?.confirmText ?? "OK";

        if (init?.keyboardKey && init?.keyboardHint) {
            this.escHint.className = "message-shortcut";

            this.escKey.className = "message-shortcut-key";
            this.escKey.innerText = init.keyboardKey;

            this.escText.className = "message-shortcut-text";
            this.escText.innerText = init.keyboardHint;

            this.escHint.append(this.escKey, this.escText);
        }
    }

mount(parent: Element): void {
    const isRich = this.escHint.childElementCount > 0;

    if (isRich) {
        this.container.classList.add("message-box-rich");

        if (this.title.innerText) {
            this.container.append(this.title);
        }

        this.container.append(
            this.textElement,
            this.escHint,
            this.okButton
        );
    } else {
        this.container.classList.add("message-box-simple");

        if (this.header.childElementCount > 0) {
            this.container.append(this.header);
        }

        this.container.append(
            this.textElement,
            this.okButton
        );
    }

    parent.appendChild(this.container);
}

    unmount(parent: Element): void {
        parent.removeChild(this.container);
    }

onFinish(abort: AbortSignal): Promise<void> {
    return new Promise(resolve => {

        const finish = () => {
            this.okButton.removeEventListener("click", finish);
            resolve();
        };

        this.okButton.addEventListener("click", finish, { once: true });

        abort.addEventListener("abort", finish, { once: true });

        if (this.signal) {
            this.signal.addEventListener("abort", finish, { once: true });
        }
    });
}
}