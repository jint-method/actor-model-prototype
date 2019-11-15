/// <reference path="./worker.d.ts" />
/// <reference path="./broadcaster.d.ts" />
// @ts-ignore
self.importScripts('./worker-uuid.js');
const request = indexedDB.open('actors', 1);
request.onsuccess = (e) => {
    new BroadcastHelper(e.target.result);
};
request.onerror = (e) => {
    console.error('Something went wrong with opening the database', event);
};
request.onupgradeneeded = (e) => {
    const response = e.target;
    const db = response.result;
    /** Create actors object store in IDB */
    const store = db.createObjectStore('actors', { autoIncrement: true });
    store.createIndex('name', 'name', { unique: false });
    store.createIndex('uid', 'uid', { unique: true });
    store.createIndex('address', 'address', { unique: true });
    store.createIndex('sessionId', 'sessionId', { unique: false });
};
class BroadcastHelper {
    constructor(idb) {
        this.idb = idb;
        self.onmessage = this.handleMessage.bind(this);
        this.init();
    }
    /**
     * Remove all stale actors from the actors object store.
     */
    init() {
        const purgeRequest = this.idb.transaction('actors', 'readwrite').objectStore('actors').clear();
        purgeRequest.onsuccess = (e) => {
            // @ts-ignore
            self.postMessage({
                type: 'ready',
            });
        };
        purgeRequest.onerror = (e) => {
            console.error('Failed to purge old actor store:', e);
        };
    }
    /**
     * Add the actor to the IDB database.
     * @param data - an `ActorHookupMessage` object
     */
    async addActor(data) {
        const { name, inboxAddress } = data;
        const actorData = {
            name: name,
            address: inboxAddress,
            uid: uuid(),
        };
        const request = this.idb.transaction('actors', 'readwrite').objectStore('actors').put(actorData);
        request.onerror = (e) => {
            console.log(`Failed to add ${name} to IDBDatabase:`, e);
        };
    }
    /**
     * The personal inbox of the `broadcast-worker` actor.
     * @param data - the incoming `BroadcastWorkerMessage` data object
     */
    inbox(data) {
        switch (data.type) {
            case 'hookup':
                this.addActor(data);
                break;
            default:
                console.warn(`Unknown message type: ${data.type}`);
        }
    }
    async lookup(message) {
    }
    /** Worker received a message from another thread */
    handleMessage(e) {
        const { actor, data } = e.data;
        switch (actor) {
            case 'broadcast-worker':
                this.inbox(data);
                break;
            default:
                this.lookup(e.data);
                break;
        }
    }
}
