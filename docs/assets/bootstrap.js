import { ComponentOne } from './component-one.js';
import { ComponentTwo } from './component-two.js';
import { ComponentThree } from './component-three.js';
(() => {
    customElements.define('component-one', ComponentOne);
    customElements.define('component-two', ComponentTwo);
    customElements.define('component-three', ComponentThree);
})();
