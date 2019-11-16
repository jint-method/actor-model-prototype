import { hookup, disconnect } from './broadcaster.js';

export class Actor extends HTMLElement
{
    public inboxId : string;
    private inboxName : string;

    constructor(inboxName:string)
    {
        super();
        this.inboxName = inboxName;
    }

    public inbox(data:MessageData):void {}
    public connected():void {}
    public disconnected():void {}

    private connectedCallback()
    {
        if (!this.inboxName)
        {
            console.error(`An actor is missing it's inbox name. Did you forget to call the classes constructor?`);
            this.inboxName = 'nil';
        }
        this.inboxId = hookup(this.inboxName, this.inbox.bind(this));
        this.connected();
    }

    private disconnectedCallback()
    {
        disconnect(this.inboxId);
        this.disconnected();
    }
}