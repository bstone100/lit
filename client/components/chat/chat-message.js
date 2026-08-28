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
        messagesState.registerCallback("messageUpdated", this, this.messageUpdatedCallback);

        this.fullRender();
    }

    disconnectedCallback() {
        messagesState.removeAllCallbacks(this);
    }

    fullRender() {
        const message = messagesState.getMessage(this.dataset.id);

        // TODO: do this safely, I think this is vulnerable to XSS attack
        this.shadowRoot.innerHTML = `
            <style>
                li {
                    border: 3px dotted lightgreen;
                    border-radius: 5px;
                    margin: 5px 0;
                }
            </style>
            <li>
                <input type="checkbox">
                ${message.message}
                <button>Delete</button>
            </li>
        `;

        const button = this.shadowRoot.querySelector("button");

        button.addEventListener("click", () => this.handleDelete());

        const checkbox = this.shadowRoot.querySelector("input");

        checkbox.addEventListener("change", () => {
            selectedState.toggle(this.dataset.id);
        });
    }

    async handleDelete() {
        await new FetchWrapper("").delete(`/messages/${this.dataset.id}`);
    }

    messageUpdatedCallback(id) {
        if (id !== this.dataset.id) return;

        // get the new content and update the <li> directly

        const message = messagesState.getMessage(this.dataset.id);

        const li = this.shadowRoot.querySelector("li");

        li.textContent = message.message;
    }


}

window.customElements.define("chat-message", ChatMessage);


