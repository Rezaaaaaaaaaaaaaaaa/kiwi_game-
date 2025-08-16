// Base System class that all game systems extend
export class BaseSystem {
    constructor(game) {
        this.game = game;
        this.initialized = false;
        this.running = false;
    }

    async init() {
        console.log(`Initializing ${this.constructor.name}...`);
        this.initialized = true;
    }

    start() {
        if (!this.initialized) {
            throw new Error(`${this.constructor.name} not initialized`);
        }
        this.running = true;
        console.log(`Started ${this.constructor.name}`);
    }

    stop() {
        this.running = false;
        console.log(`Stopped ${this.constructor.name}`);
    }

    update(deltaTime) {
        if (!this.running) return;
        // Override in child classes
    }

    getState() {
        return {};
    }

    loadState(state) {
        // Override in child classes
    }
}