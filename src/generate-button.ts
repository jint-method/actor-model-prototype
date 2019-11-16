export class GenerateButton extends HTMLElement
{
    private container : HTMLElement;

    constructor()
    {
        super();
        this.container = document.body.querySelector('component-container');
    }

    private handleClickEvent:EventListener = this.generateNewSquareComponent.bind(this);

    private generateNewSquareComponent() : void
    {
        const newElement = document.createElement('square-component');
        this.container.append(newElement);
    }

    connectedCallback()
    {
        import('./square-component.js').then((module) => {
            customElements.define('square-component', module.SquareComponent);
            this.addEventListener('click', this.handleClickEvent);
            setInterval(this.generateNewSquareComponent.bind(this), 500);
        });
    }
}