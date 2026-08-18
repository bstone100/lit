import { createServer, startServer, startHotReload } from "./server.js";

const { server, wss } = await createServer("./messages.json");

startHotReload(wss);

await startServer(server, 3000);