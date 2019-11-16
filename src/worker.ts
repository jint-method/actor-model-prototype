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

    constructor(idb:IDBDatabase)
    {
        this.idb = idb;
        self.onmessage = this.handleMessage.bind(this);
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
    private async addinbox(data:InboxHookupMessage)
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
                this.addinbox(data as InboxHookupMessage);
                break;
            default:
                console.warn(`Unknown message type: ${ data.type }`);
        }
    }

    private async lookup(message:Message)
    {
        const { recipient, data } = message;
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
            }
            // @ts-ignore
            self.postMessage({
                type: 'lookup',
                data: data,
                inboxIndexes: inboxAddressIndexes,
            });
        }
        catch (error)
        {
            console.error(error);
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