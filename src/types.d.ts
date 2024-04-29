export type EventType = string;
export type TopicName = string;
export type SubscriberPriority = "high" | "normal" | "low"; 
export type Nullable<T> = T | null;

export type Event<T = any> = {
    eventType: EventType;
    payload?: T;
    priority?: number;
}

type BaseSubscribeOptions = {
    history?: number;
    throttle?: number;
    debounce?: number;
};

export type SubscribeTopicOptions = 
    & BaseSubscribeOptions
    & {
        query?: (event: Omit<Event, "priority">) => boolean
    };

export type SubscribeEventTypeOptions<T = any> =
    & BaseSubscribeOptions
    & {
        query?: (payload: Event<T>["payload"]) => boolean
    };

export type MonitoringData = {
    registeredTopics: Nullable<Array<TopicName>>;
    totalEvents: number;
    totalSubscribers: number;
}