// this is a ui component that needs the following properties injected to render:
// full message object
// the component should probably just be passed the message id and then seek itself the object from a client store
// will write component first as a web component and then refactor to lit

import * as messageStore from "../../state/messages-state.js";

export default class ChatMessage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
    }

    connectedCallback() {
        // should get message id from attribute
        // then get message object from store
        // then need to construct html and set the innerHTML of the shadow root to it
        // reach into a client side messages store and extract the message object
        // need to be notified when the message changes
        // the message store should notify us here
        // style should be defined here

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
            <li>${message.message}</li>
        `;
    }

    messageUpdatedCallback() {
        // get the new content and update the <li> directly

        const message = messageStore.getMessage(this.dataset.id);

        const li = this.shadowRoot.querySelector("li");

        li.textContent = message.message;
    }


}

window.customElements.define("chat-message", ChatMessage);


