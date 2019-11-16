import { message } from './broadcaster.js';
export class CleanupButton extends HTMLElement {
    constructor() {
        super(...arguments);
        this.handleClickEvent = () => {
            const data = {
                type: 'cleanup',
            };
            message('broadcaster', data);
        };
    }
    connectedCallback() {
        this.addEventListener('click', this.handleClickEvent);
    }
}
