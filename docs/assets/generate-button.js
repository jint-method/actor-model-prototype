export class GenerateButton extends HTMLElement {
    constructor() {
        super();
        this.handleClickEvent = this.generateNewSquareComponent.bind(this);
        this.container = document.body.querySelector('component-container');
    }
    generateNewSquareComponent() {
        const newElement = document.createElement('square-component');
        this.container.append(newElement);
    }
    connectedCallback() {
        import('./square-component.js').then((module) => {
            customElements.define('square-component', module.SquareComponent);
            this.addEventListener('click', this.handleClickEvent);
            setInterval(this.generateNewSquareComponent.bind(this), 500);
        });
    }
}
