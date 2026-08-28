import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer, startServer, stopServer } from "./server.js";
import FetchWrapper from "../client/shared/fetch-wrapper.js";
import WebSocketWrapper from "../client/shared/websocket-wrapper.js";

let server;
let baseURL;
let API;
let ws;

before(async () => {
    const { server: s } = await createServer("./server/test-messages.json", []);
    server = s;
    await startServer(server, 0);
    baseURL = "http://localhost:" + server.address().port;
    API = new FetchWrapper(baseURL);
    ws = new WebSocketWrapper(`ws://localhost:${server.address().port}`);
    await ws.connect();
});

after(async () => {
    await ws.disconnect();
    await stopServer(server);
});

test("Probe the page served by the server", async () => {

    const checkFile = async (url, content) => {
        const response = await fetch(`${baseURL}${url}`);
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
        }
    ];

    await Promise.all(checks.map(check => checkFile(check.url, check.content)));
});

const postMessage = async () => {
    return API.post("/messages", {
        message: "Hello Ben!"
    });
}

const deleteMessage = async (id) => {
    return API.delete(`/messages/${id}`);
}

const deleteMessages = async (ids) => {
    return API.delete("/messages", ids);
}

const getMessages = async () => {
    return API.get("/messages");
}

const patchMessage = async (id) => {
    return API.patch(`/messages/${id}`, {
        message: "Ben, hi!"
    });
}

test("test POST /messages is 201", async () => {
    // post the item
    const testMessage = {
        message: "Hello Ben!"
    };

    const postResponse = await fetch(`${baseURL}/messages`, {
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
    await deleteMessage(id);
});

test("WebSocket: server should broadcast message_created event with body equal to POST /messages response", async () => {
    const [ fetchData, wsData ] = await Promise.all([ postMessage(), ws.expectBroadcast("message_created") ]);

    assert.deepEqual(fetchData, wsData);

    await deleteMessage(fetchData.id);
});


test("test PATCH /messages/:id is 200", async () => {
    // post an item
    const message = await postMessage();

    const newMessage = {
        message: "This content is different from the previous content"
    };

    const response = await fetch(`${baseURL}/messages/${message.id}`, {
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

test("WebSocket: server should broadcast message_updated with body equal to PATCH /messages/:id response", async () => {
    const message = await postMessage();

    const [ fetchData, wsData ] = await Promise.all([ patchMessage(message.id), ws.expectBroadcast("message_updated")]);

    assert.deepEqual(fetchData, wsData);

    await deleteMessage(message.id);
});

test("test DELETE /messages/:id is 204", async () => {
    // make a message
    const message = await postMessage();

    // delete it
    const response = await fetch(`${baseURL}/messages/${message.id}`, {
       method: "DELETE"
    });
    assert.equal(response.status, 204);

    // ensure it's not still there
    const messages = await getMessages();
    assert.ok(messages.find(m => m.id === message.id) === undefined);
});

test("WebSocket: server should broadcast message_deleted alongside DELETE /messages/:id", async () => {
    const message = await postMessage();

    const [ fetchData, wsData ] = await Promise.all([ deleteMessage(message.id), ws.expectBroadcast("message_deleted")]);

    assert.equal(wsData.id, message.id);
});

test("test DELETE /messages with multiple messages is 204", async () => {
    // make two messages
    const message1 = await postMessage();
    const message2 = await postMessage();

    // delete them both in one request
    const response = await fetch(`${baseURL}/messages`, {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify([message1.id, message2.id])
    });
    assert.equal(response.status, 204);

    // ensure they are both gone
    const messages = await getMessages();
    assert.equal(messages.find(message => message.id === message1.id), undefined);
    assert.equal(messages.find(message => message.id === message2.id), undefined);
});

test("WebSocket: server should broadcast messages_deleted alongside DELETE /messages", async () => {
    const message1 = await postMessage();
    const message2 = await postMessage();
    const ids = [message1.id, message2.id];

    // in parallel: send the DELETE request and wait for the WebSocket message
    const [ fetchResponse, wsData ] = await Promise.all([deleteMessages(ids), ws.expectBroadcast("messages_deleted")]);

    assert.deepEqual(wsData, ids);
});

test("test GET /messages is 200", async () => {
    // add a message
    const message = await postMessage();

    const response = await fetch(`${baseURL}/messages`);
    const data = await response.json();
    assert.equal(response.status, 200);
    assert.ok(Array.isArray(data));
    assert.ok(data.find(m => m.id === message.id));

    await deleteMessage(message.id);
});






























