/** Imports the web component classes */
import { ComponentOne } from './component-one.js';
import { ComponentTwo } from './component-two.js';
import { ComponentThree } from './component-three.js';

/** IIFE for registering the custom elements as web components */
(() => {
    customElements.define('component-one', ComponentOne);
    customElements.define('component-two', ComponentTwo);
    customElements.define('component-three', ComponentThree);
})();