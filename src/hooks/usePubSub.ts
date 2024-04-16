import { useCallback, useEffect, useRef } from "react";
import { first, Observable, Subscription } from "rxjs";
import type { EventType, Event, TopicName } from "../types";
import { DEFALT_WILDCARD } from "..";
import { PubSub } from "../core";

export type UsePubSubApi = {
    broadcast(eventType: EventType): void;
    broadcast<T>(eventType: EventType, payload: T): void;
    publish(eventType: EventType): void;
    publish<T>(eventType: EventType, payload: T): void;
    publishMultiple(...events: Array<Omit<Event, "submittedOn">>): void;
    subscribeAll: (callback: (event: Event) => void) => () => void;
    subscribe(event: EventType, handler: () => void): () => void;
    subscribe<T = any>(event: EventType, handler: (payload: T) => void): () => void;
    subscribeOnce(event: EventType, handler: () => void): () => void;
    subscribeOnce<T = any>(event: EventType, handler: (payload: T) => void): () => void;
    unsubscribeAll: () => void;
}

export const usePubSub = (topic: TopicName = DEFALT_WILDCARD): UsePubSubApi => {
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

    const publish = useCallback(<T = any>(eventType: EventType, payload?: T) => {
        PubSub.publish<T>(topic, eventType, payload);
    }, [topic]);

    const broadcast = useCallback(<T = any>(eventType: EventType, payload?: T) => {
        PubSub.broadcast<T>(topic, eventType, payload);
    }, [topic]);

    useEffect(() => {
        return () => unsubscribeAll();
    }, [topic]);

    return {
        broadcast,
        publish,
        publishMultiple: useCallback((...events: Array<Omit<Event, "submittedOn">>) => events.forEach(({ eventType, payload }) => publish(eventType, payload)), [publish]),
        subscribeAll: useCallback((callback: (eventType: Event) => void) => {
            const subscription = PubSub.subscribeTopic(topic).subscribe(callback);
            subscriptions.current.push(subscription);
            return () => unsubscribe(subscription);
        }, [topic]),
        subscribe: useCallback(<T = any>(eventType: EventType, handler: (payload: T) => void, history: number = 0) => createSubscription(PubSub.subscribe<T>(topic, eventType, history), handler), [topic, createSubscription]),
        subscribeOnce: useCallback(<T = any>(eventType: EventType, handler: (payload?: T) => void) => createSubscription(PubSub.subscribe<T>(topic, eventType).pipe(first()), handler), [topic, createSubscription]),
        unsubscribeAll,
    };
}

export default usePubSub;