import CallbackMachine from "./callback-machine.js";

class MessagesSelectState extends CallbackMachine {
    #selected = new Set;

    get selected() {
        return this.#selected;
    }

    select(id) {
        this.#selected.add(id);
        this.executeCallbacks("messageSelected", id);
        this.executeCallbacks("selectionChanged");
    }

    deselect(id) {
        this.#selected.delete(id);
        this.executeCallbacks("messageDeselected", id);
        this.executeCallbacks("selectionChanged");
    }

    toggle(id) {
        this.#selected.has(id) ? this.deselect(id) : this.select(id);
    }
}

export const selectedState = new MessagesSelectState;





