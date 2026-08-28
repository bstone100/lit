import FetchWrapper from "../../shared/fetch-wrapper.js";
import { selectedState } from "../../state/messages-select-state.js";
import { messagesState } from "../../state/messages-state.js";

export default class ChatControlBar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <style>
                div {
                    border: 2px dashed lightgrey;
                    border-radius: 5px;
                    padding: 5px;
                }
            </style>
            <div>
                <button id="selectAll">Select All</button>
                <button id="deselectAll">Deselect All</button>
                <button id="deleteSelected">Delete Selected</button>
            </div>
        `;

        this.#updateDeleteButtonDisabled();
        this.#updateDeselectAllButtonDisabled();
        this.#updateSelectAllButtonDisabled();

        selectedState.registerCallback("selectionChanged", this, this.#updateDeleteButtonDisabled);
        selectedState.registerCallback("selectionChanged", this, this.#updateDeselectAllButtonDisabled);
        selectedState.registerCallback("selectionChanged", this, this.#updateSelectAllButtonDisabled);

        messagesState.registerCallback("messageAdded", this, this.#updateSelectAllButtonDisabled);
        messagesState.registerCallback("messagesReset", this, this.#updateSelectAllButtonDisabled);

        this.deleteButton.addEventListener("click", async () => {
            await new FetchWrapper("").delete("/messages", selectedState.getSelected());
        });

        this.selectAllButton.addEventListener("click", () => {
            selectedState.selectAll();
        });

        this.deselectAllButton.addEventListener("click", () => {
            selectedState.deselectAll();
        });
    }

    disconnectedCallback() {
        selectedState.removeAllCallbacks();
        messagesState.removeAllCallbacks();
    }

    get deselectAllButton() {
        return this.shadowRoot.querySelector("#deselectAll");
    }

    get selectAllButton() {
        return this.shadowRoot.querySelector("#selectAll");
    }

    get deleteButton() {
        return this.shadowRoot.querySelector("#deleteSelected");
    }

    #updateDeleteButtonDisabled() {
        this.deleteButton.disabled = selectedState.size === 0;
    }

    #updateDeselectAllButtonDisabled() {
        this.deselectAllButton.disabled = selectedState.size === 0;
    }

    #updateSelectAllButtonDisabled() {
        // disabled only when everything selected already
        this.selectAllButton.disabled = selectedState.size === messagesState.length;
    }
}

window.customElements.define("chat-control-bar", ChatControlBar);