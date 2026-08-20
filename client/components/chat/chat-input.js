// this is a ui component responsible for the user inputting and submitting a message
// for now it will be a <form> with a <textarea> and <input>

export default class ChatInput extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <form>
                <textarea></textarea>
                <input type="submit" value="Send">
            </form>
        `;
    }
}

window.customElements.define("chat-input", ChatInput);