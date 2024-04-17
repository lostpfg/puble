import { DEFAULT_WILDCARD } from "./index";
import { PubSub } from "./core";
import { EventType, TopicName } from "./types";

type Payload = { data: string | number };

describe("[EventPubSub]", () => {
    afterEach(() => {
        PubSub.dispose(DEFAULT_WILDCARD);
    });

    test("[Topic Registration]: should register a new topic", () => {
        const topic: TopicName = "testTopic";
        PubSub.registerNamespace(topic);
        expect(PubSub.topicExists(topic)).toBe(true);
    });

    test("[Topic Registration]: should not register the same topic twice", () => {
        const topic: TopicName = "testTopic";
        PubSub.registerNamespace(topic);
        expect(() => {
            PubSub.registerNamespace(topic);
        }).not.toThrow();
    });

    test("[Publishing]: should publish and subscribe to an event", done => {
        const topic: TopicName = "testTopic";
        const eventType: EventType = "testEvent";
        const payload:Payload  = { data: "test" };

        PubSub.registerNamespace(topic);
        PubSub.subscribe<Payload>(topic, eventType).subscribe(payload => {
            expect(payload).toEqual(payload);
            done();
        });
        PubSub.publish(topic, eventType, 10, { payload });
    });

    test("[Subscribing with History]: should receive the correct number of past events", done => {
        const topic = "historyTopic";
        const eventType = "testEvent";
        const totalEvents = 1000;
        const historyCount = 25;
        const receivedEvents: Array<number | string> = [];

        PubSub.registerNamespace(topic);

        for (let i = 0; i < totalEvents; i++) {
            PubSub.publish<Payload>(topic, eventType, 1, { data: i });
        }

        const validate = () => {
            expect(receivedEvents.length).toBe(historyCount);
            const expectedEvents = Array.from({ length: historyCount }, (_, i) => totalEvents - historyCount + i);
            expect(receivedEvents).toEqual(expectedEvents);
            done();
        };

        PubSub.subscribe<Payload>(topic, eventType, { history: historyCount })
            .subscribe(event => {
                receivedEvents.push(event.data);
                receivedEvents.length === historyCount && validate();
            });
    });


    test("[Unsubscribing]: should handle unsubscribe correctly", () => {
        const topic: TopicName = "testTopic";
        const eventType: EventType = "testEvent";

        PubSub.registerNamespace(topic);
        const subscription = PubSub.subscribe(topic, eventType).subscribe(() => {});

        expect(subscription.closed).toBe(false);
        subscription.unsubscribe();
        expect(subscription.closed).toBe(true);
    });
});