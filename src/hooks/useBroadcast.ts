import usePubSub from "./usePubSub";
import type { Event, EventType, TopicName } from "../types";
import { DEFAULT_WILDCARD } from "..";
import { PublishFunction } from "./usePublisher";

const useBroadcast = (topic: TopicName = DEFAULT_WILDCARD): PublishFunction => {
    const { broadcast: _broadcast } = usePubSub(topic); /* Consume Context. */
    
    function broadcast(eventType: EventType): void;
    function broadcast<T>(eventType: EventType, options: Omit<Event<T>, "submittedOn" | "eventType">): void;
    function broadcast<T>(eventType: EventType, options?: Omit<Event<T>, "submittedOn" | "eventType">) {
        if (typeof options !== "undefined") return _broadcast<T>(eventType, options);
        _broadcast(eventType);
    }

    return broadcast;
}

export default useBroadcast;