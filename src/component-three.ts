import { broadcaster } from "./broadcaster.js";

export class ComponentThree extends HTMLElement
{
    private container : HTMLElement;

    constructor()
    {
        super();
        this.container = document.body.querySelector('component-container');
    }

    private handleClickEvent:EventListener = () => {
        const newElement = document.createElement('component-two');
        newElement.innerHTML = 'Generated Component Two';
        this.container.append(newElement);
        broadcaster.message('component-one', {
            type: 'change-color',
        });
    }

    connectedCallback()
    {
        this.addEventListener('click', this.handleClickEvent);
    }
}