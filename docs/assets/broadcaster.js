/// <reference path="./messages.d.ts" />
class Broadcaster {
    constructor() {
        this.worker = new Worker(`${window.location.origin}${window.location.pathname}assets/worker.js`);
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
    flushMessageQueue() {
        this.state.workerReady = true;
        if (this.messageQueue.length) {
            for (let i = 0; i < this.messageQueue.length; i++) {
                this.worker.postMessage(this.messageQueue[i]);
            }
        }
        this.messageQueue = [];
    }
    sendDataToInboxes(inboxIndexes, data) {
        for (let i = 0; i < inboxIndexes.length; i++) {
            this.inboxes[inboxIndexes[i]].callback(data);
        }
    }
    /**
     * The broadcaster's personal inbox. Used to handle `postMessages` from the `Worker`.
     */
    inbox(e) {
        const { type } = e.data;
        switch (type) {
            case 'ready':
                this.flushMessageQueue();
                break;
            default:
                this.sendDataToInboxes(e.data.inboxIndexes, e.data.data);
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
    message(recipient, data, protocol = 'UDP', maxAttempts = 100) {
        const workerMessage = {
            recipient: recipient,
            data: data,
            messageId: this.generateUUID(),
            protocol: protocol,
        };
        if (protocol === 'TCP') {
            workerMessage.maxAttempts = maxAttempts;
        }
        if (this.state.workerReady) {
            this.worker.postMessage(workerMessage);
        }
        else {
            this.messageQueue.push(workerMessage);
        }
    }
    /**
     * Register and hookup an inbox.
     * @param name - the name of the inbox
     * @param inbox - the function that will handle the inboxes incoming messages
     */
    hookup(name, inbox) {
        const newInbox = {
            callback: inbox
        };
        const address = this.inboxes.length;
        this.inboxes.push(newInbox);
        const workerMessage = {
            recipient: 'broadcast-worker',
            messageId: null,
            protocol: 'UDP',
            data: {
                type: 'hookup',
                name: name,
                inboxAddress: address,
            },
        };
        if (this.state.workerReady) {
            this.worker.postMessage(workerMessage);
        }
        else {
            this.messageQueue.push(workerMessage);
        }
    }
    /**
     * Quick and dirty unique ID generation.
     * This method does not follow RFC 4122 and does not guarantee a universally unique ID.
     * @see https://tools.ietf.org/html/rfc4122
     */
    generateUUID() {
        return new Array(4)
            .fill(0)
            .map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16))
            .join("-");
    }
}
export const broadcaster = new Broadcaster();
