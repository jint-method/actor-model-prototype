import { broadcaster } from "./broadcaster.js";
export class ComponentTwo extends HTMLElement {
    inbox(data) {
        const { type } = data;
        if (type === 'ping') {
            console.log(`I was pinged! This is the timestamp: ${data.timestamp} : ${performance.now()}`);
            this.style.color = data.color;
        }
    }
    connectedCallback() {
        broadcaster.hookup('component-two', this.inbox.bind(this));
    }
}
