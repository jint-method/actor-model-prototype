interface IDBEventTarget extends EventTarget
{
    result: any,
}
interface IDBEvent extends Event
{
    target: IDBEventTarget
}

type InboxIDBData = {
    name: string,
    address: number,
    uid: string,
}