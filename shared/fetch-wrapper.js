export default class FetchWrapper {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    get(endpoint) {
        return fetch(`${this.baseURL}${endpoint}`).then(response => response.json());
    }

    post(endpoint, body) {
        return this.#send(endpoint, body, "POST");
    }

    put(endpoint, body) {
        return this.#send(endpoint, body, "PUT");
    }

    patch(endpoint, body) {
        return this.#send(endpoint, body, "PATCH");
    }

    delete(endpoint, body) {
        return this.#send(endpoint, body, "DELETE");
    }

    #send(endpoint, body, method) {
        return fetch(`${this.baseURL}${endpoint}`, {
            method,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body)
        }).then(response => {
            if (response.status === 204) {
                return response;
            }
            return response.json();
        });
    }
}

