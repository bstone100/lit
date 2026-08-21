// this is a ui component responsible for the user inputting and submitting a message
// for now it will be a <form> with a <textarea> and <input>

import FetchWrapper from "../../shared/fetch-wrapper.js";

export default class ChatInput extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
    }

    connectedCallback() {
        // we need to figure out where to put the handler for the submit event of the form
        // I don't think it should live in this file
        // perhaps it should live in the file that declares a <chat-input>

        this.fullRender();
    }

    disconnectedCallback() {

    }

    fullRender() {
        this.shadowRoot.innerHTML = `
            <form>
                <textarea></textarea>
                <input type="submit" value="Send">
            </form>
        `;

        const form = this.shadowRoot.querySelector("form");
        const textarea = this.shadowRoot.querySelector("textarea");

        form.addEventListener("submit", async event => {
            event.preventDefault();

            await new FetchWrapper("").post("/messages", { message: textarea.value});

            textarea.value = "";
        });
    }
}

window.customElements.define("chat-input", ChatInput);
















