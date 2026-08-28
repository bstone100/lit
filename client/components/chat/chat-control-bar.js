import FetchWrapper from "../../shared/fetch-wrapper.js";
import { selectedState } from "../../state/messages-select-state.js";

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

        // need to be notified by the selectedState when the selection changes
        selectedState.registerCallback("selectionChanged", this, () => {
            button.disabled = selectedState.selected.size === 0;
        });

        selectedState.registerCallback()

        button.addEventListener("click", async () => {
            await new FetchWrapper("").delete("/messages", [...selectedState.selected]);
        });
    }

    disconnectedCallback() {
        selectedState.removeAllCallbacks();
    }
}

window.customElements.define("chat-control-bar", ChatControlBar);