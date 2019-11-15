import { broadcaster } from "./broadcaster.js";
export class ComponentOne extends HTMLElement {
    inbox(data) {
        const { type } = data;
        switch (type) {
            case 'change-color':
                this.updateColor();
                break;
        }
    }
    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    updateColor() {
        const timestamp = performance.now();
        const color = this.getRandomColor();
        console.log(`Component one sent a message to component two.`);
        this.style.color = color;
        broadcaster.message('component-two', {
            type: 'ping',
            timestamp: timestamp,
            color: color,
        });
    }
    connectedCallback() {
        broadcaster.hookup('component-one', this.inbox.bind(this));
        setTimeout(() => {
            this.updateColor();
        }, 3000);
    }
}
