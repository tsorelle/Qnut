namespace QnutDirectory {

    /**
     * Constants for entities editState
     */
    // todo:maybe refactor to peanut for general use
    export class editState {
        public static unchanged : number = 0;
        public static created : number = 1;
        public static updated : number = 2;
        public static deleted : number = 3;
    }

    /**
     * Person DTO as returned from services
     */
    // todo: update for peanut directory
    export class DirectoryPerson {
        public id             : any = null;
        public addressId      : any = null;
        public listingtypeId  : any = null;
        public fullname       : string = '';
        public email          : string = '';
        public username       : string = '';
        public phone          : string = '';
        public phone2         : string = '';
        public dateofbirth    : string = '';
        public junior         : string = '';
        public deceased       : string = '';
        public sortkey        : string = '';
        public notes          : string = '';
        public createdby      : string = '';
        public createdon      : string = '';
        public changedby      : string = '';
        public changedon      : string = '';
        public active         : number = 1;

        public editState : number = editState.created;
    }

    /**
     * address DTO as returned from services
     */
    export class DirectoryAddress {
        public id             : any = null;
        public addressname    : string = '';
        public address1       : string = '';
        public address2       : string = '';
        public city           : string = '';
        public state          : string = '';
        public postalcode     : string = '';
        public country        : string = '';
        public phone          : string = '';
        public notes          : string = '';
        public createdon      : string = '';
        public sortkey        : string = '';
        public addresstypeId  : any = null;
        public listingtypeId  : any = null;
        public latitude       : any = null;
        public longitude      : any = null;
        public changedby      : string = '';
        public changedon      : string = '';
        public createdby      : string = '';
        public active         : number = 1;

        public editState: number = editState.created;
    }

    /**
     * Related persons and address DTO as returned by service
     */
    export interface IDirectoryFamily {
        address : DirectoryAddress;
        persons: DirectoryPerson[];
        selectedPersonId : any;
    }

    export interface IAddressPersonServiceRequest {
        personId: any;
        addressId: any;
    }

    export interface INewPersonForAddressRequest {
        person: DirectoryPerson;
        addressId: any;
    }

    export interface INewAddressForPersonRequest {
        personId: any;
        address: DirectoryAddress;
    }

}