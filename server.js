import { createServer } from "node:http";

const server = createServer(async (req, res) => {
    if (req.method === "GET") {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end("Hello Ben, nice job on your server!");
        return;
    }

    res.writeHead(404);
    res.end();
});

server.listen(3000);