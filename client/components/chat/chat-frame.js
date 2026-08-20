// this is a ui component that holds the different pieces of the chat ui
import "./chat-list.js";
import "./chat-input.js";

export default class ChatFrame extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <chat-list></chat-list>
            <chat-input></chat-input>
        `;
    }
}

window.customElements.define("chat-frame", ChatFrame);