import CallbackMachine from "./callback-machine.js";
import { messagesState } from "./messages-state.js";

class MessagesSelectState extends CallbackMachine {
    #selected = new Set;

    constructor() {
        super();

        // we want a callback here for when messages are deleted
        // in case selected items were deleted
        messagesState.registerCallback("messageDeleted", this, this.#handleMessageDeleted);
        messagesState.registerCallback("messagesDeleted", this, this.#handleMessagesDeleted);
    }

    get selected() {
        return this.#selected;
    }

    select(id) {
        this.#selected.add(id);
        this.executeCallbacks("messageSelected", id);
        this.executeCallbacks("selectionChanged");
    }

    deselect(id) {
        if (this.#selected.has(id)) {
            this.#selected.delete(id);
            this.executeCallbacks("messageDeselected", id);
            this.executeCallbacks("selectionChanged");
        }
    }

    toggle(id) {
        this.#selected.has(id) ? this.deselect(id) : this.select(id);
    }

    #handleMessageDeleted(id) {
        this.deselect(id);
    }

    #handleMessagesDeleted(idSet) {
        let changed = false;
        for (const id of idSet) {
            if (this.#selected.has(id)) {
                this.#selected.delete(id);
                changed = true;
            }
        }
        if (changed) {
            this.executeCallbacks("selectionChanged");
        }
    }
}

export const selectedState = new MessagesSelectState;





