export type EventType = string;
export type TopicName = string;
export type SubscriberPriority = "high" | "normal" | "low"; 
export type Event<T = any> = {
    eventType: EventType;
    payload?: T;
}