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
        // TODO: need to associate message with an id
        // for now it's anonymous

        // TODO (LEARN): take lesson on how streams work in node and for..await..of
        const getRequestBody = async req => {
            let body = "";
            for await (const chunk of req) {
                body += chunk;
            }
            return JSON.parse(body);
        };

        const data = await getRequestBody(req);
        // data.message
        // TODO: need to assign uuid to the message, save to memory, save it to disk, broadcast it to all clients
        // TODO: need to validate the request body
        data.id = randomUUID();
        data.date_created = new Date(Date.now()).toISOString();

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


















