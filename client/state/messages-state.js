// this file is responsible for maintaining the state of the messages
// so it is an array of messages and functions modifying it
// for now this is just a file, but it may in the future be refactored into a class

let messages = [];

export const setMessages = newMessages => {
    messages = newMessages;
}

export const getMessages = () => {
    return messages;
}

export const addMessage = newMessage => {
    messages.push(newMessage);
}

export const updateMessage = (id, newMessage) => {
    const index = messages.findIndex(message => message.id === id);

    if (index !== -1) {
        messages[index] = newMessage;
    }
}

export const deleteMessage = id => {
    const index = messages.findIndex(message => message.id === id);

    if (index !== -1) {
        messages.splice(index, 1);
    }
}

export const getMessage = id => {
    return messages.find(message => message.id === id);
}













