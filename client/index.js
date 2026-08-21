import * as messageStore from "./state/messages-state.js";
import "./components/chat/chat-frame.js";
import WebSocketWrapper from "./shared/websocket-wrapper.js";

// TODO: we need an abstraction that lets the message store notify web components that its data has changed
// TODO: we need an abstraction that lets the web components notify the app of events

const form = document.querySelector("#form_message");
const textarea = document.querySelector("#textarea_message");

form.addEventListener("submit", async event => {
    event.preventDefault();
    // send request to POST /messages

    const response = await fetch("/messages", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            message: textarea.value
        })
    });
    if (response.status === 201) {
        form.reset();
    } else {
        // TODO: show message to user that the request failed
    }
});

const template = document.querySelector("#template_message");
const list = document.querySelector("#ul_messages");

const addMessage = message => {
    // add a new <li> to the <ul> using the template
    // TODO: extract the message item into a reusable web component
    const clone = template.content.cloneNode(true);
    const li = clone.querySelector("li");
    li.textContent = message;
    list.appendChild(li);
}

const loadMessages = async () => {
    const response = await fetch("/messages");
    const data = await response.json();

    messageStore.setMessages(data);

    list.innerHTML = "";
    data.forEach(item => addMessage(item.message));
}

const connect = () => {
    const ws = new WebSocket(`ws://${location.host}`);

    ws.addEventListener("open", () => {
        console.log("connected back to the server via WebSocket");
    });

    ws.addEventListener("message", event => {
        const data = JSON.parse(event.data);
        if (data.type === "hot_reload") {
            location.reload();
            return;
        }
        if (data.type === "message_created") {
            addMessage(data.body.message);
        }

        switch(data.type) {
            case "hot_reload": {
                location.reload();
                return;
            }
            case "message_created": {
                messageStore.addMessage(data.body);
                break;
            }
            case "message_updated": {
                messageStore.updateMessage(data.body.id, data.body);
                break;
            }
            case "message_deleted": {
                messageStore.deleteMessage(data.body.id);
                break;
            }
        }

    });

    ws.addEventListener("close", () => {
        console.log("disconnected from WebSocket server, trying again in 500ms");
        setTimeout(connect, 500);
    });
}

connect();

await loadMessages();














