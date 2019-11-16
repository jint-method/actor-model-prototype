import { broadcaster } from "./broadcaster.js";
export class SquareComponent extends HTMLElement {
    inbox(data) {
        const { type } = data;
        if (type === 'update-color') {
            this.style.backgroundColor = data.color;
        }
    }
    connectedCallback() {
        this.inboxId = broadcaster.hookup('square-component', this.inbox.bind(this));
    }
    disconnectedCallback() {
        broadcaster.disconnect(this.inboxId);
    }
}
