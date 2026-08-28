// this is a ui component whose job it is to render a list and fill it with <chat-message> items
// web component for now, may be changed to lit later
// NOTE: I only want data ids going into components, no prop objects allowed

import { messagesState } from "../../state/messages-state.js";
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
        messagesState.registerCallback("messagesReset", this, this.#messagesResetCallback);
        messagesState.registerCallback("messageAdded", this, this.#messageAddedCallback);
        messagesState.registerCallback("messageDeleted", this, this.#messageDeletedCallback);
        messagesState.registerCallback("messagesDeleted", this, this.#messagesDeletedCallback);

        this.fullRender();
    }

    // called by the browser when this is removed from the DOM
    disconnectedCallback() {
        messagesState.removeAllCallbacks(this);
    }

    fullRender() {
        // build the full <ul> with all messages

        const messages = messagesState.getMessages();

        this.shadowRoot.innerHTML = `
            <style>
                li {
                    margin: 10px;
                }
            </style>
            <ul>
                ${messages.map(message => this.#makeMessageHTML(message.id)).join("")}
            </ul>
        `;
    }

    #makeMessageHTML(id) {
        return `
            <li data-id="${id}">
                <chat-message data-id="${id}"></chat-message>
            </li>
        `;
    }

    #messagesResetCallback() {
        this.fullRender();
    }

    #messageAddedCallback(id) {
        // add a new <chat-message> to the end of the <ul>

        const ul = this.shadowRoot.querySelector("ul");

        ul.insertAdjacentHTML("beforeend", this.#makeMessageHTML(id));
    }

    #messageDeletedCallback(id) {
        this.#messagesDeletedCallback(new Set([id]));
    }

    #messagesDeletedCallback(deletedIdsSet) {

        // save rects of all lis
        const lis = this.shadowRoot.querySelectorAll("li");
        const rects = new Map;
        lis.forEach(li => rects.set(li.dataset.id, li.getBoundingClientRect()));

        // remove deleted lis
        lis.forEach(li => {
            if (deletedIdsSet.has(li.dataset.id)) {
                li.remove();
            }
        });

        // animate remaining lis into their new place
        lis.forEach(li => {
            if (deletedIdsSet.has(li.dataset.id)) return;

            const oldRect = rects.get(li.dataset.id);
            const newRect = li.getBoundingClientRect();
            const dY = oldRect.y - newRect.y;

            if (dY === 0) return;

            li.animate([
                {transform: `translateY(${dY}px)`},
                {transform: "translateY(0)"}
            ], {
                duration: 150,
                easing: "ease-out"
            });
        });
    }
}

window.customElements.define("chat-list", ChatList);



















