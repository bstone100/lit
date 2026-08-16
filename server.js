import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

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

server.listen(3000);