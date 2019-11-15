import { broadcaster } from "./broadcaster.js";

export class ComponentTwo extends HTMLElement
{
    public inbox(data:MessageData) : void
    {
        console.log('Component two received a message:', data);
        const { type } = data;
        if (type === 'pint')
        {
            console.log(data.timestamp);
            performance.now();
        }
    }

    connectedCallback()
    {
        broadcaster.hookup('component-two', this.inbox);
    }
}