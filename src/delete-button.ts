export class DeleteButton extends HTMLElement
{
    private handleClickEvent:EventListener = this.deleteASquare.bind(this);

    private deleteASquare() : void
    {
        const squares = Array.from(document.body.querySelectorAll('square-component'));
        if (squares.length)
        {
            const squareToDelete = this.getRandomInt(0, squares.length - 1);
            squares[squareToDelete].remove();
        }
    }

    private getRandomInt(min:number, max:number) : number
    {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    connectedCallback()
    {
        this.addEventListener('click', this.handleClickEvent);
        setInterval(this.deleteASquare.bind(this), 1500);
    }
}