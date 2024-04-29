import { Observable, Subscriber, TeardownLogic } from "rxjs";

export class SubscribableEvent<T = any> extends Observable<T> {
    constructor(subscribe: (this: Observable<T>, subscriber: Subscriber<T>) => TeardownLogic, unsubscribeCallback: () => void) {
        super(subscriber => {
            const subscription = subscribe.call(this, subscriber);
            return () => {
                if (subscription) {
                    if (typeof subscription === "function") {
                        subscription();
                    } else {
                        subscription.unsubscribe();
                    }
                }
                unsubscribeCallback();
            };
        });
    }
}