const h1 = document.querySelector("h1");
console.log(h1.textContent);

const connect = () => {
    const ws = new WebSocket(`ws://${location.host}`);

    ws.addEventListener("open", () => {
        console.log("connected back to the server via WebSocket");
    });

    ws.addEventListener("message", event => {
        const data = JSON.parse(event.data);
        if (data.type === "hot_reload") {
            location.reload();
        }
    });

    ws.addEventListener("close", () => {
        console.log("disconnected from WebSocket server, trying again in 500ms");
        setTimeout(connect, 500);
    });
}

connect();