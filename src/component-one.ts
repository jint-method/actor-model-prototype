import { broadcaster } from "./broadcaster.js";

export class ComponentOne extends HTMLElement
{
    public inbox(data:Message) : void
    {
        console.log('Component one received a message:', data);
    }

    connectedCallback()
    {
        broadcaster.hookup('component-one', this.inbox);

        setTimeout(() => {
            broadcaster.message('component-two', {
                type: 'ping',
                timestamp: performance.now(),
            });
        }, 3000);
    }
}