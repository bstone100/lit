const h1 = document.querySelector("h1");
console.log(h1.textContent);

const state = {
    count: 0
};

const count = document.querySelector("#label_count");
const add = document.querySelector("#button_add");
const subtract = document.querySelector("#button_subtract");
const reset = document.querySelector("#button_reset");

const render = () => {
    count.textContent = `Count: ${state.count}`;
};

add.addEventListener("click", () => {
    state.count++;
    render();
});
subtract.addEventListener("click", () => {
    state.count--;
    render();
});
reset.addEventListener("click", () => {
    state.count = 0;
    render();
});

const form = document.querySelector("#form_message");
const textarea = document.querySelector("#textarea_message");

form.addEventListener("submit", async event => {
    event.preventDefault();
    // send request to POST /messages

    const response = await fetch("/messages", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            message: textarea.value
        })
    });
    if (response.status === 200) {
        form.reset();
    } else {
        // TODO: show message to user that the request failed
    }
});



const connect = () => {
    const ws = new WebSocket(`ws://${location.host}`);

    ws.addEventListener("open", () => {
        console.log("connected back to the server via WebSocket");
    });

    ws.addEventListener("message", event => {
        const data = JSON.parse(event.data);
        if (data.type === "hot_reload") {
            location.reload();
            return;
        }
        if (data.type === "new_message") {
            // add a new <li> to the <ul> using the template
            const template = document.querySelector("#template_message");
            const list = document.querySelector("#ul_messages");
            const clone = template.content.cloneNode(true);
            clone.textContent = data.message;
            list.appendChild(clone);
        }
    });

    ws.addEventListener("close", () => {
        console.log("disconnected from WebSocket server, trying again in 500ms");
        setTimeout(connect, 500);
    });
}

connect();

render();