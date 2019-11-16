export class DeleteButton extends HTMLElement {
    constructor() {
        super(...arguments);
        this.handleClickEvent = this.deleteASquare.bind(this);
    }
    deleteASquare() {
        const squares = Array.from(document.body.querySelectorAll('square-component'));
        if (squares.length) {
            const squareToDelete = this.getRandomInt(0, squares.length - 1);
            squares[squareToDelete].remove();
        }
    }
    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    connectedCallback() {
        this.addEventListener('click', this.handleClickEvent);
        setInterval(this.deleteASquare.bind(this), 1500);
    }
}
