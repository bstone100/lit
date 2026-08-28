// this is a ui component that needs the following properties injected to render:
// full message object
// the component should probably just be passed the message id and then seek itself the object from a client store
// will write component first as a web component and then refactor to lit

import { messagesState } from "../../state/messages-state.js";
import FetchWrapper from "../../shared/fetch-wrapper.js"
import { selectedState } from "../../state/messages-select-state.js";

export default class ChatMessage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
    }

    connectedCallback() {
        messagesState.registerCallback("messageUpdated", this, this.#messageUpdatedCallback);

        selectedState.registerCallback("selectAllExecuted", this, this.#selectAllCallback);
        selectedState.registerCallback("deselectAllExecuted", this, this.#deselectAllCallback);

        this.fullRender();
    }

    disconnectedCallback() {
        messagesState.removeAllCallbacks(this);
        selectedState.removeAllCallbacks(this);
    }

    fullRender() {
        const message = messagesState.getMessage(this.dataset.id);

        this.shadowRoot.innerHTML = `
            <input type="checkbox" ${selectedState.isSelected(this.dataset.id) ? "checked" : ""}>
            <span></span>
            <button>Delete</button>
        `;

        this.span.textContent = message.message;

        this.deleteButton.addEventListener("click", () => this.handleDelete());

        this.checkbox.addEventListener("change", () => {
            selectedState.toggle(this.dataset.id);
        });
    }

    get checkbox() {
        return this.shadowRoot.querySelector("input");
    }

    get deleteButton() {
        return this.shadowRoot.querySelector("button");
    }

    get span() {
        return this.shadowRoot.querySelector("span");
    }

    async handleDelete() {
        await new FetchWrapper("").delete(`/messages/${this.dataset.id}`);
    }

    #messageUpdatedCallback(id) {
        if (id !== this.dataset.id) return;

        const message = messagesState.getMessage(this.dataset.id);
        this.span.textContent = message.message;
    }

    #selectAllCallback() {
        this.checkbox.checked = true;
    }

    #deselectAllCallback() {
        this.checkbox.checked = false;
    }
}

window.customElements.define("chat-message", ChatMessage);


