import { Nullable } from "./types";

type PriortyQueueItems<T> = {
    items: Array<T>;
    count: number;
}

export class PriorityQueue<T> {
    private heap: Record<number, PriortyQueueItems<T>> = {};
    private min: Nullable<number> = null;

    constructor() {}

    enqueue(item: T, priority: number): void {
        if (!this.heap[priority]) this.heap[priority] = { items: [], count: 0 };
        this.heap[priority].items.push(item);
        this.heap[priority].count++;
        if (this.min === null || priority < this.min) this.min = priority;
    }

    dequeue() {
        if (!Object.keys(this.heap).length || this.min === null) return null;
        const ret = this.heap[this.min].items.shift();
        this.heap[this.min].count--;
        if (this.heap[this.min].count === 0) {
            delete this.heap[this.min];
            this.min = Math.min(...Object.keys(this.heap).map(Number));
            if (this.min === Infinity) this.min = null;
        }
        return ret;
    }

    isEmpty(): boolean {
        return !this.size();
    }

    size(): number {
        return Object.values(this.heap).reduce((acc, curr) => acc + curr.count, 0);
    }

    reset(): void {
        this.heap = {};
    }
}