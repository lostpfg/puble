import React from "react";
import { render, act } from "@testing-library/react";
import usePublisher from "./usePublisher";
import type { EventType, TopicName } from "../types";
import { DEFAULT_WILDCARD, usePubSub } from "../index";

interface TestPublisherProps {
    topic?: TopicName;
}

interface TestListenerProps {
    topic?: TopicName;
    eventType: EventType;
    onEvent: (payload: any) => void;
}

const TestPublisher: React.FC<TestPublisherProps> = (props) => {
    const { topic = DEFAULT_WILDCARD } = props;
    const publish = usePublisher(topic);

    return (
        <>
            <button onClick={() => publish("testEvent", { payload: { message: "test" } })}>Publish Event</button>
        </>
    );
};

const TestListener: React.FC<TestListenerProps> = (props) => {
    const { topic = DEFAULT_WILDCARD, eventType, onEvent } = props;
    const { subscribe } = usePubSub(topic);

    React.useEffect(() => {
        const unsubscribe = subscribe(eventType, onEvent);
        return () => {
            unsubscribe?.();
        }
    }, [eventType, onEvent]);

    return <></>;
};

describe("[usePublisher]", () => {
    it("[Publishing/Subscribing]: should publish and subscribe to an event", async () => {
        const handleEvent = jest.fn();
        
        const { getByText } = render(
            <React.Fragment>
                <TestPublisher />
                <TestListener eventType="testEvent" onEvent={handleEvent} />
            </React.Fragment>
        );

        act(() => {
            getByText("Publish Event").click();
        });

        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(handleEvent).toHaveBeenCalledWith({ message: "test" });
    });
});