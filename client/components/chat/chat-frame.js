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
            <style>
                div {
                    border: 2px dashed lightblue;
                    border-radius: 10px;
                    padding: 16px;
                }
            </style>
            <div>
                <chat-list></chat-list>
                <chat-input></chat-input>
            </div>
        `;
    }
}

window.customElements.define("chat-frame", ChatFrame);