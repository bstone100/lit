import { test } from "node:test";
import assert from "node:assert/strict";


test("Probe server", async () => {
    const response = await fetch("http://localhost:3000/");
    assert.equal(response.status, 200);
    const data = await response.text();
    assert.equal(data, "Hello Ben, nice job on your server!");
});
