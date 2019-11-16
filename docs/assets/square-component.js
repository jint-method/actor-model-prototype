import { Actor } from './actor.js';
export class SquareComponent extends Actor {
    constructor() {
        super('square-component');
    }
    inbox(data) {
        const { type } = data;
        if (type === 'update-color') {
            this.style.backgroundColor = data.color;
        }
    }
}
