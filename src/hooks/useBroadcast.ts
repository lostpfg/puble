import usePubSub from "./usePubSub";
import type { EventType, TopicName } from "../types";
import { DEFALT_WILDCARD } from "..";
import { PublishFunction } from "./usePublisher";

export const useBroadcast = (topic: TopicName = DEFALT_WILDCARD): PublishFunction => {
    const { broadcast: _broadcast } = usePubSub(topic); /* Consume Context. */
    
    function broadcast(eventType: EventType): void;
    function broadcast<T>(eventType: EventType, payload: T): void;
    function broadcast<T>(eventType: EventType, payload?: T) {
        if (typeof payload !== "undefined") return _broadcast<T>(eventType, payload);
        _broadcast(eventType);
    }

    return broadcast;
}

export default useBroadcast;