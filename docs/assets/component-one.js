import { broadcaster } from "./broadcaster.js";
export class ComponentOne extends HTMLElement {
    inbox(data) {
        console.log('Component one received a message:', data);
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
        broadcaster.hookup('component-one', this.inbox.bind(this));
        setTimeout(() => {
            const timestamp = performance.now();
            const color = this.getRandomColor();
            console.log(`Component one sent a message to component two.`);
            this.style.color = color;
            broadcaster.message('component-two', {
                type: 'ping',
                timestamp: timestamp,
                color: color,
            });
        }, 3000);
    }
}
