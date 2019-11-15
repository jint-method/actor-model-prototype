type Message = {
    actor: string,
    data: MessageData,
}

type MessageData = {
    type: string,
    [key:string]: any,
}

interface BroadcastWorkerMessage extends Message
{
    messageId: string,
}

type Inbox = {
    callback: Function,
}