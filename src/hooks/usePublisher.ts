import usePubSub from "./usePubSub";
import type { Event, EventType, TopicName } from "../types";
import { DEFAULT_WILDCARD } from "..";

export type PublishFunction = {
    (eventType: EventType): void;
    <T>(eventType: EventType, payload: T): void;
}

const usePublisher = (topic: TopicName = DEFAULT_WILDCARD): PublishFunction => {
    const { publish: _publish } = usePubSub(topic); /* Consume Context. */
    
    function publish(eventType: EventType): void;
    function publish<T>(eventType: EventType, options: Omit<Event<T>, "submittedOn" | "eventType">): void;
    function publish<T>(eventType: EventType, options?: Omit<Event<T>, "submittedOn" | "eventType">) {
        if (typeof options !== "undefined") return _publish<T>(eventType, options);
        _publish(eventType);
    }

    return publish;
}

export default usePublisher;