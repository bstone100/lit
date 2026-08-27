// this is a ui component whose job it is to render a list and fill it with <chat-message> items
// web component for now, may be changed to lit later
// NOTE: I only want data ids going into components, no prop objects allowed

import * as messageStore from "../../state/messages-state.js";
import "./chat-message.js";

export default class ChatList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
    }

    // called by the browser when this is added to the DOM
    connectedCallback() {
        // note that for now there is only one list of messages
        // in the future there will be multiple lists, each with their own id

        // TODO: refactor to use addEventListener
        messageStore.registerCallback("messagesReset", this, this.messagesResetCallback);
        messageStore.registerCallback("messageAdded", this, this.messageAddedCallback);
        messageStore.registerCallback("messageDeleted", this, this.messageDeletedCallback);

        this.fullRender();
    }

    // called by the browser when this is removed from the DOM
    disconnectedCallback() {
        messageStore.removeAllCallbacks(this);
    }

    fullRender() {
        // build the full <ul> with all messages

        const messages = messageStore.getMessages();

        this.shadowRoot.innerHTML = `
            <ul>
                ${messages.map(message => `
                    <chat-message data-id="${message.id}"></chat-message>
                `).join("")}
            </ul>
        `;
    }

    messagesResetCallback() {
        this.fullRender();
    }

    messageAddedCallback(id) {
        // add a new <chat-message> to the end of the <ul>

        const ul = this.shadowRoot.querySelector("ul");

        ul.insertAdjacentHTML("beforeend", `
            <chat-message data-id="${id}"></chat-message>
        `);
    }

    messageDeletedCallback(id) {
        // find the <chat-message> and remove it

        const chatMessage = this.shadowRoot.querySelector(`[data-id="${id}"]`);

        chatMessage.remove();
    }
}

window.customElements.define("chat-list", ChatList);



















