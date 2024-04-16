import { concat, filter, map, Observable, ReplaySubject, Subject, take } from "rxjs";
import type { TopicName, Event as BaseEvent } from "./types";
import { BroadcastEventChannel } from "./broadcastEventChannel";
import { BROADCAST_CHANNEL_NAME } from "./index";

type Event<T = any> = BaseEvent<T> & { submittedOn: number; }

type EventPubSubTopic = {
    createdOn: number;
    subject: Subject<Event>;
	replaySubject: ReplaySubject<Event>;
}

class EventPubSub {
    private bus: Record<TopicName, EventPubSubTopic> = {};
    private broadcastEventChannel: BroadcastEventChannel = new BroadcastEventChannel(BROADCAST_CHANNEL_NAME);

    private static instance: EventPubSub;

    private constructor() { }

    public static getInstance(): EventPubSub {
        if (!this.instance) this.instance = new EventPubSub();
        return this.instance;
    }

    public registerNamespace(topic: TopicName) {
        if (!!this.topicExists(topic)) return;
        this.bus[topic] = {
            subject: new Subject(),
            replaySubject: new ReplaySubject(),
            createdOn: new Date().getTime(),
        };
        this.broadcastEventChannel.listen(topic, (payload) => {
            this.publish(topic, payload.eventType, payload.payload);
        });
    }

    public topicExists(topic: TopicName): boolean {
        return typeof this.bus[topic] !== "undefined";
    }

    public publish<T = any>(
		topic: string,
		eventType: string,
		payload?: Event<T>["payload"]
	): void {
        this.registerNamespace(topic);
		const event = { eventType, payload, submittedOn: new Date().getTime() };
        this.bus[topic].subject.next(event);
		this.bus[topic].replaySubject.next(event);
    }

    public broadcast<T = any>(
        topic: string,
        eventType: string,
        payload?: Event<T>["payload"]
    ): void {
        this.publish<T>(topic, eventType, payload);
        this.broadcastEventChannel.broadcast(topic, eventType, payload);
    }

    public subscribeTopic(topic: string) {
        this.registerNamespace(topic);
        return this.bus[topic].subject;
    }

    public subscribe<T = any>(topic: string, eventType: string, history?: number): Observable<T> {
		this.registerNamespace(topic);
		const subjectOvervable = this.bus[topic].subject.pipe(
			filter((e: Event) => e.eventType === eventType),
			map<Event, T>((e) => e.payload as T)
		);

		if (typeof history !== "undefined" && history > 0) {
			const  historicalObservable = this.bus[topic].replaySubject.pipe(
				filter((e: Event) => e.eventType === eventType),
				map<Event, T>((e) => e.payload as T),
				take(history) 
			);
			return concat(historicalObservable, subjectOvervable);
		}
	
		return subjectOvervable;
    }

    public dispose(topic: string): void {
        if (!this.topicExists(topic)) return;
        this.bus[topic].subject.complete();
		this.bus[topic].replaySubject.complete();
        delete this.bus[topic];
        this.broadcastEventChannel.close();
    }
}

export const PubSub = EventPubSub.getInstance();