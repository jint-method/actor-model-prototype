import { broadcaster } from './broadcaster.js';
export class Actor extends HTMLElement {
    constructor(inboxName) {
        super();
        this.inboxName = inboxName;
    }
    inbox(data) { }
    connected() { }
    disconnected() { }
    connectedCallback() {
        if (!this.inboxName) {
            console.warn(`This actor is missing an inbox name. Did you forget to call the classes constructor?`);
            this.inboxName = 'nil';
        }
        this.inboxId = broadcaster.hookup(this.inboxName, this.inbox.bind(this));
        this.connected();
    }
    disconnectedCallback() {
        broadcaster.disconnect(this.inboxId);
        this.disconnected();
    }
}
