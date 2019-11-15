import { ComponentOne } from './component-one.js';
import { ComponentTwo } from './component-two.js';

(() => {
    customElements.define('component-one', ComponentOne);
    customElements.define('component-two', ComponentTwo);
})();