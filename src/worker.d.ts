interface IDBEventTarget extends EventTarget
{
    result: any,
}
interface IDBEvent extends Event
{
    target: IDBEventTarget
}

interface ActorHookupMessage extends MessageData
{
    name: string,
    inboxAddress: number,
}

type ActorIDBData = {
    name: string,
    address: number,
    uid: string,
}