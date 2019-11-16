import { message } from './broadcaster.js';
export class ChangeColorButton extends HTMLElement {
    constructor() {
        super(...arguments);
        this.handleClickEvent = this.sendChangeColorMessage.bind(this);
    }
    sendChangeColorMessage() {
        const data = {
            type: 'update-color',
            color: this.getRandomColor(),
        };
        message('square-component', data);
    }
    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    connectedCallback() {
        this.addEventListener('click', this.handleClickEvent);
        setInterval(this.sendChangeColorMessage.bind(this), 1500);
    }
}
