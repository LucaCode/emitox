/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import Event from "../index";

import { expect } from "chai";
import * as chai from "chai";
import * as sinon from 'sinon';

import * as cap from "chai-as-promised";
chai.use(cap)
chai.should();

describe('Emitox',() => {

    describe('on',() => {

        const testArgs = ([
            [],
            [true],
            [35,242],
            ['Luca','foo','emitix'],
            [{color: 'black',model: 'lambo'}],
            [24,34,23,65],
            ['a','b','c','d','e'],
            [{},[],{},[],{},[]],
            [null,23,undefined,34,24,21,424,34,623,5],
            [24,34,23,65,34,6,2,4,6,23,6,8,53],
        ] as any[][]);

        testArgs.forEach((args,index) => {
            it(index + '. should trigger an on-listener with correct args', () => {
                const event = new Event();
                const listener = sinon.fake();
                event.on(listener);

                event.emit(...args);
                sinon.assert.calledWith(listener,...args);
            });
        });

        testArgs.forEach((args,index) => {
            it(index + '. should trigger multiple on-listener with correct args', () => {
                const event = new Event<any>();
                const listener: sinon.SinonSpy<any>[] = [];

                for(let i = 0; i < 20; i++) listener.push(sinon.fake())
                listener.forEach(l => event.on(l))

                event.emit(...args);
                listener.forEach(l => sinon.assert.calledWith(l,...args));
            });
        });

    })

    describe('once',() => {

        it('should trigger an once-listener only once', () => {
            const event = new Event<[Error]>();
            const listener = sinon.fake();
            event.once(listener);

            const err = new Error();
            event.emit(err);
            event.emit(new Error());
            event.emit(new Error());

            sinon.assert.calledOnceWithExactly(listener,err);
        });

        it('should resolve promise-based once-listener', async () => {
            const event = new Event<[Error]>();
            const promise = event.once();
            event.emit(new Error());
            return expect(promise).to.be.fulfilled;
        });

        it('should resolve promise-based once-listener with timeout', async () => {
            const event = new Event<[Error]>();
            const promise = event.once(20000);
            event.emit(new Error());
            return expect(promise).to.be.fulfilled;
        });

        it('should reject promise-based once-listener with reached timeout', async () => {
            const event = new Event<[Error]>();
            const promise = event.once(20);
            return expect(promise).to.be.eventually.rejectedWith(Error)
        });

        it('should trigger multiple once-listener with correct args', () => {
            const event = new Event<[string]>();
            const listener: sinon.SinonSpy<any>[] = [];

            for(let i = 0; i < 20; i++) listener.push(sinon.fake())
            listener.forEach(l => event.once(l))

            const data = 'str';
            event.emit(data);

            listener.forEach(l => sinon.assert.calledWith(l,data));

            event.emit(data);

            listener.forEach(l => sinon.assert.calledOnce(l));
        });
    })

    describe('off',() => {

        const testData = ([
            ['should remove the listener',(e,l) => e.off(l)],
            ['should remove all listeners',e => e.off()]
        ] as [string,(emitter: Event<[]>,listener: () => void) => void][]);

        describe('On-Listener', () => {
            testData.forEach(([title,removeListener]) => {
                it(title, () => {
                    const emitter = new Event<[]>();
                    const listener = sinon.fake();
                    emitter.on(listener);
                    removeListener(emitter,listener);
                    emitter.emit();
                    sinon.assert.notCalled(listener);
                });
            })
        })

        describe('Once-Listener', () => {
            testData.forEach(([title,removeListener]) => {
                it(title, () => {
                    const emitter = new Event<[]>();
                    const listener = sinon.fake();
                    emitter.once(listener);
                    removeListener(emitter,listener);
                    emitter.emit();
                    sinon.assert.notCalled(listener);
                });
            })
        })

        it('Should remove one of two listeners', () => {
            const emitter = new Event<[]>();
            const listener1 = sinon.fake();
            const listener2 = sinon.fake();

            emitter.on(listener1);
            emitter.on(listener2);

            emitter.off(listener2);

            emitter.emit();

            sinon.assert.notCalled(listener2);
            sinon.assert.calledOnce(listener1);
        })

        it('Should remove all added listeners', () => {
            const emitter = new Event<[]>();
            const listener1 = sinon.fake();
            const listener2 = sinon.fake();

            emitter.on(listener1);
            emitter.on(listener2);

            emitter.off(listener1);
            emitter.off(listener2);

            emitter.emit();

            sinon.assert.notCalled(listener1);
            sinon.assert.notCalled(listener2);
        })

        it('Should remove one of two listeners', () => {
            const emitter = new Event<[]>();
            const listener1 = sinon.fake();
            const listener2 = sinon.fake();

            emitter.on(listener1);
            emitter.on(listener2);

            emitter.off(listener2);

            emitter.emit();

            sinon.assert.notCalled(listener2);
            sinon.assert.calledOnce(listener1);
        })

        it('Should remove listener in listener without skipping next listener', () => {
            const emitter = new Event<[]>();

            const listener1 = sinon.fake(() => {
                emitter.off(listener1);
            });
            const listener2 = sinon.fake();

            emitter.on(listener1);
            emitter.on(listener2);

            emitter.emit();

            sinon.assert.calledOnce(listener1);
            sinon.assert.calledOnce(listener2);
        })
    })

    describe('listenerCount',() => {

        it('should return the correct count of active listeners.', () => {
            const emitter = new Event();
            const listener1 = () => {};
            const listener2 = () => {};

            chai.expect(emitter.listenerCount()).to.be.equal(0);

            emitter.on(listener1);
            emitter.on(listener2);
            emitter.on(listener2);

            chai.expect(emitter.listenerCount()).to.be.equal(3);

            emitter.off(listener1);

            chai.expect(emitter.listenerCount()).to.be.equal(2);
        })

    })
})
