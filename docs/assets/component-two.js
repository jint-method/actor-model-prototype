import { Actor } from "./actor.js";
export class ComponentTwo extends Actor {
    constructor() {
        super('component-two');
    }
    inbox(data) {
        const { type } = data;
        switch (type) {
            case 'loaded':
                this.innerHTML = 'I received the message!';
                break;
            default:
                console.log(`Unknown message type: ${type}`);
                break;
        }
    }
    connected() {
        this.setAttribute('state', 'loaded');
        this.innerHTML = 'Component loaded.';
    }
}
