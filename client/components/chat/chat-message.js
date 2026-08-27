// this is a ui component that needs the following properties injected to render:
// full message object
// the component should probably just be passed the message id and then seek itself the object from a client store
// will write component first as a web component and then refactor to lit

import * as messageStore from "../../state/messages-state.js";
import FetchWrapper from "../../shared/fetch-wrapper.js"

export default class ChatMessage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
    }

    connectedCallback() {
        messageStore.registerCallback("messageUpdated", this, this.messageUpdatedCallback);

        this.fullRender();
    }

    disconnectedCallback() {
        messageStore.removeAllCallbacks(this);
    }

    fullRender() {
        const message = messageStore.getMessage(this.dataset.id);

        // TODO: do this safely, I think this is vulnerable to XSS attack
        this.shadowRoot.innerHTML = `
            <li>
                ${message.message}
                <button>Delete</button>
            </li>
        `;

        const button = this.shadowRoot.querySelector("button");

        button.addEventListener("click", () => this.handleDelete());
    }

    async handleDelete() {
        await new FetchWrapper("").delete(`/messages/${this.dataset.id}`);
    }

    messageUpdatedCallback() {
        // get the new content and update the <li> directly

        const message = messageStore.getMessage(this.dataset.id);

        const li = this.shadowRoot.querySelector("li");

        li.textContent = message.message;
    }


}

window.customElements.define("chat-message", ChatMessage);


