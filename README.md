# Puble - PubSub React Hooks with RxJS

**Puble** provides a set of React hooks and a service for a publish-subscribe pattern powered by RxJS. It allows components within a React application to publish and subscribe to events asynchronously. Additionally it leverages the BroadCast Channel api to allow users to publish events between browsing contexts (windows, tabs, etc) and workers on the same origin.

## Installation
```bash
npm install @lostpfg/puble
```

## Components
EventPubSub Class
A singleton class that manages topics and event handling. Allows for registering namespaces (topics), publishing events, subscribing to topics, and disposing of topics.

Methods:
- registerNamespace(topic): Registers a new topic if not already present.
- publish(topic, eventType, payload): Publishes a new event to a specific topic.
- brodcast(topic, eventType, payload): Broadcasts a new event to a specific topic.
- subscribe(topic, eventType, history?): Subscribes to a topic and filters events by type. Optionally retrieves historical events.
- dispose(topic): Cleans up and removes a topic and its associated observables.

## Hooks

### usePubSub
A  hook for interacting with the EventPubSub. It provides methods to publish and subscribe to events within a React component.

Parameters:
- topic: The topic name to subscribe to. Defaults to a wildcard that can be used for general purposes.
Returns:
An API with methods for publishing and subscribing to events, managing multiple subscriptions, and unsubscribing.

### useBroadcast
Simplifies broadcasting events in React Components. It uses usePubSub to access broadcasting functionality.

Parameters:
- topic: Optional topic name for the events.
Returns:
- Function to trigger events. It supports optional payload.


### usePublisher
Simplifies publishing events in React Components. It uses usePubSub to access publishing functionality.

Parameters:
- topic: Optional topic name for the events.
Returns:
- Function to trigger events. It supports optional payload.

###  useListener
Simplifies subscribtion to events in React Components. Automatically handles subscription lifecycle with component mounting and unmounting.

Parameters:
- Supports dual use: Either pass a topic name and event type, or just an event type for the default topic.
- callback: Function that executes when an event is received.
- deps: Dependency array to control re-subscription in React's useEffect.