import { hookup, disconnect } from './broadcaster.js';
export class Actor extends HTMLElement {
    constructor(inboxName) {
        super();
        this.inboxName = inboxName;
    }
    inbox(data) { }
    connectedCallback() {
        if (!this.inboxName) {
            console.error(`An actor is missing it's inbox name. Did you forget to call the classes constructor?`);
            this.inboxName = 'nil';
        }
        this.inboxId = hookup(this.inboxName, this.inbox.bind(this));
    }
    disconnectedCallback() {
        disconnect(this.inboxId);
    }
}
