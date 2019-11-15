import { broadcaster } from "./broadcaster.js";
export class ComponentThree extends HTMLElement {
    constructor() {
        super();
        this.handleClickEvent = () => {
            const newElement = document.createElement('component-two');
            newElement.innerHTML = 'Generated Component Two';
            this.container.append(newElement);
            broadcaster.message('component-one', {
                type: 'change-color',
            });
        };
        this.container = document.body.querySelector('component-container');
    }
    connectedCallback() {
        this.addEventListener('click', this.handleClickEvent);
    }
}
