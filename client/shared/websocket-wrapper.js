export default class WebSocketWrapper {
    #ws;

    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    connect() {
        this.#ws = new WebSocket(this.baseURL);

        return new Promise((resolve, reject) => {
            this.#ws.addEventListener("open", resolve);
            this.#ws.addEventListener("close", reject);
        });
    }

    disconnect() {
        this.#ws.close();

        return new Promise((resolve, reject) => {
            this.#ws.addEventListener("close", resolve);
        });
    }

    // expect message of type to be broadcasted
    expectBroadcast(type) {
        return new Promise((resolve, reject) => {
            this.#ws.addEventListener("message", event => {
                const data = JSON.parse(event.data);
                if (data.type === type) {
                    resolve(data.body);
                }
            });
        });
    }
}