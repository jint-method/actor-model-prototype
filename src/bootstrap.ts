/** Imports the web component classes */
import { GenerateButton } from './generate-button.js';
import { ChangeColorButton } from './change-color-button.js';
import { DeleteButton } from './delete-button.js';
import { CleanupButton } from './cleanup-button.js';

/** IIFE for registering the custom elements as web components */
(() => {
    customElements.define('generate-button', GenerateButton);
    customElements.define('change-color-button', ChangeColorButton);
    customElements.define('delete-button', DeleteButton);
    customElements.define('cleanup-button', CleanupButton);
})();