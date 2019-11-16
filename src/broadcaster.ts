/// <reference path="./messages.d.ts" />

type Inbox = {
    callback: Function,
}

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
        this.worker.onmessage = this.handleMessage.bind(this);
        this.inboxes = [];
        this.messageQueue = [];
        this.state = {
            workerReady: false,
        };
    }

    /**
     * Set the broadcasters `workerReady` state to `true` and flush any queued messages.
     */
    private flushMessageQueue() : void
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

    private sendDataToInboxes(inboxIndexes:Array<number>, data:MessageData) : void
    {
        for (let i = 0; i < inboxIndexes.length; i++)
        {
            try
            {
                this.inboxes[inboxIndexes[i]].callback(data);
            }
            catch (error)
            {
                this.inboxes[inboxIndexes[i]].callback = ()=>{};
                const workerMessage:BroadcastWorkerMessage = {
                    recipient: 'broadcast-worker',
                    messageId: null,
                    protocol: 'UDP',
                    data: {
                        type: 'disconnect',
                        inboxAddress: inboxIndexes[i],
                    },
                };
                this.postMessageToWorker(workerMessage);
            }
        }
    }

    /**
     * Broadcaster received a message from another thread.
     * This method is an alias of `this.worker.onmessage`
     */
    private handleMessage(e:MessageEvent) : void
    {
        const data = e.data;
        if (data.recipient?.trim().toLowerCase() === 'broadcaster')
        {
            this.inbox(data.data);
        }
        else
        {
            this.sendDataToInboxes(data.inboxIndexes, data.data);
        }
    }

    /**
     * The broadcaster's personal inbox.
     */
    private inbox(data:MessageData) : void
    {
        const { type } = data;
        switch (type)
        {
            case 'ready':
                this.flushMessageQueue();
                break;
            default:
                console.warn(`Unknown broadcaster message type: ${ data.type }`);
                break;
        }
    }

    /**
     * Sends a message to an inbox.
     * @param recipient - the name of the inboxes you want to send a message to
     * @param data - the `MessageData` object that will be sent to the inboxes
     * @param protocol - `UDP` will attempt to send the message but will not guarantee it arrives, `TCP` will attempt to deliver the message until the `maxAttempts` have been exceeded
     * @param maxAttempts - the maximum number of attempts before the `TCP` message is dropped
     */
    public message(recipient:string, data:MessageData, protocol:'UDP'|'TCP' = 'UDP', maxAttempts:number = 100) : void
    {
        const workerMessage:BroadcastWorkerMessage = {
            recipient: recipient,
            data: data,
            messageId: this.generateUUID(),
            protocol: protocol,
        };
        if (protocol === 'TCP')
        {
            workerMessage.maxAttempts = maxAttempts;
        }
        this.postMessageToWorker(workerMessage);
    }

    /**
     * Register and hookup an inbox.
     * @param name - the name of the inbox
     * @param inbox - the function that will handle the inboxes incoming messages
     */
    public hookup(name:string, inbox:Function) : void
    {
        const newInbox:Inbox = {
            callback: inbox
        };
        const address = this.inboxes.length;
        this.inboxes.push(newInbox);
        const workerMessage:BroadcastWorkerMessage = {
            recipient: 'broadcast-worker',
            messageId: null,
            protocol: 'UDP',
            data: {
                type: 'hookup',
                name: name,
                inboxAddress: address,
            },
        };
        this.postMessageToWorker(workerMessage);
    }

    /**
     * Sends a message to the worker using `postMessage()` or queues the message if the worker isn't ready.
     * @param message - the `BroadcastWorkerMessage` object that will be sent
     */
    private postMessageToWorker(message:BroadcastWorkerMessage) : void
    {
        if (this.state.workerReady)
        {
            this.worker.postMessage(message);
        }
        else
        {
            this.messageQueue.push(message);
        }
    }

    /**
     * Quick and dirty unique ID generation.
     * This method does not follow RFC 4122 and does not guarantee a universally unique ID.
     * @see https://tools.ietf.org/html/rfc4122
     */
    private generateUUID() : string
    {
        return new Array(4)
            .fill(0)
            .map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16))
            .join("-");
    }
}

export const broadcaster:Broadcaster = new Broadcaster();
