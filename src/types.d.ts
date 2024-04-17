export type EventType = string;
export type TopicName = string;
export type SubscriberPriority = "high" | "normal" | "low"; 
export type Nullable<T> = T | null;

export type Event<T = any> = {
    eventType: EventType;
    payload?: T;
    priority?: number;
}

export type SubscribeOptions = {
    history?: number;
    throttle?: number;
    debounce?: number;
};