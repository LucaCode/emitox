# Emitox 🪄
High performance, modern, lightweight, and typesafe single Events.

[![Downloads](https://img.shields.io/npm/dm/emitox)](https://www.npmjs.com/package/emitox)
[![Minzipped size](https://img.shields.io/bundlephobia/minzip/emitox)](https://www.npmjs.com/package/emitox)
[![Test coverage](https://img.shields.io/badge/test%20coverage-97.03%20%25-brightgreen)](https://www.npmjs.com/package/emitox)
[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://lbesson.mit-license.org/)

## What is Emitox
***Emitox*** is a high performance, modern, lightweight, and typesafe single event instance emitter. The bigger brother of Emitox is Emitix which provides support for multiple events in a single instance. Emitox is highly optimized and performs about the same as Emitix.

## How to use Emitox

### Basic usage

```typescript
import Event, {EventListener} from "emitox";

const buttonClickEvent = new Event<[string]>();

//Adds an on-listener that gets invoked every time when the event fires.
buttonClickEvent.on((buttonId => {
    console.log(`Button: ${buttonId} has been clicked.`);
}));

//Adds a once-listener that gets invoked when the event fires and will be removed.
buttonClickEvent.once(buttonId => {})

//Without a callback/listener, the once method returns a promise.
//An optional timeout can be provided.
buttonClickEvent.once(5000).then(([buttonId]) => {
    console.log(`Button has been clicked in time.`);
}).catch(() => {
    console.log("Timeout occurred...");
})

//Removes all on/once listeners.
buttonClickEvent.off();

//EventListener utility type can be used to
//create a typesafe listener function as a variable.
const clickListener: EventListener<typeof buttonClickEvent> = (buttonId) => {};
buttonClickEvent.on(clickListener)

//Removes the specific listener.
buttonClickEvent.off(clickListener);

//Triggers the event.
//It will call every listener of the event with the provided arguments.
buttonClickEvent.emit("Btn_Top");
buttonClickEvent.emit("Btn_Bottom");

//Returns the count of listeners.
buttonClickEvent.listenerCount();
```

### Protected event
Provide the event as a getter but avoid the ability to trigger the event from outside.

```typescript
import Event, {ProtectedEvent} from "emitox";

type ButtonClickEvent = Event<[string]>;

class UiController {

    private _buttonClickEvent: ButtonClickEvent = new Event();
    get buttonClickEvent(): ProtectedEvent<ButtonClickEvent> { 
        return this.buttonClickEvent; 
    }

    private foo() {
        //Everything is okay
        this._buttonClickEvent.emit('Btn_Left');
    }
}

const uiController = new UiController();

//ERROR
uiController.buttonClickEvent.emit("Hello from outside!");

//Everything is okay
uiController.buttonClickEvent.on(buttonId => {})
```

## License

MIT License

Copyright (c) 2024 Ing. Luca Gian Scaringella

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.