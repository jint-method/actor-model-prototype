# Actor Model Prototype

The purpose of this prototype is to explore the idea of using a modified version of the [Actor Model](https://en.wikipedia.org/wiki/Actor_model) messaging system for the web. This prototype was inspired by the prototypes created by [Surma](https://twitter.com/dassurma) and [Paul Lewis](https://twitter.com/aerotwist) for their presentations at Chrome Dev Summit 2018 & 2019.

This is **NOT** a library. The source code available within the repo is **UNTESTED** and **IS NOT** recommended for production use without proper testing. This is a proof of concept. Checkout the live demo at [https://messaging.jintmethod.dev](https://messaging.jintmethod.dev/).

### References:

- [The Actor Model](https://youtu.be/un-pSOlTaY0): brief introduction video explaining the Actor Model
- [An Actor, a model and an architect walk onto the web...](https://dassur.ma/things/actormodel/): introduction to the idea of using the Actor Model on the web
- [The 9am rush hour](https://dassur.ma/things/the-9am-rush-hour/): introduction to the idea of utilizing workers for non-DOM related work
- [Lights, Camera, Action!](https://dassur.ma/things/lights-camera-action/): expanding upon the Actor Model on the web article
- [Architecting Web Apps](https://youtu.be/Vg60lf92EkM): video showcasing the use of the Actor Model in a web application
- [The main thread is overworked & underpaid](https://youtu.be/7Rrv9qFMWNM): a video expanding upon the idea that the main thread should be reserved for UI work

## Overview

All scripts communicate using the `Broadcaster` class.

The class is available using:

```typescript
import { broadcaster } from './broadcaster.js';
```

When a script wants to receive a message it registers an inbox with the Broadcaster:

```typescript
broadcaster.hookup('my-inbox-name', this.inbox.bind(this));
```

Anything can send a message through the Broadcaster:

```typescript
broadcaster.message('recipient-inbox-name', { type: 'message-type' });
```

The `broadcaster.message()` method requires a recipient name along with a `MessageData` object that contains a message type. Additional values can be sent within the `MessageData` object as long as they're a [transferable](https://www.w3.org/TR/html50/infrastructure.html#transferable) structure.

Inboxes **DO NOT** have unique name. Several inboxes can be registered under the same name. When a message is sent to an inbox `foo` all inboxes labeled as `foo` will receive the message.

Scripts can register several inboxes. All inboxes can point to one inbox callback function:

```typescript
import { broadcaster } from './broadcaster.js';
class FooClass
{
    private inbox(data:MessageData) : void
    {
        console.log(data);
    }

    private init()
    {
        broadcaster.hookup('foo', this.inbox.bind(this));
        broadcaster.hookup('bar', this.inbox.bind(this));
    }
}
```

The `broadcaster.hookup()` function returns a unique ID for the registered inbox:

```typescript
const inboxId = broadcaster.hookup('foo', this.inbox.bind(this));
```

An inbox can be disconnected from the Broadcaster:

```typescript
broadcaster.disconnect(inboxUniqueId);
```

By default `broadcaster.message()` sends messages using the `UDP` message protocol and the message will be dropped if an inbox is not found for the recipient.

A `TCP` message protocol is available. Messages will be resent until a recipient inbox is found or the maximum number of attempts has been reached:

```typescript
broadcaster.message('foo', { type: 'test' }, 'TCP');
```

The maximum number of attempts before a `TCP` message is dropped defaults to `100` but the value can be overridden:

```typescript
broadcaster.message('foo', { type: 'test' }, 'TCP', 200);
```

If a message should never be dropped the `Infinity` value can be used instead of an integer.

On low-end devices (<= 4gb RAM) disconnected inboxes are removed every minute.

On all other devices disconnected inboxes are removed every 5 minutes.
