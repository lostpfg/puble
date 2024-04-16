import usePubSub from "./usePubSub";
import type { EventType, TopicName } from "../types";
import { DEFALT_WILDCARD } from "..";

export type PublishFunction = {
    (eventType: EventType): void;
    <T>(eventType: EventType, payload: T): void;
}

export const usePublisher = (topic: TopicName = DEFALT_WILDCARD): PublishFunction => {
    const { publish: _publish } = usePubSub(topic); /* Consume Context. */
    
    function publish(eventType: EventType): void;
    function publish<T>(eventType: EventType, payload: T): void;
    function publish<T>(eventType: EventType, payload?: T) {
        if (typeof payload !== "undefined") return _publish<T>(eventType, payload);
        _publish(eventType);
    }

    return publish;
}

export default usePublisher;