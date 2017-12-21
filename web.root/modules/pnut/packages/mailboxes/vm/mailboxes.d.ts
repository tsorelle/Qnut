declare namespace Mailboxes {
    import ITranslator = Peanut.ITranslator;

    export interface IMailBox {
        id:string;
        displaytext:string;
        description:string;
        mailboxcode:string ;
        address:string;
        'public': any;
        active: any;
    }

    export interface IMailboxFormOwner extends ITranslator {
        mailboxList : KnockoutObservableArray<IMailBox>;
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

    export interface IGetMailboxesResponse {
        list: IMailBox[];
        translations: string[];
    }

}