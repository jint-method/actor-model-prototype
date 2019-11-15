/// <reference path="./broadcaster.d.ts" />

import { uuid } from './uuid.js';

class Broadcaster
{
    private worker : Worker;
    private inboxes : Array<Inbox>;
    private messageQueue : Array<BroadcastWorkerMessage>;
    private state : {
        workerReady: boolean,
    };

    constructor()
    {
        this.worker = new Worker(`${ window.location.origin }${ window.location.pathname }assets/worker.js`);
        this.worker.onmessage = this.inbox.bind(this);
        this.inboxes = [];
        this.messageQueue = [];
        this.state = {
            workerReady: false,
        };
    }

    /**
     * Set the broadcasters `workerReady` state to `true` and flush any queued messages.
     */
    private sendMessageQueue() : void
    {
        this.state.workerReady = true;
        if (this.messageQueue.length)
        {
            for (let i = 0; i < this.messageQueue.length; i++)
            {
                this.worker.postMessage(this.messageQueue[i]);
            }
        }
        this.messageQueue = [];
    }

    /**
     * The broadcasters private inbox. Used to handle `postMessages` from the `Worker`.
     */
    private inbox(e:MessageEvent) : void
    {
        const { type } = e.data;
        switch (type)
        {
            case 'ready':
                this.sendMessageQueue();
                break;
            default:
                break;
        }
    }

    /**
     * Sends a message to an actor's inbox.
     * @param actorName - the name of the actor(s) you want to send a message to
     * @param data - the `MessageData` object that will be sent to the actor(s) inbox
     */
    public message(actorName:string, data:MessageData) : void
    {
        const workerMessage:BroadcastWorkerMessage = {
            actor: actorName,
            data: data,
            messageId: uuid()
        };
        if (this.state.workerReady)
        {
            this.worker.postMessage(workerMessage);
        }
        else
        {
            this.messageQueue.push(workerMessage);
        }
    }

    /**
     * Register and hookup an actor's inbox.
     * @param name - the name of the actor
     * @param inbox - the function that will handle the actor's incoming messages
     */
    public hookup(name:string, inbox:Function) : void
    {
        const newInbox:Inbox = {
            callback: inbox
        };
        const address = this.inboxes.length;
        this.inboxes.push(newInbox);
        const workerMessage:BroadcastWorkerMessage = {
            actor: 'broadcast-worker',
            messageId: null,
            data: {
                type: 'hookup',
                name: name,
                inboxAddress: address,
            },
        };
        if (this.state.workerReady)
        {
            this.worker.postMessage(workerMessage);
        }
        else
        {
            this.messageQueue.push(workerMessage);
        }
    }
}

export const broadcaster:Broadcaster = new Broadcaster();
