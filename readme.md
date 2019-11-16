# Actor Model Prototype

The purpose of this prototype is to explore the idea of using the [Actor Model](https://en.wikipedia.org/wiki/Actor_model) on the web. I was introduced to this idea by [Surma](https://twitter.com/dassurma) and [Paul Lewis](https://twitter.com/aerotwist) from their talks at Chrome Dev Summit 2017 - 2019 along with their articles on [https://dassur.ma](https://dassur.ma)

This is **NOT** a library. The source code available within the repo is **UNTESTED** and **IS NOT** recommended for production use without proper testing. This is a proof of concept. Checkout the live demo at [https://messaging.jintmethod.dev](https://messaging.jintmethod.dev/)

#### References

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

The message method requires a recipient's name along with a `MessageData` object that contains a `type` string. Additional values can be sent within the `MessageData` object as long as they're a [transferable](https://www.w3.org/TR/html50/infrastructure.html#transferable) typed structure.

Inbox names are **NOT** unique and several scripts can register under the same inbox name. When a message is sent to a recipient all inboxes labeled as that recipient will receive the message.

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

If a message should never stop attempting to find a recipient and `Infinity` value can be used instead of an integer.
