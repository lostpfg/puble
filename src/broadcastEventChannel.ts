import type { TopicName, EventType } from "./types";

type Listener = {
    callback: (event: BroadcastEvent) => void;
}

type BroadcastEvent = {
    topic: TopicName;
    eventType?: EventType;
} & Listener;

export class BroadcastEventChannel {
    private channel: BroadcastChannel;
    private listeners: Record<string, Array<Listener>> = {};

    constructor(channelName: string) {
        this.channel = new BroadcastChannel(channelName);

        this.channel.onmessage = (event: MessageEvent) => {
            const { topic } = event.data as BroadcastEvent;
            this.listeners[topic]?.forEach(listener => listener.callback(event.data));
        };
    }

    broadcast(topic: TopicName, eventType: EventType, priority: number, payload?: any): void {
        this.channel.postMessage({ topic, eventType, priority, payload });
    }


    listen(topic: TopicName, callback: (payload: any) => void): void {
        if (!this.listeners[topic]) this.listeners[topic] = [];
        this.listeners[topic]!.push({ callback });
    }

    close(): void {
        this.listeners = {};
        this.channel.close();
    }
}