import { useEffect, useRef } from "react";
import usePubSub from "./usePubSub";
import { EventType, TopicName } from "../types";
import { DEFAULT_WILDCARD } from "..";

export function useListener <T = any>(topic: TopicName, eventType: EventType, callback: (payload: T) => void, deps?: React.DependencyList): void;
export function useListener <T = any>(eventType: EventType, callback: (payload: T) => void, deps?: React.DependencyList): void;
export function useListener<T = any>(
    topicOrEventType: TopicName | EventType,
    eventTypeOrCallback: EventType | ((payload: T) => void),
    callbackOrDeps?: ((payload: T) => void) | React.DependencyList,
    deps?: React.DependencyList
) {
    const withTopic = typeof topicOrEventType === "string" && typeof eventTypeOrCallback === "string";

    const topic = withTopic ? topicOrEventType : DEFAULT_WILDCARD;
    const eventType = withTopic ? eventTypeOrCallback as EventType : topicOrEventType as EventType;
    const callback = typeof eventTypeOrCallback === "function" ? eventTypeOrCallback: callbackOrDeps as (payload: T) => void;
    const dependencies = withTopic ? deps : callbackOrDeps as React.DependencyList;

    const { subscribe } = usePubSub(topic);

    const _callback = useRef<(payload: T) => void>(callback);

    useEffect(() => {
        _callback.current = callback;
    }, [callback, dependencies]);

    useEffect(() => {
        const unsubscribe = subscribe<T>(eventType, (p) => {
            _callback.current(p)
        });
        return () => unsubscribe?.();
    }, [subscribe, eventType]);
}

export default useListener;