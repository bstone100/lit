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
            <style>
                form {
                    border: 2px dashed orange;
                    border-radius: 5px;
                    padding: 10px;
                }
            </style>
            <form>
                <input type="text" name="message" required>
                <input type="submit" value="Send" disabled>
            </form>
        `;

        const form = this.shadowRoot.querySelector("form");
        const input = form.querySelector(`input[type="text"]`);
        const button = form.querySelector(`input[type="submit"]`);

        form.addEventListener("submit", async event => {
            event.preventDefault();

            const formData = new FormData(form);

            await new FetchWrapper("").post("/messages", { message: formData.get("message")});

            input.value = "";
            button.setAttribute("disabled", "disabled");
        });

        input.addEventListener("input", () => {
            input.value.length > 0 ? button.removeAttribute("disabled") : button.setAttribute("disabled", "disabled");
        });
    }
}

window.customElements.define("chat-input", ChatInput);
















