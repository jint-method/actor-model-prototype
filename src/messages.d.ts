type Message = {
    recipient: string,
    data: MessageData,
}

type MessageData = {
    type: string,
    [key:string]: any,
}

interface BroadcastWorkerMessage extends Message
{
    messageId: string,
    protocol: 'UDP'|'TCP',
    maxAttempts?: number,
    attempts?: number,
}

interface InboxHookupMessage extends MessageData
{
    name: string,
    inboxAddress: number,
}