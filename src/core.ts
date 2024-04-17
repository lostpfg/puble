import { concat, debounceTime, filter, from, map, Observable, Subject, throttleTime } from "rxjs";
import type { TopicName, Event as BaseEvent, Nullable } from "./types";
import { BroadcastEventChannel } from "./broadcastEventChannel";
import { BROADCAST_CHANNEL_NAME, BUFFER_SIZE, DEFAULT_EVENT_PRIORITY, DEQUEUE_INTERVAL } from "./index";
import { PriorityQueue } from "./priorityQueue";

type Event<T = any> = BaseEvent<T> & { submittedOn: number; }

type EventPubSubTopic = {
    createdOn: number;
    subject: Subject<Event>;
    queue: PriorityQueue<Event>;
    dequing: boolean;
    info: TopicInfo;
    interval?: Nullable<any>;
}

class TopicInfo {
    public lastEvent: Nullable<Event> = null;
    private _buffer: Array<Event> = [];

    get buffer(): Array<Event> {
        return this._buffer;
    }

    constructor() {}

    push(event: Event): void {
        if (this._buffer.length > BUFFER_SIZE) this._buffer.shift();
        this.lastEvent = event;
        this._buffer.push(event);
    }
}

class EventPubSub {
    private bus: Record<string, EventPubSubTopic> = {};
    private broadcastEventChannel: BroadcastEventChannel;

    private static instance: EventPubSub;

    private constructor() {
        this.broadcastEventChannel = new BroadcastEventChannel(BROADCAST_CHANNEL_NAME);
    }

    public static getInstance(): EventPubSub {
        if (!this.instance) this.instance = new EventPubSub();
        return this.instance;
    }

    public registerNamespace(topic: TopicName) {
        if (!!this.topicExists(topic)) return;
        this.bus[topic] = {
            subject: new Subject(),
            createdOn: new Date().getTime(),
            queue: new PriorityQueue<Event>(),
            info: new TopicInfo(),
            dequing: false,
            interval: null,
        };

        this.bus[topic].interval = setInterval(() => this.processQueue(topic), DEQUEUE_INTERVAL);
        this.broadcastEventChannel.listen(topic, (payload) => this.publish(topic, payload.eventType, payload.priority, payload.payload));
    }

    private processQueue(topic: TopicName): void {
        if (this.bus[topic].dequing || !this.bus[topic].queue.size()) return;
        let index = 0;
        this.bus[topic].dequing = true;
        while (index < 50 || index < this.bus[topic].queue.size()) {
            const event = this.bus[topic].queue.dequeue();
            if (!event) {
                this.bus[topic].dequing = false;
                return;
            }
            this.bus[topic].subject.next(event);
            index++;
        }
        this.bus[topic].dequing = false;
    }

    private pushToBuffer(topic: TopicName, event: Event): void {
        if (this.bus[topic].info.buffer.length > 1000) {
            this.bus[topic].info.buffer.shift();
        }
        this.bus[topic].info.lastEvent = event;
        this.bus[topic].info.buffer.push(event);
    }

    public topicExists(topic: TopicName): boolean {
        return typeof this.bus[topic] !== "undefined";
    }

    public publish<T = any>(
		topic: string,
		eventType: string,
        priority: number = DEFAULT_EVENT_PRIORITY,
		payload?: Event<T>["payload"],
	): void {
        this.registerNamespace(topic);
		const event = { eventType, payload, submittedOn: new Date().getTime() };
        this.pushToBuffer(topic, event);
        this.bus[topic].queue.enqueue(event, priority);
    }

    public broadcast<T = any>(
        topic: string,
        eventType: string,
        priority: number = DEFAULT_EVENT_PRIORITY,
        payload?: Event<T>["payload"]
    ): void {
        this.publish<T>(topic, eventType, priority, payload);
        this.broadcastEventChannel.broadcast(topic, eventType, priority, payload);
    }

    public subscribeTopic(topic: string, options?: any) {
        this.registerNamespace(topic);
        const now = new Date().getTime();

        let stream = this.bus[topic].subject.pipe(
            map<Event, Event>((e) => e as Event)
        );

        if (options?.throttle) {
            stream = stream.pipe(throttleTime(options.throttle));
        } else if (options?.debounce) {
            stream = stream.pipe(debounceTime(options.debounce));
        }

        if (typeof options?.history !== "undefined" && options.history > 0) {
            const historyEvents = this.bus[topic].info.buffer.filter((e: Event) => e.submittedOn <= now).slice(-options.history);
            return concat(from(historyEvents), stream);
        }

        return stream;
    }

    public subscribe<T = any>(topic: string, eventType: string, options?: any): Observable<T> {
		this.registerNamespace(topic);
        const now = new Date().getTime();

        let stream = this.bus[topic].subject.pipe(
            filter((e: Event) => e.eventType === eventType && e.submittedOn > now),
            map<Event, T>((e) => {
                return e.payload as T;
            })
        );

        if (options?.throttle) {
            stream = stream.pipe(throttleTime(options.throttle));
        } else if (options?.debounce) {
            stream = stream.pipe(debounceTime(options.debounce));
        }

        if (typeof options?.history !== "undefined" && options.history > 0) {
            const historyEvents = this.bus[topic].info.buffer.filter(e => e.eventType === eventType &&  e.submittedOn <= now).map(e => e.payload).slice(-options.history) as Array<T>;
            return concat(from(historyEvents), stream);
        }
	
		return stream;
    }

    public dispose(topic: string): void {
        if (!this.topicExists(topic)) return;
        const interval = this.bus[topic].interval;
        interval && clearInterval(interval);
        this.bus[topic].subject.complete();
        delete this.bus[topic];
        this.broadcastEventChannel.close();
    }
}

export const PubSub = EventPubSub.getInstance();