declare namespace Mailboxes {
    export interface IMailBox {
        id:string;
        displaytext:string;
        description:string;
        mailboxcode:string ;
        address:string;
        state:number;
    }
}