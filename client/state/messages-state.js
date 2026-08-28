// this file is responsible for maintaining the state of the messages
// so it is an array of messages and functions modifying it
// for now this is just a file, but it may in the future be refactored into a class

import CallbackMachine from "./callback-machine.js";

class MessagesState extends CallbackMachine {
    #messages = [];

    setMessages(newMessages) {
        this.#messages = newMessages;
        this.executeCallbacks("messagesReset");
    }

    getMessages() {
        return this.#messages;
    }

    get length() {
        return this.#messages.length;
    }

    getMessage(id) {
        return this.#messages.find(message => message.id === id);
    }

    addMessage(newMessage) {
        this.#messages.push(newMessage);
        this.executeCallbacks("messageAdded", newMessage.id);
    }

    updateMessage(id, newMessage) {
        const index = this.#messages.findIndex(message => message.id === id);

        if (index !== -1) {
            this.#messages[index] = newMessage;
            this.executeCallbacks("messageUpdated", id);
        }
    }

    deleteMessage(id) {
        const index = this.#messages.findIndex(message => message.id === id);

        if (index !== -1) {
            this.#messages.splice(index, 1);
            this.executeCallbacks("messageDeleted", id);
        }
    }

    deleteMessages(ids) {
        const setToDelete = new Set(ids);

        this.#messages = this.#messages.filter(message => !setToDelete.has(message.id));

        this.executeCallbacks("messagesDeleted", setToDelete);
    }
}

export const messagesState = new MessagesState;









