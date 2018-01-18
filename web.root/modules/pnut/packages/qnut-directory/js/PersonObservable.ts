/// <reference path='../js/DirectoryEntities.ts' />
namespace QnutDirectory {
    /**
     * observable container for person panel
     */
    export class personObservable extends directoryEditPanel {
        public personId = ko.observable('');
        public fullName = ko.observable('');
        public firstname = ko.observable('');
        public lastname = ko.observable('');
        public middlename = ko.observable('');
        public phone = ko.observable('');
        public phone2 = ko.observable('');
        public email = ko.observable('');
        public dateOfBirth = ko.observable('');
        public deceased= ko.observable('');
        public notes = ko.observable('');
        public active= ko.observable(1);
        public username = ko.observable('');
        public lastUpdate = ko.observable('');
        public emailLink : KnockoutComputed<string>;
        private ignoreTriggers = false;
        public affiliations : IAffiliation[] = [];
        public affiliationList= ko.observableArray<IAffiliationListItem>();
        public organizations : Peanut.ILookupItem[] = [];
        public refreshButtonTitle = ko.observable();

        public nameError = ko.observable('');
        public emailError = ko.observable('');
        public affiliationError = ko.observable('');


        public affiliationRoles = ko.observableArray<Peanut.ILookupItem>();
        public selectedOrganization = ko.observable<Peanut.ILookupItem>();
        public selectedAffiliationRole = ko.observable<Peanut.ILookupItem>();
        public orgListVisible = ko.observable(false);
        public orgListSubscription : KnockoutSubscription;
        public orgLookupList = ko.observableArray<Peanut.ILookupItem>();
        public orgSearchValue = ko.observable('');

        public emailSubscriptionList : KnockoutObservableArray<ISubscriptionListItem> = ko.observableArray([])
        public emailSubscriptionsView : KnockoutObservableArray<ISubscriptionListItem> = ko.observableArray([])

        // public emailLists :

        ages = ko.observableArray(['Infant','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18']);


        constructor(owner: any) {
            super(owner);
            let me = this;
            me.emailLink = ko.computed(me.computeEmailLink);
            me.orgSearchValue('');
            me.orgListSubscription = me.orgSearchValue.subscribe(me.onOrgSearchChange);
        }

        computeEmailLink = () => {
            let me = this;
            let email = me.email();
            return email ? 'mailto:' + me.fullName() + '<' + email + '>' : '#';
        };

        public static concatenateFullName(first: string, middle: string, last: string) {
            let result = first;
            if (middle) {
                result += (result  ? ' ' : '')+middle;
            }
            if (last) {
                result += (result  ? ' ' : '')+last;
            }
            return result;
        };

        refreshFullname = () => {
            let me = this;
            me.fullName(personObservable.concatenateFullName(me.firstname(),me.middlename(),me.lastname()));
        };


        calculateDob = (item: any) => {
            let me = this;
            if (isNaN(item)) {
                item = 0;
            }
            let today = new Date;
            let year = today.getFullYear();
            let dd = today.getDate();
            let mm = today.getMonth()+1; //January is 0!

            year -= item;
            me.dateOfBirth(year + '-' + mm + '-' + dd);
        };

        assignEmailSubscriptionList = (items: Peanut.ILookupItem[]) => {
            let me = this;
            this.createSubscriptionList(me.emailSubscriptionList,items);
        };

        assignEmailSubscriptions = (subscriptions: any[]) => {
            let me=this;
            me.assignSubscriptions(me.emailSubscriptionList,me.emailSubscriptionsView, subscriptions);
        };


        /**
         * reset fields
         */
        public clear = () => {
            let me=this;
            me.isAssigned = false;
            me.clearValidations();
            me.fullName('');
            me.firstname('');
            me.lastname('');
            me.middlename('');
            me.username('');
            me.phone('');
            me.phone2('');
            me.email('');
            me.dateOfBirth('');
            me.notes('');
            me.active(1);
            me.directoryListingTypeId = ko.observable(1);
            me.lastUpdate('');
            me.personId('');
            me.assignEmailSubscriptions([]);
            me.affiliations = [];
            me.updateAffiliationList();
        };

        public clearValidations = () => {
            let me = this;
            me.nameError('');
            me.emailError('');
            me.affiliationError('');
            me.hasErrors(false);
        };

        /**
         * set fields from person DTO
         */
        public assign = (person: DirectoryPerson) => {
            let me=this;
            if (!person) {
                me.clear();
                return;
            }
            me.isAssigned = true;
            me.clearValidations();
            me.fullName(person.fullname);
            me.firstname(person.firstname);
            me.lastname(person.lastname);
            me.middlename(person.middlename);

            // me.fullName(person.fullname);
            me.username(person.username);
            me.phone(person.phone);
            me.phone2(person.phone2);
            me.email(person.email);
            me.dateOfBirth(person.dateofbirth);
            me.notes(person.notes);
            // me.junior(person.junior == '1');
            me.active(person.active);
            me.directoryListingTypeId(person.listingtypeId);
            me.lastUpdate(person.changedon);
            me.personId(person.id);
            let directoryListingItem = me.getDirectoryListingItem();
            me.selectedDirectoryListingType(directoryListingItem);
            me.affiliations = person.affiliations;
            me.updateAffiliationList();
            me.assignEmailSubscriptions(person.emailSubscriptions);
        };

        private updateAffiliationList = () => {
            let me = this;
            me.affiliationList([]);
            _.each(me.affiliations,(affiliation: IAffiliation) => {
                let org = _.find(me.organizations, (org: Peanut.ILookupItem) => {
                    return org.id == affiliation.organizationId;
                });

                let role = _.find(me.affiliationRoles(), (role: Peanut.ILookupItem) => {
                    return role.id == affiliation.roleId;
                });
                if (org && role) {
                    me.affiliationList.push(
                        {
                            roleId: affiliation.roleId,
                            organizationId: affiliation.organizationId,
                            organizationName: org.name,
                            roleName: role.name
                        });
                }
            });
        };

        onOrgSearchChange = (value: string) => {
            let me = this;
            if (value) {
                me.selectedOrganization(null);
                me.orgLookupList([]);
                value = value.toLowerCase();
                let newlist = _.filter(me.organizations, (org: Peanut.ILookupItem) => {
                    return (org.name.toLowerCase().indexOf(value) >= 0);
                });
                me.orgLookupList(newlist);
                me.orgListVisible(newlist.length > 0);
            }
            else {
                me.orgLookupList(me.organizations);
            }
        };

        onOrgSelect = (item: Peanut.ILookupItem) => {
            let me = this;
            me.selectedOrganization(item);
            me.affiliationError('');
            me.clearOrgSearch(item.name);
        };

        clearOrgSearch = (text: string = '') => {
            let me=this;
            me.orgListVisible(false);
            me.orgListSubscription.dispose();
            me.orgSearchValue(text);
            me.orgListSubscription = me.orgSearchValue.subscribe(me.onOrgSearchChange);
        };

        onShowOrgList = () => {
            let me = this;
            if (me.orgListVisible()) {
                me.clearOrgSearch();
            }
            else {
                me.orgLookupList(me.organizations);
                me.orgListVisible(true);
            }
        };

        removeAffiliation = (affiliation: IAffiliationListItem) => {
            let me = this;
            _.remove(me.affiliations,(item: IAffiliation) => {
                return (item.organizationId == affiliation.organizationId && item.roleId == affiliation.roleId);
            });
            me.updateAffiliationList();
        };

        public addAffiliation = () => {
            let me = this;
            let org = me.selectedOrganization();
            if (!org) {
                me.affiliationError(me.translate('dir-affiliation-error'));
                return;
            }
            let role = me.selectedAffiliationRole();
            if (!role) {
                me.affiliationError(me.translate('dir-affiliation-role-error'));
                return;
            }
            jQuery("#add-affiliation-modal").modal('hide');
            me.affiliations.push(
                {
                    organizationId: me.selectedOrganization().id,
                    roleId: me.selectedAffiliationRole().id
                }
            );
            me.updateAffiliationList();
        };

        public showAddAffiliationModal = () => {
            let me = this;
            // me.selectedAffiliationRole(null);
            me.affiliationError('');
            me.selectedOrganization(null);
            me.clearOrgSearch();
            jQuery("#add-affiliation-modal").modal('show');
        };

        public updateDirectoryPerson = (person: DirectoryPerson) => {
            let me = this;

            person.active = me.active();
            person.id = me.personId();
            let listingType = me.selectedDirectoryListingType();
            if (listingType) {
                let listingId = listingType.id ? listingType.id : 0;
                me.directoryListingTypeId(listingId);

            }
            person.affiliations = me.affiliations;
            person.listingtypeId = me.directoryListingTypeId();
            person.dateofbirth = me.dateOfBirth();
            /*
            if (person.dateofbirth) {
                me.junior(false);
            }
            person.junior = me.junior() ? '1' : '0';
            */
            person.deceased = me.deceased();
            person.email = me.email();
            person.fullname = me.fullName();
            person.firstname = me.firstname();
            person.middlename = me.middlename();
            person.lastname = me.lastname();
            person.notes = me.notes();
            person.phone = me.phone();
            person.phone2 = me.phone2();
            person.username = me.username();
            person.emailSubscriptions = me.getSelectedSubscriptions(me.emailSubscriptionList,me.emailSubscriptionsView);
        };

        public validate = ():boolean => {
            let me = this;
            me.clearValidations();
            let valid = true;
            let value=me.fullName();
            if (!value) {
                me.refreshFullname();
                value = me.fullName();
            }
            if (!value) {
                me.nameError(": " + me.translate('directory-name-error'));
                valid = false;
            }
            value = me.email();
            if (value) {
                let emailOk = Peanut.Helper.ValidateEmail(value);
                if (!emailOk) {
                    me.emailError(': ' +  me.translate('form-error-email-invalid')); //Please enter a valid email address.');
                    valid = false;
                }
            }
            me.hasErrors(!valid);
            return valid;
        };

    }


}