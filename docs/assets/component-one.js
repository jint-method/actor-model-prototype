import { broadcaster } from "./broadcaster.js";
export class ComponentOne extends HTMLElement {
    connectedCallback() {
        setTimeout(() => {
            this.innerHTML = 'I sent a message to the unloaded component.';
            broadcaster.message('component-two', { type: 'loaded' }, 'TCP');
        }, 1000);
        setTimeout(() => {
            import('./component-two.js').then((module) => {
                this.innerHTML = 'The other component has loaded.';
                customElements.define('component-two', module.ComponentTwo);
            });
        }, 6000);
    }
}
