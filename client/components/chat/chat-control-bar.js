
export default class ChatControlBar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <button disabled>Delete Selected</button>
        `;

        const button = this.shadowRoot.querySelector("button");

        button.addEventListener("click", () => {
            // send bulk delete
            // need to access the selected items
            //


        });
    }
}

window.customElements.define("chat-control-bar", ChatControlBar);