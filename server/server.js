import http from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { WebSocketServer, WebSocket } from "ws";
import { watch } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";


// TODO: refactor so that we're serving all files in a chosen directory
const FILES_TO_SERVE = ["../client/index.html", "../client/index.js", "../client/styles.css"];

// algorithm for a safe file server:
// 1. construct the valid paths using path.join on process.cwd() and the relative dir paths
// 2. construct the query path using path.join on process.cwd() and the query path (decoded)
// 3. ensure that the query path starts with a valid path
// const DIRECTORIES_TO_SERVE = ["../client, ../shared"];

// NOTE: process.cwd should be project root
const DIRECTORY_TO_SERVE = path.join(process.cwd(), "/client/");
const DEFAULT_FILE = path.join(DIRECTORY_TO_SERVE, "/index.html");


const sendMessage = (client, data) => {
    if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
    }
}

const broadcastWSS = (wss, data) => {
    wss.clients.forEach(client => sendMessage(client, data));
}

// TODO: make the web page only reload the changed file
// TODO: need to set up hot reload for everything underneath served files
export const startHotReload = wss => {
    return watch(DIRECTORY_TO_SERVE, { recursive: true }, () => broadcastWSS(wss, { type: "hot_reload" }));
}

export const stopHotReload = watcher => {
    watcher.close();
}

export const createServer = async (saveFile, initialData) => {
    let messages;

    const loadMessages = async () => {
        try {
            const data = await readFile(saveFile, "utf-8");
            messages = JSON.parse(data);
        } catch (error) {
            messages = [];
        }
    }

    if (initialData) {
        messages = initialData;
    } else {
        await loadMessages();
    }

    const saveMessages = async () => {
        await writeFile(saveFile, JSON.stringify(messages, null, 2));
    }

    // TODO (LEARN): take lesson on how streams work in node and for..await..of
    const getRequestBody = async req => {
        let body = "";
        for await (const chunk of req) {
            body += chunk;
        }
        return JSON.parse(body);
    };

    const server = http.createServer(async (req, res) => {
        if (req.method === "GET" && req.url === "/messages") {
            // send back the messages array with 200

            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify(messages));
            return;
        }
        if (req.method === "GET" && req.url.includes("/messages/")) {
            const id = req.url.split("/")[2];
            const message = messages.find(m => m.id === id);

            if (!message) {
                res.writeHead(404, {"Content-Type": "text/plain"});
                res.end("Message not found");
                return;
            }

            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify(message));
            return;
        }
        if (req.method === "GET") {

            let requestedPath = path.join(DIRECTORY_TO_SERVE, req.url);

            if (requestedPath === DIRECTORY_TO_SERVE) {
                requestedPath = DEFAULT_FILE
            }

            // this check is to prevent a path traversal attack where the req url does ../../.. to reach into server
            const isPathAttack = requestedPath.startsWith(DIRECTORY_TO_SERVE) === false;

            if (isPathAttack) {
                res.writeHead(404);
                res.end();
                return;
            }

            const pathToExt = p => {
                const ext = path.parse(p).ext;

                const exts = {
                    ".html": "text/html",
                    ".js": "text/javascript",
                    ".css": "text/css"
                }

                return exts[ext] ?? "text/plain";
            }

            try {
                const data = await readFile(requestedPath, "utf-8");
                res.writeHead(200, {"Content-Type": pathToExt(requestedPath)});
                res.end(data);
                return;
            } catch (err) {
                res.writeHead(404, {"Content-Type": "text/plain"});
                res.end(err.message);
                return;
            }
        }
        if (req.method === "POST" && req.url === "/messages") {
            // TODO: need to associate message with a user id
            // for now it's anonymous
            const data = await getRequestBody(req);
            // data.message
            // TODO: need to validate the request body
            data.id = randomUUID();
            data.date_created = new Date().toISOString();

            messages.push(data);

            await saveMessages();

            broadcast({
                type: "message_created",
                body: data
            });

            res.writeHead(201, {"Content-Type": "application/json"});
            res.end(JSON.stringify(data));
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
                    body: {
                        id
                    }
                });
                res.writeHead(204);
                res.end();
                return;
            }
            res.writeHead(404, {"Content-Type": "text/plain"});
            res.end("Message not found");
            return;
        }
        if (req.method === "DELETE" && req.url === "/messages") {
            const data = await getRequestBody(req); // [id, id, id]

            const setToDelete = new Set(data);
            messages = messages.filter(message => !setToDelete.has(message.id));

            await saveMessages();
            broadcast({
                type: "messages_deleted",
                body: data
            });
            res.writeHead(204);
            res.end();
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
                type: "message_updated",
                body: message
            });
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify(message));
            return;
        }

        res.writeHead(404);
        res.end();
    });

    const wss = new WebSocketServer({server});

    const broadcast = data => {
        broadcastWSS(wss, data);
    }

    wss.on("connection", socket => {
        console.log("new socket connected");
    });

    // return server;
    return { server, wss };
}

export const startServer = (server, port) => {
    return new Promise(resolve => server.listen(port, resolve));
}

export const stopServer = server => {
    return new Promise(resolve => server.close(resolve));
}



















