import React from "react";
import { render, act } from "@testing-library/react";
import useListener from "./useListener";
import type { EventType, TopicName } from "../types";
import { DEFAULT_WILDCARD } from "../index";
import usePubSub from "./usePubSub";

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
    
    const { publish } = usePubSub(topic);

    return (
        <>
            <button onClick={() => publish("testEvent", {  payload: { message: "test" } })}>TEST</button>
        </>
    );
};

const TestListener: React.FC<TestListenerProps> = (props) => {
    const { topic = DEFAULT_WILDCARD, eventType, onEvent } = props;

    useListener(topic, eventType, onEvent);

    return <></>;
};

describe("[useListener]", () => {
    it("[Publishing/Subscribing]: should publish and subscribe to an event", async () => {
        const handleEvent = jest.fn();
        
        const { getByText } = render(
            <React.Fragment>
                <TestPublisher />
                <TestListener eventType="testEvent" onEvent={handleEvent} />
            </React.Fragment>
        );

        act(() => {
            getByText("TEST").click();
        });

        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(handleEvent).toHaveBeenCalledWith({ message: "test" });
    });
});