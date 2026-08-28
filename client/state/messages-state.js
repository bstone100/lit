// this file is responsible for maintaining the state of the messages
// so it is an array of messages and functions modifying it
// for now this is just a file, but it may in the future be refactored into a class

let messages = [];

let callbackRegistry = {};

export const registerCallback = (event, caller, callback) => {
    if (!callbackRegistry[event]) {
        callbackRegistry[event] = [];
    }
    callbackRegistry[event].push({
        caller,
        callback
    });
}

const executeCallbacks = (event, ...args) => {
    callbackRegistry[event].forEach(registeredCallback => {
        const { caller, callback } = registeredCallback;
        callback.call(caller, ...args);
    });
}

export const removeCallback = (event, caller, callback) => {
    const index = callbackRegistry[event].findIndex(c => c.caller === caller && c.callback === callback);
    callbackRegistry[event].splice(index, 1);
}

export const removeAllCallbacks = caller => {
    for (const event in callbackRegistry) {
        callbackRegistry[event] = callbackRegistry[event].filter(c => c.caller !== caller);
    }
}

export const setMessages = newMessages => {
    messages = newMessages;
    executeCallbacks("messagesReset");
}

export const getMessages = () => {
    return messages;
}

export const getMessage = id => {
    return messages.find(message => message.id === id);
}

export const addMessage = newMessage => {
    messages.push(newMessage);
    executeCallbacks("messageAdded", newMessage.id);
}

export const updateMessage = (id, newMessage) => {
    const index = messages.findIndex(message => message.id === id);

    if (index !== -1) {
        messages[index] = newMessage;
        executeCallbacks("messageUpdated", id);
    }
}

export const deleteMessage = id => {
    const index = messages.findIndex(message => message.id === id);

    if (index !== -1) {
        messages.splice(index, 1);
        executeCallbacks("messageDeleted", id);
    }
}

export const deleteMessages = ids => {
    const setToDelete = new Set(ids);

    messages = messages.filter(message => !setToDelete.has(message.id));

    executeCallbacks("messagesDeleted", setToDelete);
}












