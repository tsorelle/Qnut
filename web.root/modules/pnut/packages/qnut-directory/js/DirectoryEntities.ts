namespace QnutDirectory {
    /**
     * Person DTO as returned from services
     */
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
        // public junior         : string = '';
        public deceased       : string = '';
        public sortkey        : string = '';
        public notes          : string = '';
        public createdby      : string = '';
        public createdon      : string = '';
        public changedby      : string = '';
        public changedon      : string = '';
        public active         : number = 1;

        public address: DirectoryAddress;
        public affiliations: IAffiliation[];

        public editState : number = Peanut.editState.created;
    }

    export interface IAffiliation {
        organizationId: any;
        roleId: any;
    }

    export interface IAffiliationListItem extends IAffiliation {
        organizationName: string;
        roleName: string;
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

        public residents : Peanut.INameValuePair[];

        public editState: number = Peanut.editState.created;
    }


}