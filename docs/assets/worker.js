/// <reference path="./worker.d.ts" />
/// <reference path="./messages.d.ts" />
const request = indexedDB.open('inboxes', 1);
request.onsuccess = (e) => {
    new BroadcastHelper(e.target.result);
};
request.onerror = (e) => {
    console.error('Something went wrong with opening the database', event);
};
request.onupgradeneeded = (e) => {
    const response = e.target;
    const db = response.result;
    /** Create inboxes object store in IDB */
    const store = db.createObjectStore('inboxes', { autoIncrement: true });
    store.createIndex('name', 'name', { unique: false });
    store.createIndex('uid', 'uid', { unique: true });
    store.createIndex('address', 'address', { unique: true });
};
class BroadcastHelper {
    constructor(idb) {
        this.idb = idb;
        self.onmessage = this.handleMessage.bind(this);
        this.init();
    }
    /**
     * Remove all stale inboxes from the inboxes object store.
     */
    init() {
        const purgeRequest = this.idb.transaction('inboxes', 'readwrite').objectStore('inboxes').clear();
        purgeRequest.onsuccess = (e) => {
            // @ts-ignore
            self.postMessage({
                type: 'ready',
            });
        };
        purgeRequest.onerror = (e) => {
            console.error('Failed to purge old inboxes store:', e);
        };
    }
    /**
     * Add the inbox to the IDB database.
     * @param data - an `InboxHookupMessage` object
     */
    async addinbox(data) {
        const { name, inboxAddress } = data;
        const inboxData = {
            name: name,
            address: inboxAddress,
            uid: this.generateUUID(),
        };
        const request = this.idb.transaction('inboxes', 'readwrite').objectStore('inboxes').put(inboxData);
        request.onerror = (e) => {
            console.log(`Failed to add ${name} to IDBDatabase:`, e);
        };
    }
    /**
     * The personal inbox of the `broadcast-worker` inbox.
     * @param data - the incoming `BroadcastWorkerMessage` data object
     */
    inbox(data) {
        switch (data.type) {
            case 'hookup':
                this.addinbox(data);
                break;
            default:
                console.warn(`Unknown message type: ${data.type}`);
        }
    }
    async lookup(message) {
        const { recipient, data } = message;
        try {
            const records = await new Promise((resolve, reject) => {
                const request = this.idb.transaction('inboxes', 'readonly').objectStore('inboxes').index('name').getAll(recipient);
                request.onsuccess = (e) => { resolve(e.target.result); };
                request.onerror = (e) => { reject(e); };
            });
            const inboxAddressIndexes = [];
            if (records.length) {
                for (let i = 0; i < records.length; i++) {
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
        catch (error) {
            console.error(error);
        }
    }
    /** Worker received a message from another thread */
    handleMessage(e) {
        const { recipient, data } = e.data;
        switch (recipient) {
            case 'broadcast-worker':
                this.inbox(data);
                break;
            default:
                this.lookup(e.data);
                break;
        }
    }
    generateUUID() {
        return new Array(4)
            .fill(0)
            .map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16))
            .join("-");
    }
}
