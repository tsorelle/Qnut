declare namespace Mailboxes {
    export interface IMailBox {
        id:string;
        displaytext:string;
        description:string;
        mailboxcode:string ;
        address:string;
        'public': any;
    }

    export interface IMailMessage {
        // toName : string;
        mailboxCode: string;
        fromName : string;
        fromAddress : string;
        subject : string;
        body : string;
    }

    export interface IGetContactFormResponse {
        mailboxCode: string;
        mailboxList: IMailBox[];
        mailboxName: string;
        fromName: string;
        fromAddress: string;
        translations: string[];
    }

}