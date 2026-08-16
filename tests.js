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
            content: "color: red;"
        },
        {
            url: "/index.js",
            content: "document.querySelector"
        }
    ];

    await Promise.all(checks.map(check => checkFile(check.url, check.content)));
});