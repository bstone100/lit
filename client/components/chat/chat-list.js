// this is a ui component whose job it is to render a list and fill it with <chat-message> items
// web component for now, may be changed to lit later

import * as messageStore from "../../state/messages-state.js";

export default class ChatList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
    }

    connectedCallback() {
        // get the list of messages
        // note that for now there is only one list of messages
        // in the future there will be multiple lists, each with their own id

        const messages = messageStore.getMessages();

        this.shadowRoot.innerHTML = `
            <ul>
                ${messages.map(message => `
                    <chat-message data-id="${message.id}"></chat-message>
                `)}
            </ul>
        `;
    }
}

window.customElements.define("chat-list", ChatList);