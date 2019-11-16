/** Imports the web component classes */
import { ComponentOne } from './component-one.js';
/** IIFE for registering the custom elements as web components */
(() => {
    customElements.define('component-one', ComponentOne);
})();
