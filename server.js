import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { WebSocketServer, WebSocket } from "ws";
import { watch } from "node:fs";

const FILES_TO_SERVE = ["./index.html", "./index.js", "./styles.css"];

// for now the web page will just reload
// TODO: make the web page only reload the changed file
FILES_TO_SERVE.forEach(file => {
    watch(file, () => {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: "hot_reload"
                }));
            }
        });
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

    res.writeHead(404);
    res.end();
});

const wss = new WebSocketServer({server});

wss.on("connection", socket => {
    console.log("new socket connected");
});



server.listen(3000);


















