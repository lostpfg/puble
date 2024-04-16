import React from "react";
import usePubSub from "./usePubSub";
import { render, cleanup, act } from "@testing-library/react";
import { DEFALT_WILDCARD } from "../index";

interface TestComponentProps {
    topic?: string;
    onEvent: (payload: any) => void;
}

const TestComponent: React.FC<TestComponentProps> = ({ topic = DEFALT_WILDCARD, onEvent }) => {
    const { subscribe, publish, publishMultiple } = usePubSub(topic);

    React.useEffect(() => {
        const unsubscribe = subscribe("testEvent", onEvent);
        return () => {
            unsubscribe?.();
        }
    }, [subscribe, onEvent]);

    return (
        <>
            <button onClick={() => publish("testEvent", { message: "test" })}>Test Event</button>
            <button onClick={() => {
                const events = Array.from({ length: 10 }, (_, i) => ({
                    eventType: "testEvent",
                    payload: { message: `multiple ${i}` }
                }));
                publishMultiple(...events);
            }}>
                Test Multiple
            </button>
        </>
    );
};

describe("[usePubSub]", () => {
    afterEach(cleanup);

    it("[Publishing/Subscribing]: should publish and subscribe to an event", () => {
        const handleEvent = jest.fn();
        const { getByText } = render(
            <TestComponent onEvent={handleEvent} />
        );

        act(() => {
            getByText("Test Event").click();
        });

        expect(handleEvent).toHaveBeenCalledWith({ message: "test" });
    });

    it("[Multiple Publishing/Subscribing]: should handle multiple event publishing", () => {
        const handleEvent = jest.fn();
        const { getByText } = render(
            <TestComponent onEvent={handleEvent} />
        );

        act(() => {
            getByText("Test Multiple").click();
        });

        expect(handleEvent).toHaveBeenCalledTimes(10);
        for (let i = 0; i < 10; i++) {
            expect(handleEvent).toHaveBeenCalledWith({ message: `multiple ${i}` });
        }
    });

    it("[Automatic Unsubscribing]: should automatically unsubscribe on component unmount", () => {
        const handleEvent = jest.fn();
        
        const { getByText, unmount } = render(
            <TestComponent onEvent={handleEvent} />
        );

        act(() => {
            getByText("Test Event").click();
        });

        unmount();

        expect(handleEvent).toHaveBeenCalledTimes(1);
    });
});

