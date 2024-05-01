# Puble - PubSub React Hooks with RxJS

**Puble** provides a set of React hooks and a service for a publish-subscribe pattern powered by RxJS. It allows components within a React application to publish and subscribe to events asynchronously. **Puble** supports event priorities. Additionally it leverages the BroadCast Channel api to allow users to publish events between browsing contexts (windows, tabs, etc) and workers on the same origin.

## Installation
```bash
npm install @lostpfg/puble
```

## Components
EventPubSub Class
A singleton class that manages topics and event handling. Allows for registering namespaces (topics), publishing events, subscribing to topics, and disposing of topics. Internaly it uses an interval of 50ms to extract chunks of events based on priority on each topic. 

Methods:
- registerNamespace(topic): Registers a new topic if not already present.
- publish(topic, eventType, priority, priority?, payload?): Publishes a new event to a specific topic, with specific priority.
- broadcast(topic, eventType, priority, priority?, payload?): Broadcasts a new event to a specific topic, with specific priority.
- subscribeTopic(topic, options?): Subscribes to a topic. Optionally it retrieves historical events, filters out incoming values, throttles and debounces output.
- subscribe(topic, eventType, options?): Subscribes to a topic and specific event types. Optionally it retrieves historical events, filters out incoming values, throttles and debounces output.
- dispose(topic): Cleans up and removes a topic and its associated observables.
- monitorEvents(): Monitoring info regarding the EventPubSub class.

## Hooks

### usePubSub
A  hook for interacting with the EventPubSub. It provides methods to publish and subscribe to events within a React component.

Parameters:
- topic: The topic name to subscribe to. Defaults to a wildcard that can be used for general purposes.
Returns:
An API with methods for publishing and subscribing to events, managing multiple subscriptions, and unsubscribing.

Example:

```typescript
import React from "react";
import { useBroadcast } from "@lostpfg/puble";

const Broadcast: React.FunctionComponent = () => {
    const { publishMultiple, publish } = usePubSub();
    
    return (
        <React.Fragment>
            <button onClick={() => publish({ eventType: "test:event", priority: 5, payload: { timestamp: new Date().getTime() } })}>
                Publish Multiple
            </button>
            <button onClick={() => publishMultiple({ eventType: "test:event", priority: 1, payload: { timestamp: new Date().getTime() } }, { eventType: "test:event", priority: 10, payload: { timestamp: new Date().getTime() } })}>
                Publish Multiple
            </button>
        </React.Fragment>
    )
}

const Receiver: React.FunctionComponent = () => {
    const { subscribe } = usePubSub();
    const [event, setEvent] = React.useState<any>(null);

    React.useEffect(() => {
        const unsubscribe = subscribe("test:event", (event: any) => {
            setEvent(event);
        });

        return () => unsubscribe?.(); /* Optional as hook will handle it */
    }, []);

    return (
        <div>Last Event: {JSON.stringify(event)}</div>
    );
}

```

### useBroadcast
Simplifies broadcasting events in React Components. It uses usePubSub to access broadcasting functionality.

Parameters:
- topic: Optional topic name for the events.
Returns:
- Function to trigger events. It supports optional payload.

Example:

```typescript

import React from "react";
import { useBroadcast } from "@lostpfg/puble";

const Example: React.FunctionComponent = () => {
    const broadcast = useBroadcast();
    
    return (
        <button onClick={() => broadcast("test:event", { priority: 5, payload: { timestamp: new Date().getTime() } })}>
            Broadcast
        </button>
    );
}

```

### usePublisher
Simplifies publishing events in React Components. It uses usePubSub to access publishing functionality.

Parameters:
- topic: Optional topic name for the events.
Returns:
- Function to trigger events. It supports optional payload.

Example:

```typescript

import React from "react";
import { usePublisher } from "@lostpfg/puble";

const Example: React.FunctionComponent = () => {
    const publish = usePublisher();
    
    return (
        <button onClick={() => publish("test:event", { priority: 5, payload: { timestamp: new Date().getTime() } })}>
            Publish
        </button>
    );
}

```

###  useListener
Simplifies subscribtion to events in React Components. Automatically handles subscription lifecycle with component mounting and unmounting lifecycle.

Parameters:
- Supports dual use: Either pass a topic name and event type, or just an event type for the default topic.
- callback: Function that executes when an event is received.
- deps: Dependency array to control re-subscription in React's useEffect.

```typescript
import React from "react";
import { useListener } from "@lostpfg/puble";

const Receiver: React.FunctionComponent = () => {
    const [event, setEvent] = React.useState<any>(null);
    useListener("test:event", (event) => setEvent(event));

    return (
        <div>Last Event: {JSON.stringify(event)}</div>
    );
}
```

###  useMonitorData
Provides a simple to hook that subscribes to the monitor data of the core class. Automatically handles subscription lifecycle with component mounting and unmounting lifecycle.

Parameters:
- Supports dual use: Either pass a topic name and event type, or just an event type for the default topic.
- callback: Function that executes when an event is received.
- deps: Dependency array to control re-subscription in React's useEffect.

```typescript
import React from "react";
import { useMonitorData } from "@lostpfg/puble";

const Receiver: React.FunctionComponent = () => {
    const data = useMonitorData();

    return (
        <div>Monitoring Data: {JSON.stringify(data?? {})}</div>
    );
}
```