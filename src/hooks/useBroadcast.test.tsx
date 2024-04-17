import React from "react";
import { render, act } from "@testing-library/react";
import useBroadcast from "./useBroadcast";
import { EventType, TopicName } from "../types";
import { DEFAULT_WILDCARD } from "..";
import usePubSub from "./usePubSub";

interface TestListenerProps {
    topic?: TopicName;
    eventType: EventType;
    onEvent: (payload: any) => void;
}

const TestPublisher: React.FC = () => {
    const publish = useBroadcast();

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

describe("[useBroadcast]", () => {
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

        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(handleEvent).toHaveBeenCalledWith({ message: "test" });
    });
});