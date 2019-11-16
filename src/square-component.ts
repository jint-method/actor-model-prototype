import { Actor } from './actor.js';

export class SquareComponent extends Actor
{
    constructor()
    {
        super('square-component');
    }

    public inbox(data:MessageData) : void
    {
        const { type } = data;
        if (type === 'update-color')
        {
            this.style.backgroundColor = data.color;
        }
    }
}