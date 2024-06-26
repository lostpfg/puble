import { useCallback, useEffect, useRef } from "react";
import { first, Observable, Subscription } from "rxjs";
import type { EventType, Event, TopicName, SubscribeEventTypeOptions, SubscribeTopicOptions } from "../types";
import { DEFAULT_EVENT_PRIORITY, DEFAULT_WILDCARD } from "..";
import { PubSub } from "../core";

export type UsePubSubApi = {
    broadcast(eventType: EventType): void;
    broadcast<T>(eventType: EventType, options: Omit<Event<T>, "submittedOn" | "eventType">): void;
    publish(eventType: EventType): void;
    publish<T>(eventType: EventType, options: Omit<Event<T>, "submittedOn" | "eventType">): void;
    publishMultiple(...events: Array<Omit<Event, "submittedOn">>): void;
    subscribeAll: (callback: (event: Event) => void) => () => void;
    subscribe(event: EventType, handler: () => void, options?: SubscribeEventTypeOptions): () => void;
    subscribe<T = any>(event: EventType, handler: (payload: T) => void, options?: SubscribeEventTypeOptions): () => void;
    subscribeOnce(event: EventType, handler: () => void, options?: SubscribeEventTypeOptions): () => void;
    subscribeOnce<T = any>(event: EventType, handler: (payload: T) => void, options?: SubscribeEventTypeOptions): () => void;
    unsubscribeAll: () => void;
}

const usePubSub = (topic: TopicName = DEFAULT_WILDCARD): UsePubSubApi => {
    const subscriptions = useRef<Array<Subscription>>([]); 

    const unsubscribe = useCallback((subscription: Subscription) => {
        !subscription.closed && subscription.unsubscribe();
    }, []);

    const unsubscribeAll = useCallback(() => {
        subscriptions.current.forEach(subscription => unsubscribe(subscription));
    }, []);

    const createSubscription = useCallback(<T = any>(observable: Observable<T>, callback: (payload: T) => void) => {
        const subscription = observable.subscribe(callback);
        subscriptions.current.push(subscription);
        return () => unsubscribe(subscription);
    }, [unsubscribe]);

    const publish = useCallback(<T = any>(eventType: EventType, options?: Omit<Event<T>, "submittedOn" | "eventType">) => {
        PubSub.publish<T>(topic, eventType, typeof options?.priority === "number"? options.priority: DEFAULT_EVENT_PRIORITY, options?.payload);
    }, [topic]);

    const broadcast = useCallback(<T = any>(eventType: EventType, options?: Omit<Event<T>, "submittedOn" | "eventType">) => {
        PubSub.broadcast<T>(topic, eventType, typeof options?.priority === "number"? options.priority: DEFAULT_EVENT_PRIORITY, options?.payload);
    }, [topic]);

    useEffect(() => {
        return () => unsubscribeAll();
    }, [topic]);

    return {
        broadcast,
        publish,
        publishMultiple: useCallback((...events: Array<Omit<Event, "submittedOn">>) => events.forEach(({ eventType, payload, priority }) => publish(eventType, { priority, payload })), [publish]),
        subscribeAll: useCallback((callback: (eventType: Event) => void, options?: SubscribeTopicOptions) => {
            const subscription = PubSub.subscribeTopic(topic, options).subscribe(callback);
            subscriptions.current.push(subscription);
            return () => unsubscribe(subscription);
        }, [topic]),
        subscribe: useCallback(<T = any>(eventType: EventType, handler: (payload: T) => void, options?: SubscribeEventTypeOptions) => createSubscription(PubSub.subscribe<T>(topic, eventType, options), handler), [topic, createSubscription]),
        subscribeOnce: useCallback(<T = any>(eventType: EventType, handler: (payload?: T) => void, options?: SubscribeEventTypeOptions) => createSubscription(PubSub.subscribe<T>(topic, eventType, options).pipe(first()), handler), [topic, createSubscription]),
        unsubscribeAll,
    };
}

export default usePubSub;