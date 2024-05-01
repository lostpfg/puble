import { DEFAULT_WILDCARD } from "./index";
import { PubSub } from "./core";
import { EventType, TopicName } from "./types";

type Payload = { data: string | number };

const topic: TopicName = "testTopic";

describe("[EventPubSub]", () => {
    beforeEach(() => {
        PubSub.registerNamespace(DEFAULT_WILDCARD);
    });

    afterEach(() => {
        PubSub.dispose(DEFAULT_WILDCARD);
    });

    test("[Topic Registration]: should register a new topic", () => {
        const topic: TopicName = "testNewTopic";
        PubSub.registerNamespace(topic);
        expect(PubSub.topicExists(topic)).toBe(true);
    });

    test("[Publishing]: should publish and subscribe to an event", done => {
        const eventType: EventType = "testEvent";
        const payload:Payload  = { data: "test" };

        PubSub.subscribe<Payload>(topic, eventType).subscribe(payload => {
            expect(payload).toEqual(payload);
            done();
        });
        PubSub.publish(topic, eventType, 0, { payload });
    });

    test("[Subscribing with History]: should receive the correct number of past events", done => {
        const eventType = "testEvent";
        const totalEvents = 1000;
        const historyCount = 25;
        const receivedEvents: Array<number | string> = [];

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

    test("[Subscribing with Query]: should receive only filtered events", done => {
        const eventType = "testEvent";
        const totalEvents = 1000;
        const receivedEvents: Array<number | string> = [];
        const historyCount = 30;

        const validate = () => {
            expect(receivedEvents.length).toBe(historyCount);
            done();
        };

        PubSub.subscribe<Payload>(topic, eventType, { query: (e) => !!e?.data && typeof e.data === "number" && e.data % 2 === 0})
            .subscribe(event => {
                expect(typeof event.data === "number" && event.data % 2 === 0).toBe(true);
                receivedEvents.push(event.data);
                receivedEvents.length === historyCount && validate();
            });
        
        for (let i = 0; i < totalEvents; i++) {
            PubSub.publish<Payload>(topic, eventType, 1, { data: i });
        }
    
    });

    test("[Unsubscribing]: should handle unsubscribe correctly", () => {
        const eventType: EventType = "testEvent";

        const subscription = PubSub.subscribe(topic, eventType).subscribe(() => {});

        expect(subscription.closed).toBe(false);
        subscription.unsubscribe();
        expect(subscription.closed).toBe(true);
    });
});