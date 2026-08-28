export default class CallbackMachine {
    #callbackRegistry = {};
    
    registerCallback = (event, caller, callback) => {
        if (!this.#callbackRegistry[event]) {
            this.#callbackRegistry[event] = [];
        }
        this.#callbackRegistry[event].push({
            caller,
            callback
        });
    }

    executeCallbacks = (event, ...args) => {
        this.#callbackRegistry[event]?.forEach(registeredCallback => {
            const { caller, callback } = registeredCallback;
            callback.call(caller, ...args);
        });
    }

    removeCallback = (event, caller, callback) => {
        const index = this.#callbackRegistry[event].findIndex(c => c.caller === caller && c.callback === callback);
        this.#callbackRegistry[event].splice(index, 1);
    }

    removeAllCallbacks = caller => {
        for (const event in this.#callbackRegistry) {
            this.#callbackRegistry[event] = this.#callbackRegistry[event].filter(c => c.caller !== caller);
        }
    }
}