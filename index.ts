/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

type ListenerFunction<T extends any[]> = (...args: T) => any;

class Listener {
    readonly fn: ListenerFunction<any>;
    readonly once: boolean;
    constructor(fn: ListenerFunction<any>, once?: boolean) {
        this.fn = fn;
        this.once = once || false;
    }
}

function addEventLis(event: Event, listener: Listener) {
    if (!event._lis) event._lis = listener;
    else if (Array.isArray(event._lis)) (event._lis as any[]).push(listener);
    else event._lis = [event._lis as Listener,listener];
}

function rmFirstListenerInstance(event: Event, listener: Listener) {
    const lis: Listener | Listener[] | undefined | any = event._lis;
    if(!lis) return;
    else if(lis.fn && lis == listener) event._lis = undefined;
    else {
        for (let i = lis.length - 1; i > -1; i--) if (lis[i] == listener) {
            (lis as ListenerFunction<any>[]).splice(i, 1);
            break;
        }
        if(lis.length === 0) event._lis = undefined;
    }
}

export type ProtectedEvent<E extends Event> = Omit<E,"emit">;
export type EventListener<T extends Event<any>> = T extends Event<infer A> ? ListenerFunction<A> : never;

export default class Event<A extends any[] = any> {
    
    /**
     * @description
     * A creator that returns a timeout error that will
     * be thrown when a timeout is reached in a promise based once-listener.
     */
    public static onceTimeoutErrorCreator: () => Error = () => {
        const err = new Error('Once listener timeout reached.');
        err.name = 'Timeout';
        return err;
    }

    /**
     * @internal
     */
    _lis?: Listener | Listener[];

    /**
     * @description
     * Removes all listeners.
     */
     public off(): void
    /**
     * @description
     * Removes a specific listener.
     * @param listener
     */
    public off(listener: ListenerFunction<A>): void
    public off(fn?: ListenerFunction<A>): void {
        const lis: Listener | Listener[] | undefined | any = this._lis;
        if(!lis) return;
        else if(!fn) return this._lis = undefined;
        else if(lis.fn && lis.fn === fn) return this._lis = undefined;
        else {
            const newLis: Listener[] = [];
            for (let i = 0, length = lis.length; i < length; i++)
                if (lis[i].fn != fn) newLis.push(lis[i]);
            this._lis = newLis;
        }
    }

    /**
     * @description
     * Returns the count of active listeners.
     */
    public listenerCount(): number {
        return !this._lis ? 0 : ((this._lis as Listener).fn ? 
            1 : (this._lis as Listener[]).length);
    }

    /**
     * @description
     * Adds an on-listener.
     * @param listener
     */
    public on(listener: ListenerFunction<A>): void
    public on(fn: ListenerFunction<A>): void {
        addEventLis(this,new Listener(fn));
    }

    /**
     * @description
     * Adds a once-listener.
     * @param event
     * @param listener
     */
    public once(listener: ListenerFunction<A>): void
    /**
     * @description
     * Returns a promise that will be resolved with the arguments when the event has triggered.
     * A timeout can be added that will reject the promise when the timeout is reached.
     * @param timeout
     */
    public once(timeout?: number): Promise<A>
    public once(v?: ListenerFunction<A> | number) {
        if("function" === typeof v){ addEventLis(this,new Listener(v,true)); return;}
        if(v) return new Promise((res,rej) => {
            let listener;
            const timeout = setTimeout(() => {
                rmFirstListenerInstance(this,listener);
                rej(Event.onceTimeoutErrorCreator());
            },v);
            addEventLis(this,listener = new Listener(function() {
                clearTimeout(timeout);
                res(arguments)
            },true));
        })
        else return new Promise((res) => addEventLis(this,new Listener(res,true)))
    }

    /**
     * @description
     * Triggers the event with the given arguments.
     * @param event
     * @param args
     */
    // @ts-ignore
    public emit(...args: A): void
    public emit(a1, a2, a3): void {
        const lis: Listener | Listener[] | undefined | any = this._lis, len = arguments.length;
        if(!lis) return;
        if(lis.fn) {
            if(lis.once) this._lis = undefined;
            return len == 0 ? lis.fn() : len == 1 ? lis.fn(a1) : len == 2 ? lis.fn(a1,a2) : len == 3 ? lis.fn(a1,a2,a3) :
                lis.fn.apply(null,Array.from(arguments));
        }
        else {
            let args, i = 0, l;
            while(i < lis.length) {
                l = lis[i];
                if(l.once) {
                    lis.splice(i, 1);
                    if(lis.length === 0) this._lis = undefined;
                }
                else i++;
                len == 0 ? l.fn() : len == 1 ? l.fn(a1) : len == 2 ? l.fn(a1,a2) : len == 3 ? l.fn(a1,a2,a3) :
                    l.fn.apply(null, args || (args = Array.from(arguments)));
            }
        }
    }
}