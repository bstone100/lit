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
                ul {
                    box-sizing: border-box;
                    height: 200px;
                    overflow: auto;
                    border: 1px dotted red;
                }
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

        // save rects of all lis that are currently visible and not deleted
        const ul = this.shadowRoot.querySelector("ul");
        const ulRect = ul.getBoundingClientRect();
        const lis = this.shadowRoot.querySelectorAll("li");
        const windowRects = new Map;
        lis.forEach(li => {
            if (deletedIdsSet.has(li.dataset.id)) return;
            const liRect = li.getBoundingClientRect();
            const shadowTop = ulRect.top - ulRect.height / 2;
            const shadowBottom = ulRect.bottom + ulRect.height / 2;
            const isInWindow = liRect.top > shadowTop && liRect.bottom < shadowBottom;
            if (isInWindow) {
                windowRects.set(li, liRect);
            }
        });

        // remove deleted lis
        lis.forEach(li => {
            if (deletedIdsSet.has(li.dataset.id)) {
                li.remove();
            }
        });

        // animate the windowed rects into their new pos
        windowRects.forEach((oldRect, li) => {
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



















