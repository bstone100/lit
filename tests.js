import { test } from "node:test";
import assert from "node:assert/strict";

const BASE_URL = "http://localhost:3000";

test("Probe the page served by the server", async () => {

    const checkFile = async (url, content) => {
        const response = await fetch(`${BASE_URL}${url}`);
        assert.equal(response.status, 200);
        const data = await response.text();
        assert.ok(data.includes(content));
    }

    // content is an excerpt from the file
    const checks = [
        {
            url: "/",
            content: "<title>Ben's Server</title>"
        },
        {
            url: "/index.html",
            content: "<title>Ben's Server</title>"
        },
        {
            url: "/styles.css",
            content: "h1"
        },
        {
            url: "/index.js",
            content: "document.querySelector"
        }
    ];

    await Promise.all(checks.map(check => checkFile(check.url, check.content)));
});

test("probe the WebSocket server", async () => {
    const ws = new WebSocket("ws://localhost:3000");

    const waitForMessage = () => {
        return new Promise((resolve, reject) => {
            const id = setTimeout(reject, 1000);

            ws.addEventListener("message", event => {
                const data = JSON.parse(event.data);
                clearTimeout(id);
                resolve(data);
            });
        });
    }

    try {
        const data = await waitForMessage();
        assert.equal(data.type, "hello");
    } catch (err) {
        assert.ok(false);
    }

    ws.close();
});

test("");










