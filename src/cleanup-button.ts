import { broadcaster } from './broadcaster.js';

export class CleanupButton extends HTMLElement
{
    private handleClickEvent:EventListener = () => {
        const data:MessageData = {
            type: 'cleanup',
        };
        broadcaster.message('broadcaster', data);
    }

    connectedCallback()
    {
        this.addEventListener('click', this.handleClickEvent);
    }
}