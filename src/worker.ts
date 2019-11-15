/// <reference path="./worker.d.ts" />
/// <reference path="./broadcaster.d.ts" />

// @ts-ignore
self.importScripts('./worker-uuid.js');

const request = indexedDB.open('actors', 1);
request.onsuccess = (e:IDBEvent) => {
    new BroadcastHelper(e.target.result);
}
request.onerror = (e:Event) => {
    console.error('Something went wrong with opening the database', event);
}
request.onupgradeneeded = (e:Event) => {
    const response = e.target as IDBOpenDBRequest;
    const db = response.result;
    
    /** Create actors object store in IDB */
    const store = db.createObjectStore('actors', { autoIncrement: true });
    store.createIndex('name', 'name', { unique: false } );
    store.createIndex('uid', 'uid', { unique: true });
    store.createIndex('address', 'address', { unique: true});
    store.createIndex('sessionId', 'sessionId', { unique: false });
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
     * Remove all stale actors from the actors object store.
     */
    private init()
    {
        const purgeRequest = this.idb.transaction('actors', 'readwrite').objectStore('actors').clear();
        purgeRequest.onsuccess = (e:IDBEvent) => {
            // @ts-ignore
            self.postMessage({
                type: 'ready',
            });
        }
        purgeRequest.onerror = (e:IDBEvent) => {
            console.error('Failed to purge old actor store:', e);
        }
    }

    /**
     * Add the actor to the IDB database.
     * @param data - an `ActorHookupMessage` object
     */
    private async addActor(data:ActorHookupMessage)
    {
        const { name, inboxAddress } = data;
        const actorData:ActorIDBData = {
            name: name,
            address: inboxAddress,
            uid: uuid(),
        }
        const request = this.idb.transaction('actors', 'readwrite').objectStore('actors').put(actorData);
        request.onerror = (e:IDBEvent) => {
            console.log(`Failed to add ${ name } to IDBDatabase:`, e);
        };
    }

    /**
     * The personal inbox of the `broadcast-worker` actor.
     * @param data - the incoming `BroadcastWorkerMessage` data object
     */
    private inbox(data:MessageData)
    {
        switch (data.type)
        {
            case 'hookup':
                this.addActor(data as ActorHookupMessage);
                break;
            default:
                console.warn(`Unknown message type: ${ data.type }`);
        }
    }

    private async lookup(message:BroadcastWorkerMessage)
    {
        
    }

    /** Worker received a message from another thread */
    private handleMessage(e:MessageEvent)
    {
        const { actor, data } = e.data;
        switch (actor)
        {
            case 'broadcast-worker':
                this.inbox(data);
                break;
            default:
                this.lookup(e.data);
                break;
        }
    }
}