class AsyncQueue {
    constructor() {
        this.queue = [];
        this.active = false;
    }

    async add(task) {
        this.queue.push(task);
        if (!this.active) {
            this.active = true;
            await this.process();
        }
    }

    async process() {
        while (this.queue.length > 0) {
            const task = this.queue.shift();
            await task();
        }
        this.active = false;
    }
}

module.exports = { AsyncQueue };