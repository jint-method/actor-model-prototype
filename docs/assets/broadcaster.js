/// <reference path="./broadcaster.d.ts" />
import { uuid } from './uuid.js';
class Broadcaster {
    constructor() {
        this.worker = new Worker(`${window.location.origin}/assets/worker.js`);
        this.worker.onmessage = this.inbox.bind(this);
        this.inboxes = [];
        this.messageQueue = [];
        this.state = {
            workerReady: false,
        };
    }
    sendMessageQueue() {
        this.state.workerReady = true;
        if (this.messageQueue.length) {
            for (let i = 0; i < this.messageQueue.length; i++) {
                this.worker.postMessage(this.messageQueue[i]);
            }
        }
        this.messageQueue = [];
    }
    inbox(e) {
        const { type } = e.data;
        switch (type) {
            case 'ready':
                this.sendMessageQueue();
                break;
            default:
                break;
        }
    }
    /**
     * Sends a message to an actor(s).
     * @param message - an object containing the actors name and a data object
     */
    message(actorName, data) {
        const workerMessage = {
            actor: actorName,
            data: data,
            messageId: uuid()
        };
        if (this.state.workerReady) {
            this.worker.postMessage(workerMessage);
        }
        else {
            this.messageQueue.push(workerMessage);
        }
    }
    /**
     * Register and hookup the actors inbox.
     * @param name - the name of the actor
     * @param inbox - the function that will handle the actor's incoming messages
     */
    hookup(name, inbox) {
        const newInbox = {
            callback: inbox
        };
        const address = this.inboxes.length;
        this.inboxes.push(newInbox);
        const workerMessage = {
            actor: 'broadcast-worker',
            messageId: null,
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
}
export const broadcaster = new Broadcaster();
