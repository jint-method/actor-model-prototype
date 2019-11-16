import { message } from './broadcaster.js';

export class CleanupButton extends HTMLElement
{
    private handleClickEvent:EventListener = () => {
        const data:MessageData = {
            type: 'cleanup',
        };
        message('broadcaster', data);
    }

    connectedCallback()
    {
        this.addEventListener('click', this.handleClickEvent);
    }
}