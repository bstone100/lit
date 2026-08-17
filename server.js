import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { WebSocketServer, WebSocket } from "ws";
import { watch } from "node:fs";
import { randomUUID } from "node:crypto";

const FILES_TO_SERVE = ["./index.html", "./index.js", "./styles.css"];
const MESSAGES_SAVE_FILE = "./messages.json";

let messages;

const loadMessages = async () => {
    try {
        const data = await readFile(MESSAGES_SAVE_FILE, "utf-8");
        messages = JSON.parse(data);
    } catch (error) {
        messages = [];
    }
}

await loadMessages();

const saveMessages = async () => {
    await writeFile(MESSAGES_SAVE_FILE, JSON.stringify(messages, null, 2));
}

// for now the web page will just reload
// TODO: make the web page only reload the changed file
FILES_TO_SERVE.forEach(file => {
    watch(file, () => {
        broadcast({type: "hot_reload"});
    });
});

// TODO (LEARN): take lesson on how streams work in node and for..await..of
const getRequestBody = async req => {
    let body = "";
    for await (const chunk of req) {
        body += chunk;
    }
    return JSON.parse(body);
};

const server = createServer(async (req, res) => {
    if (req.method === "GET") {
        if (req.url === "/" || req.url === "/index.html") {
            const data = await readFile("./index.html", "utf-8");
            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(data);
            return;
        }
        if (req.url === "/index.js") {
            const data = await readFile("./index.js", "utf-8");
            res.writeHead(200, {"Content-Type": "text/javascript"});
            res.end(data);
            return;
        }
        if (req.url === "/styles.css") {
            const data = await readFile("./styles.css", "utf-8");
            res.writeHead(200, {"Content-Type": "text/css"});
            res.end(data);
            return;
        }
    }
    if (req.method === "POST" && req.url === "/messages") {
        // need to get body of message
        // TODO: need to associate message with a user id
        // for now it's anonymous
        const data = await getRequestBody(req);
        // data.message
        // TODO: need to assign uuid to the message, save to memory, save it to disk, broadcast it to all clients
        // TODO: need to validate the request body
        data.id = randomUUID();
        data.date_created = new Date().toISOString();

        messages.push(data);

        await saveMessages();

        broadcast({
            type: "new_message",
            ...data
        });

        res.writeHead(201, {"Content-Type": "application/json"});
        res.end(JSON.stringify(data));
        return;
    }
    if (req.method === "GET" && req.url === "/messages") {
        // send back the messages array with 200

        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(messages));
        return;
    }
    if (req.method === "DELETE" && req.url.includes("/messages/")) {
        // get id from url, delete, 204
        const id = req.url.split("/")[2];
        const message = messages.find(message => message.id === id);
        if (message) {
            // TODO: see if better way to remove item
            messages = messages.filter(message => message.id !== id);
            await saveMessages();
            broadcast({
                type: "message_deleted",
                id
            });
            res.writeHead(204);
            res.end();
            return;
        }
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.end("Message not found");
        return;
    }
    if (req.method === "PATCH" && req.url.includes("/messages/")) {
        const id = req.url.split("/")[2];
        const message = messages.find(message => message.id === id);
        if (!message) {
            res.writeHead(404, {"Content-Type": "text/plain"});
            res.end("Message not found");
            return;
        }
        const data = await getRequestBody(req);
        // TODO: verify data shape and new message
        // TODO: verify that modifying message modifies messages
        // historical
        if (!message.versions) message.versions = [];
        message.versions.push({
            message: message.message,
            date_created: message.date_modified ?? message.date_created
        });
        message.message = data.message; // current
        message.date_modified = new Date().toISOString(); // current
        await saveMessages();
        broadcast({
            type: "message_patched",
            ...message
        });
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(message));
        return;
    }

    res.writeHead(404);
    res.end();
});

const wss = new WebSocketServer({server});

const sendMessage = (client, data) => {
    if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
    }
}

const broadcast = data => {
    wss.clients.forEach(client => sendMessage(client, data));
}

wss.on("connection", socket => {
    console.log("new socket connected");

    sendMessage({type: "hello"});
    socket.send(JSON.stringify({
        type: "hello"
    }));
});

server.listen(3000);


















