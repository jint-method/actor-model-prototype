/// <reference path="./worker.d.ts" />
/// <reference path="./messages.d.ts" />

const request = indexedDB.open('inboxes', 1);
request.onsuccess = (e:IDBEvent) => {
    new BroadcastHelper(e.target.result);
}
request.onerror = (e:Event) => {
    console.error('Something went wrong with opening the database', event);
}
request.onupgradeneeded = (e:Event) => {
    const response = e.target as IDBOpenDBRequest;
    const db = response.result;
    
    /** Create inboxes object store in IDB */
    const store = db.createObjectStore('inboxes', { autoIncrement: true });
    store.createIndex('name', 'name', { unique: false } );
    store.createIndex('uid', 'uid', { unique: true });
    store.createIndex('address', 'address', { unique: true});
}

class BroadcastHelper
{
    private idb : IDBDatabase;
    private queuedMessages : Array<BroadcastWorkerMessage>;
    private queueTimer : any;
    private queueTimeout: number = 1000; // Milliseconds

    constructor(idb:IDBDatabase)
    {
        this.idb = idb;
        self.onmessage = this.handleMessage.bind(this);
        this.queuedMessages = [];
        this.queueTimer = null;
        this.init();
    }

    /**
     * Remove all stale inboxes from the inboxes object store.
     */
    private init()
    {
        const purgeRequest = this.idb.transaction('inboxes', 'readwrite').objectStore('inboxes').clear();
        purgeRequest.onsuccess = (e:IDBEvent) => {
            // @ts-ignore
            self.postMessage({
                type: 'ready',
            });
        }
        purgeRequest.onerror = (e:IDBEvent) => {
            console.error('Failed to purge old inboxes store:', e);
        }
    }

    /**
     * Add the inbox to the IDB database.
     * @param data - an `InboxHookupMessage` object
     */
    private async addInbox(data:InboxHookupMessage)
    {
        const { name, inboxAddress } = data;
        const inboxData:InboxIDBData = {
            name: name,
            address: inboxAddress,
            uid: this.generateUUID(),
        }
        const request = this.idb.transaction('inboxes', 'readwrite').objectStore('inboxes').put(inboxData);
        request.onerror = (e:IDBEvent) => {
            console.log(`Failed to add ${ name } to IDBDatabase:`, e);
        };
    }

    /**
     * The personal inbox of the `broadcast-worker` inbox.
     * @param data - the incoming `BroadcastWorkerMessage` data object
     */
    private inbox(data:MessageData)
    {
        switch (data.type)
        {
            case 'hookup':
                this.addInbox(data as InboxHookupMessage);
                break;
            default:
                console.warn(`Unknown message type: ${ data.type }`);
        }
    }

    private async lookup(message:BroadcastWorkerMessage)
    {
        const { recipient, data, protocol } = message;
        try
        {
            const records:Array<InboxIDBData> = await new Promise((resolve, reject) => {
                const request = this.idb.transaction('inboxes', 'readonly').objectStore('inboxes').index('name').getAll(recipient);
                request.onsuccess = (e:IDBEvent) => { resolve(e.target.result); };
                request.onerror = (e:IDBEvent) => { reject(e); };
            });
            const inboxAddressIndexes:Array<number> = [];
            if (records.length)
            {
                for (let i = 0; i < records.length; i++)
                {
                    inboxAddressIndexes.push(records[i].address);
                }
                // @ts-ignore
                self.postMessage({
                    type: 'lookup',
                    data: data,
                    inboxIndexes: inboxAddressIndexes,
                });
            }
            else if (protocol === 'TCP' && message.messageId !== null)
            {
                if (message?.attempts < message.maxAttempts)
                {
                    message.attempts += 1;
                }
                else if (message?.attempts === message.maxAttempts)
                {
                    this.dropMessageFromQueue(message.messageId);
                }
                else
                {
                    message.attempts = 1;
                    this.queuedMessages.push(message);
                    if (this.queueTimer === null)
                    {
                        this.queueTimer = setTimeout(this.sendMessageQueue.bind(this), this.queueTimeout);
                    }
                }
            }
        }
        catch (error)
        {
            console.error(error);
        }
    }

    private sendMessageQueue() : void
    {
        for (let i = 0; i < this.queuedMessages.length; i++)
        {
            this.lookup(this.queuedMessages[i]);
        }
        
        if (this.queuedMessages.length)
        {
            this.queueTimer = setTimeout(this.sendMessageQueue.bind(this), this.queueTimeout);
        }
        else
        {
            this.queueTimer = null;
        }
    }

    private dropMessageFromQueue(messageId:string) : void
    {
        for (let i = 0; i < this.queuedMessages.length; i++)
        {
            if (this.queuedMessages[i].messageId === messageId)
            {
                this.queuedMessages.splice(i, 1);
                break;
            }
        }
    }

    /** Worker received a message from another thread */
    private handleMessage(e:MessageEvent)
    {
        const { recipient, data } = e.data;
        switch (recipient)
        {
            case 'broadcast-worker':
                this.inbox(data);
                break;
            default:
                this.lookup(e.data);
                break;
        }
    }

    private generateUUID() : string
    {
        return new Array(4)
            .fill(0)
            .map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16))
            .join("-");
    }
}