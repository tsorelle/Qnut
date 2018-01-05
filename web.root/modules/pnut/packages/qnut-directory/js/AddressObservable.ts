/// <reference path='../js/DirectoryEntities.ts' />
namespace QnutDirectory {
    /**
     * observable container for address panel
     */
    export class addressObservable extends directoryEditPanel {

        public addressId : KnockoutObservable<any> =  ko.observable();
        public addressname= ko.observable('');
        public address1= ko.observable('');
        public address2= ko.observable('');
        public addressTypeId = ko.observable(1);
        public city= ko.observable('');
        public state= ko.observable('');
        public postalcode= ko.observable('');
        public country= ko.observable('');
        public phone= ko.observable('');
        public notes= ko.observable('');
        public active  = ko.observable(1);
        public sortkey= ko.observable('');
        public lastUpdate = ko.observable('');
        public cityLocation : KnockoutComputed<string>;
        public addressNameError = ko.observable('');
        public addressTypes : KnockoutObservableArray<Peanut.ILookupItem> = ko.observableArray([]);
        public selectedAddressType : KnockoutObservable<Peanut.ILookupItem> = ko.observable();
        public selectedListingType:  KnockoutObservable<Peanut.ILookupItem>  = ko.observable();
        public postalSubscriptionList: KnockoutObservableArray<ISubscriptionListItem> = ko.observableArray([]);
        public postalSubscriptionsView: KnockoutObservableArray<ISubscriptionListItem> = ko.observableArray([]);

        private nameSubscription : KnockoutSubscription = null;

        constructor(owner: any) {
            super(owner);
            let me = this;
            me.cityLocation = ko.computed(me.computeCityLocation);
        }

        public search() {
            let me = this;

            me.viewState('search');
        }



        computeCityLocation = ()  => {
            let me = this;
            let city = me.city();
            let state = me.state();
            let zip = me.postalcode();

            let result = city ? city : '';

            if (result) {
                if (state) {
                    result = result + ', ';
                }
            }
            if (state) {
                result = result + state;
            }

            if (zip) {
                result = result + ' ' + zip;
            }

            return result;
        };

        assignPostalSubscriptionList = (items: Peanut.ILookupItem[]) => {
            let me = this;
            this.createSubscriptionList(me.postalSubscriptionList,items);
        };

        assignPostalSubscriptions = (subscriptions: any[]) => {
            let me=this;
            me.assignSubscriptions(me.postalSubscriptionList,me.postalSubscriptionsView, subscriptions);
        };


        /**
         * reset fields
         */
        public clear = () => {
            let me = this;
            me.isAssigned = false;
            me.clearValidations();
            me.addressname('');
            me.address1('');
            me.address2('');
            me.city('');
            me.state('');
            me.postalcode('');
            me.country('');
            me.phone('');
            me.notes('');
            me.active (1);
            me.sortkey('');
            me.lastUpdate('');
            me.addressId(null);
            me.addressTypeId(1);
            me.directoryListingTypeId(1);
            me.assignPostalSubscriptions([]);
        };

        private clearValidations = () => {
            let me = this;
            me.hasErrors(false);
            me.addressNameError('');
        };

        public validate = ():boolean => {
            let me = this;
            me.clearValidations();
            let valid = true;
            let value = me.addressname();
            if (!value) {
                me.addressNameError(': ' + me.translate('form-error-name-blank')); //Please enter a name for the address");
                me.hasErrors(true);
                return false;
            }

            return true;
        };


        /**
         * Set fields from address DTO
         */
        public assign = (address : DirectoryAddress) => {
            let me = this;
            me.isAssigned = true;
            me.clearValidations();
            me.sortkey(address.sortkey);
            me.setName(address.addressname);
            me.address1(address.address1);
            me.address2(address.address2);
            me.city(address.city);
            me.state(address.state);
            me.postalcode(address.postalcode);
            me.country(address.country);
            me.phone(address.phone);
            me.notes(address.notes);
            me.active (address.active);
            me.lastUpdate(address.changedon);
            me.addressId(address.id);
            me.addressTypeId(address.addresstypeId);
            me.directoryListingTypeId(address.listingtypeId);
            // let directoryListingItem = me.getDirectoryListingItem();
            let directoryListingItem = me.getLookupItem( me.directoryListingTypeId(), me.owner.directoryListingTypes());
            me.selectedDirectoryListingType(directoryListingItem);
            let addressTypeItem = me.getLookupItem(address.addresstypeId, me.addressTypes());
            me.selectedAddressType(addressTypeItem);
            me.assignPostalSubscriptions(address.postalSubscriptions);
        };

        private setName = (value) => {
            let me = this;
            if (me.nameSubscription) {
                me.nameSubscription.dispose();
            }
            me.addressname(value);
            me.nameSubscription = me.addressname.subscribe(me.updateSortKey);
        };

        public updateSortKey = (name: string) => {
            let me = this;
            name = name.trim();
            if (name == '') {
                me.sortkey('');
            }
            else if (me.sortkey().trim() == '') {
                let addressType = me.selectedAddressType();
                if (addressType !== null && addressType.code == 'home') {
                    me.sortkey(NameParser.getFileAsName(name));
                }
                else {
                    me.sortkey(NameParser.getAddressSortKey(name));
                }
            }
        };

        public refreshSortKey = () => {
            let me = this;
            me.sortkey('');
            me.updateSortKey(me.addressname());
        };

        public updateDirectoryAddress = (address: DirectoryAddress) => {
            let me = this;
            address.address1 = me.address1();
            address.address2 = me.address2();
            address.addressname = me.addressname();
            address.city = me.city();
            address.state = me.state();
            address.postalcode = me.postalcode();
            address.country = me.country();
            address.phone = me.phone();
            address.notes = me.notes();
            address.active = me.active();
            address.sortkey = me.sortkey();
            address.addresstypeId = me.addressTypeId();

            let listingType = me.selectedDirectoryListingType();
            if (listingType) {
                let listingId = listingType.id || 0;
                me.directoryListingTypeId(listingId);
            }
            address.listingtypeId = me.directoryListingTypeId();
            address.postalSubscriptions = me.getSelectedSubscriptions(me.postalSubscriptionList,me.postalSubscriptionsView);
        }
    }

}