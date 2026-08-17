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

test("test POST /messages is 201", async () => {
    // post the item
    const testMessage = {
        message: "Hello Ben!"
    };

    const postResponse = await fetch("http://localhost:3000/messages", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(testMessage)
    });
    assert.equal(postResponse.status, 201);
    const postResponseData = await postResponse.json();
    const id = postResponseData.id;
    assert.ok(id.length > 0);

    // get the items and ensure the posted one is there
    const messageList = await getMessages();
    const foundMessage = messageList.find(message => message.id === id);
    assert.ok(foundMessage);
    assert.equal(foundMessage.message, testMessage.message);

    // delete the item
    await deleteMessage();
});


const postMessage = async () => {
    const testMessage = {
        message: "Hello Ben!"
    };
    const response = await fetch("http://localhost:3000/messages", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(testMessage)
    });
    return response.json();
}

const deleteMessage = async (id) => {
    await fetch(`http://localhost:3000/messages/${id}`, {
        method: "DELETE"
    });
}

const getMessages = async () => {
    const response = await fetch("http://localhost:3000/messages");
    return response.json();
}

const patchMessage = async (id, newMessage) => {
    const response = await fetch(`http://localhost3000/messages/${id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            message: newMessage
        })
    });
    return response.json();
}

test("test PATCH /messages/:id is 200", async () => {
    // post an item
    const message = await postMessage();

    const newMessage = {
        message: "This content is different from the previous content"
    };

    const response = await fetch(`http://localhost:3000/messages/${message.id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(newMessage)
    });
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(data.message, newMessage.message);
    // TODO: ensure date modified > date created

    // get list and ensure item updated there
    const messages = await getMessages();
    const foundMessage = messages.find(message => message.id === data.id);
    assert.ok(foundMessage);
    assert.equal(foundMessage.message, newMessage.message);
    assert.equal(foundMessage.versions[0].message, message.message);
    assert.equal(foundMessage.versions[0].date_created, message.date_created);

    await deleteMessage(message.id);
});



































