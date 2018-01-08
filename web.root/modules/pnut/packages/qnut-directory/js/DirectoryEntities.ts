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
        public emailSubscriptions : any[];

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
        public postalSubscriptions: any[];

        public editState: number = Peanut.editState.created;
    }


    /** observable container classes **/
        // borrowed from peanut.EditPanel, due to inheritance and loading issues.
    export class editPanel {
        public viewState = ko.observable('');
        public hasErrors = ko.observable(false);
        public isAssigned = false;
        public relationId : any = null;

        protected owner: any;

        protected translator: Peanut.ITranslator;

        public constructor(owner: any) {
            let me = this;
            me.owner = owner;
        }

        public translate = (code:string, defaultText:string = null) => {
            return (<Peanut.ITranslator>this.owner).translate(code,defaultText);
        };

        /**
         * set view state 'edit'
         */
        public edit(relationId: any = null){
            let me = this;
            me.viewState('edit');
            me.relationId = relationId;
        }
        /**
         * set view state 'closed'
         */
        public close() {
            let me = this;
            me.viewState('closed');
        }
        /**
         * set view state 'search'
         */
        public search() {
            let me = this;
            me.viewState('search');
        }
        /**
         * set view state 'empty'
         */
        public empty() {
            let me = this;
            me.viewState('empty');
        }
        /**
         * set view state 'view'
         */
        public view() {
            let me = this;
            if (me.isAssigned) {
                me.viewState('view');
            }
            else {
                me.viewState('empty');
            }
        }

        /**
         * Set view state, iqnore any constraints
         * @param state
         */
        public setViewState(state = 'view') {
            let me = this;
            me.viewState(state);
        }
    }

    export interface ISubscriptionListItem extends Peanut.ILookupItem  {
        subscribed: boolean;
    }

    export class directoryEditPanel extends editPanel {
        public searchList: Peanut.searchListObservable;
        public directoryListingTypeId = ko.observable(1);
        public selectedDirectoryListingType : KnockoutObservable<Peanut.ILookupItem> = ko.observable(null);
        public listingTypes : KnockoutObservableArray<Peanut.ILookupItem>;
        public constructor(owner: any) {
            super(owner);
            let me = this;
            if (Peanut.searchListObservable) {
                // not used in some cases
                me.searchList = new Peanut.searchListObservable(2, 10);
            }
        }
        protected getDirectoryListingItem = () => {
            let me = this;
            let lookup =  me.owner.directoryListingTypes(); // me.listingTypes();
            let id = me.directoryListingTypeId();
            if (!id) {
                id = 0;
            }
            let key = id.toString();

            let result = _.find(lookup,function(item : Peanut.ILookupItem) {
                return item.id == key;
            }); // ,me);  // lodash doesn't have context param
            return result;
        };

        protected getLookupItem = (id: any, lookup: Peanut.ILookupItem[]) => {
            let me = this;
            // let lookup =  me.owner.directoryListingTypes(); // me.listingTypes();
            // let id = me.directoryListingTypeId();
            if (!id) {
                id = 0;
            }
            let key = id.toString();

            let result = _.find(lookup,function(item : Peanut.ILookupItem) {
                return item.id == key;
            }); // ,me);  // lodash doesn't have context param
            return result;
        };

        protected createSubscriptionList(list: KnockoutObservableArray<ISubscriptionListItem>,items: Peanut.ILookupItem[]) {
            items.sort((a: Peanut.ILookupItem, b: Peanut.ILookupItem) => {
                if (a.name === b.name) {
                    return 0;
                }
                else if (a.name > b.name) {
                    return 1;
                }
                else {
                    return -1;
                }
            });
            _.each(items, (item) => {
                list.push(
                    <ISubscriptionListItem>{
                        code : item.code,
                        id: item.id,
                        name: item.name,
                        description: item.description,
                        subscribed: false
                    });
            });

        }

        protected assignSubscriptions(
            checkList: KnockoutObservableArray<ISubscriptionListItem>,
            viewList: KnockoutObservableArray<ISubscriptionListItem>,subscriptions: any[]) {
            let me = this;
            let check = checkList();
            checkList([]);
            viewList([]);
            let view = [];
            let newList = [];
            _.each(check, (item: ISubscriptionListItem) => {
                item.subscribed = (subscriptions.indexOf(item.id) > -1);
                if (item.subscribed) {
                    view.push(item);
                }
                newList.push(item);
            });
            checkList(newList);
            viewList(view);
        }

        protected getSelectedSubscriptions(checkList: KnockoutObservableArray<ISubscriptionListItem>,
                                           viewList: KnockoutObservableArray<ISubscriptionListItem>) {
            let selected = [];
            let subscriptions = checkList();
            let temp = _.filter(subscriptions,(item: ISubscriptionListItem) => {
                if (item.subscribed) {
                    selected.push(item.id);
                    return true;
                }
            });
            viewList(temp);
            return selected;
        }
    }


}