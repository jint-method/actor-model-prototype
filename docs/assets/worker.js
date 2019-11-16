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
        this.queueTimeout = 1000; // Milliseconds
        this.idb = idb;
        self.onmessage = this.handleMessage.bind(this);
        this.queuedMessages = [];
        this.queueTimer = null;
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
    async addInbox(data) {
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
                this.addInbox(data);
                break;
            default:
                console.warn(`Unknown message type: ${data.type}`);
        }
    }
    async lookup(message) {
        var _a, _b;
        const { recipient, data, protocol } = message;
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
                // @ts-ignore
                self.postMessage({
                    type: 'lookup',
                    data: data,
                    inboxIndexes: inboxAddressIndexes,
                });
            }
            else if (protocol === 'TCP' && message.messageId !== null) {
                if (((_a = message) === null || _a === void 0 ? void 0 : _a.attempts) < message.maxAttempts) {
                    message.attempts += 1;
                }
                else if (((_b = message) === null || _b === void 0 ? void 0 : _b.attempts) === message.maxAttempts) {
                    this.dropMessageFromQueue(message.messageId);
                }
                else {
                    message.attempts = 1;
                    this.queuedMessages.push(message);
                    if (this.queueTimer === null) {
                        this.queueTimer = setTimeout(this.sendMessageQueue.bind(this), this.queueTimeout);
                    }
                }
            }
        }
        catch (error) {
            console.error(error);
        }
    }
    sendMessageQueue() {
        for (let i = 0; i < this.queuedMessages.length; i++) {
            this.lookup(this.queuedMessages[i]);
        }
        if (this.queuedMessages.length) {
            this.queueTimer = setTimeout(this.sendMessageQueue.bind(this), this.queueTimeout);
        }
        else {
            this.queueTimer = null;
        }
    }
    dropMessageFromQueue(messageId) {
        for (let i = 0; i < this.queuedMessages.length; i++) {
            if (this.queuedMessages[i].messageId === messageId) {
                this.queuedMessages.splice(i, 1);
                break;
            }
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
