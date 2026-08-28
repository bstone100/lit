import { messagesState } from "./state/messages-state.js";
import "./components/chat/chat-frame.js";
import WebSocketWrapper from "./shared/websocket-wrapper.js";



const loadMessages = async () => {
    const response = await fetch("/messages");
    const data = await response.json();

    messagesState.setMessages(data);
}

const connect = () => {
    const ws = new WebSocket(`ws://${location.host}`);

    ws.addEventListener("open", () => {
        console.log("connected back to the server via WebSocket");
    });

    ws.addEventListener("message", event => {
        const data = JSON.parse(event.data);
        switch(data.type) {
            case "hot_reload": {
                location.reload();
                return;
            }
            case "message_created": {
                messagesState.addMessage(data.body);
                break;
            }
            case "message_updated": {
                messagesState.updateMessage(data.body.id, data.body);
                break;
            }
            case "message_deleted": {
                messagesState.deleteMessage(data.body.id);
                break;
            }
            case "messages_deleted": {
                messagesState.deleteMessages(data.body);
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














