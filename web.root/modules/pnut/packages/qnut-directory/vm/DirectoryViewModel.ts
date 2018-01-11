/// <reference path="../../../../pnut/core/ViewModelBase.ts" />
/// <reference path='../../../../typings/knockout/knockout.d.ts' />
/// <reference path='../../../../typings/jqueryui/jqueryui.d.ts' />
/// <reference path='../../../../typings/lodash/find/index.d.ts' />
/// <reference path='../../../../typings/lodash/findIndex/index.d.ts' />
/// <reference path='../../../../typings/lodash/each/index.d.ts' />
/// <reference path='../../../../typings/lodash/first/index.d.ts' />
/// <reference path='../../../../typings/lodash/reject/index.d.ts' />
/// <reference path='../../../../typings/lodash/filter/index.d.ts' />
/// <reference path='../../../../pnut/core/peanut.d.ts' />
/// <reference path='../../../../pnut/js/searchListObservable.ts' />
/// <reference path='../js/DirectoryEntities.ts' />
/// <reference path='../js/PersonObservable.ts' />
/// <reference path='../js/AddressObservable.ts' />

namespace QnutDirectory {

    /** Service Contracts  and related interfaces **/
    interface IDirectoryFamily {
        address : DirectoryAddress;
        persons: DirectoryPerson[];
        selectedPersonId : any;
    }

    interface IAddressPersonServiceRequest {
        personId: any;
        addressId: any;
    }

    interface INewPersonForAddressRequest {
        person: DirectoryPerson;
        addressId: any;
    }

    interface INewAddressForPersonRequest {
        personId: any;
        address: DirectoryAddress;
    }

    interface ISearchRequest extends Peanut.INameValuePair {
        Exclude: any;
    }

    interface IInitDirectoryResponse {
        canEdit : boolean;
        listingTypes : Peanut.ILookupItem[];
        addressTypes : Peanut.ILookupItem[];
        organizations: Peanut.ILookupItem[];
        affiliationRoles: Peanut.ILookupItem[];
        emailLists : Peanut.ILookupItem[];
        postalLists : Peanut.ILookupItem[];
        family : IDirectoryFamily;
        translations : string[];
    }

    /** View Model **/

    export class DirectoryViewModel extends Peanut.ViewModelBase {
        // observables
        public family = new clientFamily();

        private insertAssociation = 'none';
        private personUpdateOperation = 'update';

        //  *********** Observables ****************/
        personFormHeader: KnockoutComputed<string>; // initialization in constructor
        searchValue = ko.observable('');
        searchType = ko.observable('');
        addressPersonsList = ko.observableArray<Peanut.INameValuePair>();
        userCanEdit = ko.observable(true);
        debugMode = ko.observable(false);
        userIsAuthorized = ko.observable(false);
        public showEditButton: KnockoutComputed<boolean>;
        public showAddPersonButton: KnockoutComputed<boolean>;
        public showPersonViewButtons: KnockoutComputed<boolean>;
        familiesList: Peanut.searchListObservable;
        personsList: Peanut.searchListObservable;
        addressesList: Peanut.searchListObservable;
        directoryListingTypes: KnockoutObservableArray<Peanut.ILookupItem> = ko.observableArray();

        personForm:  personObservable;
        addressForm: addressObservable;

        /** Computed observables **/
        private computeShowPersonViewButtons = () => {
            let me = this;
            return (me.userCanEdit() && (me.addressForm.viewState() == 'view' || me.addressForm.viewState() == 'empty'));
        };
        private computeShowAddPersonButton = () => {
            let me = this;
            return (me.family.personCount() < 2 &&
                (me.userCanEdit() && (me.personForm.viewState() == 'view' || me.personForm.viewState() == 'empty')));
        };
        private computeShowEditButton = () => {
            let me = this;
            // userCanEdit() && (personForm.viewState() == 'view' || personForm.viewState() == 'empty'
            return me.userCanEdit() && (me.personForm.viewState() == 'view' || me.personForm.viewState() == 'empty');
        };
        /**
         * Compute person form header from selected person.
         * @returns {string}
         */
        public computePersonFormHeader = () => {
            let me = this;
            let name = me.personForm.fullName();
            return name ? name : 'Person';
        };

        /** Initialization **/

        init(successFunction?: () => void) {
            let me = this;
            console.log('Directory Init');

            me.application.loadResources([
                '@lib:jqueryui-css',
                '@lib:jqueryui-js',
                '@lib:lodash',
                '@pnut/ViewModelHelpers',
                '@pnut/searchListObservable',
                '@pkg/qnut-directory/DirectoryEntities'], () => {
                me.application.loadResources([
                    '@pkg/qnut-directory/PersonObservable',
                    '@pkg/qnut-directory/AddressObservable'], () => {
                    me.familiesList = new Peanut.searchListObservable(6, 10);
                    me.personsList = new Peanut.searchListObservable(2, 12);
                    me.addressesList = new Peanut.searchListObservable(2, 12);
                    me.personForm = new personObservable(me);
                    me.addressForm = new addressObservable(me);
                    me.personFormHeader = ko.computed(me.computePersonFormHeader);
                    me.showEditButton = ko.computed(me.computeShowEditButton);
                    me.showAddPersonButton = ko.computed(me.computeShowAddPersonButton);
                    me.showPersonViewButtons = ko.computed(me.computeShowPersonViewButtons);

                    // initialize date popups
                    jQuery(function () {
                        jQuery(".datepicker").datepicker();
                    });
                    me.getInitializations(() => {
                        me.bindDefaultSection();
                        successFunction();
                    });
                });
            });
        }


        getInitializations(doneFunction?: () => void) {
            let me = this;
            me.application.hideServiceMessages();

            let personId = Peanut.Helper.getRequestParam('pid');
            me.showLoadWaiter();
            me.services.executeService('peanut.qnut-directory::membership.InitializeDirectory',personId,
                function(serviceResponse: Peanut.IServiceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        let response = <IInitDirectoryResponse>serviceResponse.Value;
                        me.userCanEdit(response.canEdit);
                        me.personForm.organizations = response.organizations;
                        me.personForm.affiliationRoles(response.affiliationRoles);
                        me.directoryListingTypes(response.listingTypes);
                        me.addressForm.addressTypes(response.addressTypes);
                        me.userIsAuthorized(response.canEdit);

                        me.personForm.assignEmailSubscriptionList(response.emailLists);
                        me.addressForm.assignPostalSubscriptionList(response.postalLists);

                        if (response.family) {
                            me.searchType('Persons');
                            me.selectFamily(response.family);
                        }
                        me.addTranslations(response.translations);
                    }
                    else {
                        me.userCanEdit(false);
                    }
                })
                .fail(function () {
                    let trace = me.services.getErrorInformation();
                })
                .always(function () {
                    me.application.hideWaiter();
                    if (doneFunction) {
                        doneFunction();
                    }
                });
        }

        private selectFamily = (family: IDirectoryFamily) => {
            let me = this;
            me.addressPersonsList([]);
            let selected = me.family.setFamily(family);
            me.refreshFamilyForms(selected);
        };

        private refreshFamilyForms(selected : DirectoryPerson) {
            let me = this;
            if (selected) {
                me.personForm.assign(<DirectoryPerson>selected);
                me.personForm.view();
            }
            else {
                me.personForm.empty();
            }

            if (me.family.address) {
                me.addressForm.assign(me.family.address);
                me.buildPersonSelectList(selected);
                me.addressForm.view();
            } else {
                me.addressPersonsList([]);
                me.addressForm.empty();
            }
            me.buildPersonSelectList(selected);
            me.family.visible(true);
        }

        private buildPersonSelectList(selected) {
            let me = this;
            me.family.persons.sort(function(x: DirectoryPerson,y: DirectoryPerson) {
                if (x.id === y.id ) {
                    return 0;
                }
                if (x.sortkey > y.sortkey) {
                    return 1;
                }
                return -1;
            });

            let personList = [];
            if (selected) {
                _.each(me.family.persons, function (person:DirectoryPerson) {
                    if (person.editState != Peanut.editState.deleted && person.id != selected.id) {
                        personList.push(<Peanut.INameValuePair> {
                            Name: person.fullname,
                            Value: person.id.toString(),
                        });
                    }
                }); // , selected);
                if (me.userCanEdit()) {
                    personList.push(<Peanut.INameValuePair>{
                        Name: me.translate('dir-list-new-person'), //'Find or create new person'
                        Value: 'new'
                    });
                }
            }
            me.addressPersonsList(personList);
        }

        /************* Porting ***************************************/
        /**
         * On click of person link in person form search view
         * @param personItem
         */
        public addPersonToAddress = (personItem : Peanut.INameValuePair) => {
            let me = this;
            if (me.family.address == null) {
                return;
            }

            let request = <IAddressPersonServiceRequest> {
                addressId:  me.family.address.id,
                personId: personItem.Value
            } ;

            me.application.hideServiceMessages();
            me.showActionWaiterBanner('update','dir-address-entity');
            me.application.showWaiter('Updating...');
            me.services.executeService('peanut.qnut-directory::membership.AddPersonToAddress',request, me.handleAddPersonToAddressResponse)
                .always(function() {
                    me.application.hideWaiter();
                });

        };

        /**
         * On click of address link in address form search view
         * @param addressItem
         */
        public assignAddressToPerson = (addressItem : Peanut.INameValuePair) => {
            let me = this;
            let request = <IAddressPersonServiceRequest> {
                addressId: addressItem.Value,
                personId: me.family.selectedPersonId
            };

            me.application.hideServiceMessages();
            me.application.showWaiter('Updating...');
            me.services.executeService('peanut.qnut-directory::membership.ChangePersonAddress',request, me.handleChangePersonAddress)
                .always(function() {
                    me.application.hideWaiter();
                });

            me.addressesList.reset();
            me.addressForm.view();
        };

        public cancelAddressEdit() {
            let me = this;
            // rollback changes
            if (me.family.isLoaded()) {
                me.addressForm.assign(me.family.address);
                me.addressForm.view();
            }
            else {
                me.family.visible(false);
                me.addressForm.clear();
            }
        }

        public cancelPersonEdit() {
            let me = this;
            // rollback changes to form
            if (me.family.isLoaded()) {
                let selected = me.family.getSelected();
                me.personForm.assign(selected);
                me.personForm.view();
            }
            else {
                me.family.visible(false);
                me.personForm.clear();
            }
        }
        /**
         * On click of cancel button in address form search view
         */
        public cancelAddressSearch() {
            let me = this;
            me.addressesList.reset();
            me.addressForm.view();
        }

        /**
         * on click of cancel button, person panel search view
         */
        public cancelPersonSearch() {
            let me = this;
            me.personsList.reset();
            me.personForm.view();
        }

        private clearAddressSearchList() {
            let me = this;
            let list = [];
            if (me.family.address) {
                list.push(<Peanut.INameValuePair>{
                    Name: '(No address)',
                    Value: null
                });
            }
            me.addressesList.setList(list);
        }
        public createAddressForPerson() {
            let me = this;
            me.addressesList.reset();
            me.addressForm.clear();
            me.addressForm.edit(me.family.selectedPersonId);
        }
        /**
         * on click of create person button dropdown on address form
         */
        public createPersonForAddress() {
            let me = this;
            me.personForm.clear();
            let addressId = me.family.address ? me.family.address.id : null;
            me.personForm.edit(addressId);
        }

        private createSelectedPersonRequest() {
            let me = this;
            return <IAddressPersonServiceRequest> {
                personId: me.family.selectedPersonId,
                addressId: me.family.address ? me.family.address.id : 0
            };
        }

        public deleteAddress() {
            let me = this;
            me.showAddressDeleteConfirmForm();
        }

        public deletePerson() {
            let me = this;
            me.showPersonDeleteConfirmForm();
        }

        public addAffiliation = () => {
            let me = this;
            jQuery("#confirm-delete-address-modal").modal('hide');
        };

        public showAddAffiliationModal() {
            jQuery("#confirm-delete-address-modal").modal('show');
        }

        /**
         * On click item link in found panel
         * @param item
         */
        public displayFamily = (item : Peanut.INameValuePair) => {
            let me = this;
            me.family.visible(false);
            me.familiesList.reset();
            me.personForm.clear();
            me.personForm.close();
            me.addressForm.clear();
            me.addressForm.close();
            me.addressPersonsList([]);

            let request  = <Peanut.INameValuePair>{
                Name: me.searchType(),
                Value: item.Value
            };

            me.application.hideServiceMessages();
            me.application.showWaiter('Locating family...');
            me.services.executeService('peanut.qnut-directory::membership.GetFamily',request,
                (serviceResponse: Peanut.IServiceResponse)=> {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        let family = <IDirectoryFamily>serviceResponse.Value;
                        me.selectFamily(family);
                    }
                }
            )
            .fail(() => {
                let err = me.services.getErrorInformation();
            })
            .always(function() {
                me.application.hideWaiter();
            });
        };

        /**
         * On click of edit button on address panel view mode
         */
        public editAddress() {
            let me = this;
            me.addressForm.edit();
        }

        /**
         * on click of edit button in person panel view mode
         */
        public editPerson() {
            let me = this;
            // avoid accidental click as default button.
            let addressFormState = me.addressForm.viewState();
            let personFormState = me.personForm.viewState();
            // if ((addressFormState == 'view' || addressFormState == 'empty') && personFormState == 'view') {
            me.personForm.edit();
            // }
        }

        public executeDeleteAddress() {
            let me = this;
            jQuery("#confirm-delete-address-modal").modal('hide');
            let addressId = me.family.address ? me.family.address.id : 0;
            if (!addressId) {
                return;
            }

            let request = addressId;
            let currentPerson = me.family.getSelected();
            me.application.hideServiceMessages();
            me.application.showWaiter('Deleting address...');
            me.services.executeService('peanut.qnut-directory::membership.DeleteAddress',request,
                (serviceResponse: Peanut.IServiceResponse) => {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        me.family.clearAddress();
                        me.addressForm.empty();
                        me.personForm.view();
                    }
                }
            )
                .always(function() {
                    me.application.hideWaiter();
                });

        }

        public executeDeletePerson() {
            let me = this;
            jQuery("#confirm-delete-person-modal").modal('hide');

            let request = me.family.selectedPersonId;

            me.application.hideServiceMessages();
            me.application.showWaiter('Delete person...');
            me.services.executeService('peanut.qnut-directory::membership.DeletePerson',request,
                (serviceResponse: Peanut.IServiceResponse) => {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        let selected = me.family.removePerson(me.family.selectedPersonId);
                        me.buildPersonSelectList(selected);
                        if (selected) {
                            me.personForm.assign(selected);
                            me.personForm.view();
                        }
                        else {
                            me.personForm.empty();
                        }
                    }
                }
            )
                .always(function() {
                    me.application.hideWaiter();
                });
        }

        /**
         * On click find address button
         */
        public findAddresses() {
            let me = this;
            let request = <Peanut.INameValuePair>{
                Name: 'Addresses',
                Value: me.addressesList.searchValue()
            };

            me.application.hideServiceMessages();
            me.application.showWaiter('Searching...');
            me.services.executeService('peanut.qnut-directory::membership.DirectorySearch',request, me.showAddressSearchResults)
                .always(function() {
                    me.application.hideWaiter();
                });
        }
        private findFamilies(searchType: string) {
            let me = this;
            me.searchType(searchType);
            me.family.visible(false);
            let request = <Peanut.INameValuePair>{
                Name: searchType,
                Value: me.familiesList.searchValue()
            };
            if (!request.Value) {
                return;
            }

            me.application.hideServiceMessages();
            me.application.showWaiter('Searching...');
            me.services.executeService('peanut.qnut-directory::membership.DirectorySearch',request,
                (serviceResponse: Peanut.IServiceResponse) => {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        let list = <Peanut.INameValuePair[]>serviceResponse.Value;
                        me.familiesList.setList(list);
                        me.familiesList.searchValue('');
                    }
                }
            )
                .always(function() {
                    me.application.hideWaiter();
                });
        }

        /**
         * On click find address button
         */
        public findFamiliesByAddressName() {
            let me = this;
            me.findFamilies('Addresses');
        }
        /**
         * On click find Persons button
         */
        public findFamiliesByPersonName() {
            let me = this;
            me.findFamilies('Persons');
        }
        /**
         * on click of add person button in address form
         */
        public findPersonForAddress() {
            let me = this;
            me.personsList.reset();
            me.personForm.search();
        }


        /**
         * on click of search button, person panel search view
         */
        public findPersons() {
            let me = this;

            let request =  <ISearchRequest>{
                Name: 'Persons',
                Value: me.personsList.searchValue(),
                Exclude:  me.addressForm.viewState() == 'view' ? me.addressForm.addressId() : 0
            };
            me.personsList.reset();
            me.application.hideServiceMessages();
            me.application.showWaiter('Searching...');
            me.services.executeService('peanut.qnut-directory::membership.DirectorySearch',request, me.showPersonSearchResults)
                .always(function() {
                    me.application.hideWaiter();
                });
        }


        /** shared service response handlers **/
        private handleChangePersonAddress = (serviceResponse: Peanut.IServiceResponse) => {
            let me = this;
            if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                let family = <IDirectoryFamily>serviceResponse.Value;
                let currentPersonId = family.selectedPersonId;
                me.addressesList.reset();
                let selected = me.family.setFamily(family);
                me.refreshFamilyForms(selected);
            }
        };

        private handleAddPersonToAddressResponse = (serviceResponse: Peanut.IServiceResponse) => {
            let me = this;
            if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                let person = <DirectoryPerson>serviceResponse.Value;
                me.personsList.reset();
                me.family.addPersonToList(person);
                me.buildPersonSelectList(person);
                me.personForm.assign(person);
                me.personForm.view();
            }
        };


        private handleUpdatePersonResponse = (serviceResponse: Peanut.IServiceResponse) => {
            let me = this;
            if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                let person = <DirectoryPerson>serviceResponse.Value;
                me.family.addPersonToList(person);
                me.personForm.assign(person);
                me.family.visible(true);
                me.personForm.view();
                me.addressForm.view();
            }
        };

        /**
         * on click of move button in person panel view mode
         */
        public movePerson() {
            let me = this;
            me.addressesList.reset();
            me.clearAddressSearchList();
            me.addressForm.search();
        }
        public newPerson = () => {
            let me=this;
            me.familiesList.reset();
            me.personForm.clear();
            me.addressForm.clear();
            me.family.empty();
            me.personForm.edit();
            me.addressForm.empty();
            me.family.visible(true);
        };

        public newAddress = () => {
            let me=this;
            me.familiesList.reset();
            me.personForm.clear();
            me.addressForm.clear();
            me.family.empty();
            me.addressForm.edit();
            me.personForm.empty();
            me.family.visible(true);
        };

        /**
         * handle save click on address form in edit mode
         */
        public saveAddress = () => {
            let me = this;

            if (!me.addressForm.validate()) {
                return;
            }


            let address = null;
            let addressId = me.addressForm.addressId();

            if (!addressId) {
                address = new DirectoryAddress();
                address.editState = Peanut.editState.created;
            }
            else {
                address = me.family.address;
                address.editState = Peanut.editState.updated;
            }
            me.addressForm.updateDirectoryAddress(address);

            if (address.editState == Peanut.editState.created && me.addressForm.relationId) {
                let request = <INewAddressForPersonRequest> {
                    address: address,
                    personId: me.family.selectedPersonId
                };
                me.application.showWaiter("Adding new address for person ...");
                me.services.executeService('peanut.qnut-directory::membership.NewAddressForPerson',request, me.handleChangePersonAddress)
                    .always(function() {
                        me.application.hideWaiter();
                    });
            }
            else {
                me.showActionWaiterBanner(
                    address.editState == Peanut.editState.created ? 'add' : 'update','address-entity'
                );
                // let updateMessage = address.editState == Peanut.editState.created ? 'Adding address ...' : 'Updating address...';
                // me.application.showWaiter(updateMessage);
                me.services.executeService('peanut.qnut-directory::membership.UpdateAddress',address,
                    (serviceResponse: Peanut.IServiceResponse) => {
                        if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                            let address = <DirectoryAddress>serviceResponse.Value;
                            let selected = me.family.setAddress(address);
                            me.addressForm.assign(address);
                            me.personForm.view();
                            me.addressForm.view();
                        }
                    }
                )
                    .always(function() {
                        me.application.hideWaiter();
                    });
            }
        };
        /**
         * on save button click on person panel in edit mode
         */
        public savePerson(): void {
            let me = this;
            if (!me.personForm.validate()) {
                return;
            }

            let person = null;
            let personId = me.personForm.personId();

            if (!personId) {
                person = new DirectoryPerson();
                person.editState = Peanut.editState.created;
            }
            else {
                person = me.family.getPersonById(personId);
                person.editState = Peanut.editState.updated;
            }
            me.personForm.updateDirectoryPerson(person);

            if (person.editState == Peanut.editState.created && me.personForm.relationId) {
                let request = <INewPersonForAddressRequest> {
                    person: person,
                    addressId: me.family.address ? me.family.address.id : null
                };
                me.application.showWaiter("Adding new person to address ...");
                me.services.executeService('peanut.qnut-directory::membership.NewPersonForAddress',request, me.handleAddPersonToAddressResponse)
                    .always(function() {
                        me.application.hideWaiter();
                    });
            }
            else {
                let updateAction = person.editState == Peanut.editState.created ? 'add' : 'update';
                me.showActionWaiterBanner(updateAction,'dir-person-entity');
                me.services.executeService('peanut.qnut-directory::membership.UpdatePerson',person, me.handleUpdatePersonResponse)
                    .always(function() {
                        me.application.hideWaiter();
                    });
            }
        }

        /**
         * on select person in persons button dropdown on address panel
         * @param item
         */
        public selectPerson = (item : Peanut.INameValuePair) => {
            let me = this;
            if (item.Value == 'new') {
                // me.findPersonForAddress();
                me.personForm.search();
            }
            else {
                let selected = me.family.selectPerson(item.Value);
                if (selected) {
                    me.buildPersonSelectList(selected);
                    me.personForm.assign(selected);
                    me.personForm.view();
                }
                else {
                    me.personForm.empty();
                }
            }
        };


        showAddressDeleteConfirmForm() {
            let me = this;
            jQuery("#confirm-delete-address-modal").modal('show');
        }

        /**
         * Service response handler for findAddresses
         * @param serviceResponse
         */
        public showAddressSearchResults = (serviceResponse: Peanut.IServiceResponse) => {
            let me = this;
            if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                let list = [];
                if (me.family.address) {
                    let removeItem =  <Peanut.INameValuePair>{
                        Name: '(No address)',
                        Value: null
                    };
                    list.push(removeItem);
                    list = list.concat(<Peanut.INameValuePair[]>serviceResponse.Value);
                }
                else {
                    list = <Peanut.INameValuePair[]>serviceResponse.Value;
                }

                me.addressesList.setList(list);
            }
        };

        showPersonDeleteConfirmForm() {
            let me = this;
            jQuery("#confirm-delete-person-modal").modal('show');
        }

        /**
         * service response handler for findPersons
         * @param serviceResponse
         */
        public showPersonSearchResults = (serviceResponse: Peanut.IServiceResponse) => {
            let me = this;
            if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                let list = <Peanut.INameValuePair[]>serviceResponse.Value;
                me.personsList.setList(list);
            }
        };

        public personFormColumnClass = ko.pureComputed(() => {
/*
            let me = this;
            let vs = me.addressForm.viewState();
            let result = vs === 'empty' ?
                'col-sm-12' : 'col-sm-6';
*/
            return this.addressForm.viewState() === 'empty' ? 'col-sm-12' : 'col-sm-6';
        });
        public addressFormColumnClass = ko.pureComputed( () => {
            return this.personForm.viewState() === 'empty' ? 'col-sm-12' : 'col-sm-6';
        });
    }

    /** Supporting Definitions **/




    /**
     * Local structure to track related persons and addresses and observables
     */
    class clientFamily {
        public address: DirectoryAddress;
        public persons: DirectoryPerson[] = [];
        public selectedPersonId: any = null;
        private newId: number = 0;
        public changeCount: number = 0;

        public visible = ko.observable(false);
        public hasAddress = ko.observable(false);
        public personCount = ko.observable(0);


        /**
         * assign family object
         * @param family
         * @returns {DirectoryPerson} first person in list
         */
        public setFamily(family: IDirectoryFamily) {
            let me = this;
            me.setAddress(family.address);
            let selected = me.setPersons(family.persons, family.selectedPersonId);

            return selected;
        }

        public empty() {
            let me = this;
            me.address = null;
            me.hasAddress(false);
            me.persons = [];
            me.personCount(0);
            me.selectedPersonId = 0;
        }

        /**
         * assign address object
         * @param address
         */
        public setAddress(address: DirectoryAddress) {
            let me = this;
            me.address = address;
            me.hasAddress(address != null);
        }

        /**
         * Set null address
         */
        public clearAddress(selectedPersonId: any = 0) {
            let me = this;
            me.address = null;
            me.hasAddress(false);
            let person = null;
            if (selectedPersonId) {
                person = me.selectPerson(selectedPersonId);
            }
            else {
                person = me.getSelected();
            }

            me.persons = [];

            if (person == null) {
                me.visible(false);
            }
            else {
                me.persons.push(person);
            }
        }

        /**
         * Return non-deleted persons from list
         * @returns {DirectoryPerson[]}
         */
        private getActivePersons(): DirectoryPerson[] {
            let me = this;
            let result = _.filter(me.persons, function (person: DirectoryPerson) {
                return person.editState != Peanut.editState.deleted;
            });
            return result;
        }

        /**
         * Make first person on list the selected person
         * @returns {DirectoryPerson} (null if no persons)
         */
        public selectFirstPerson(): DirectoryPerson {
            let me = this;
            let active = me.getActivePersons();
            let firstPerson = _.first(active);
            if (firstPerson) {
                me.selectedPersonId = firstPerson.id;
            }
            else {
                me.selectedPersonId = 0;
            }
            return <DirectoryPerson>firstPerson;
        }


        /**
         * Assign persons list
         *
         * @param {QnutDirectory.DirectoryPerson[]} persons
         * @param selectedPersonId
         * @returns {QnutDirectory.DirectoryPerson}
         */
        public setPersons(persons: DirectoryPerson[], selectedPersonId: any = 0): DirectoryPerson {
            let me = this;
            me.personCount(0);

            let selectedPerson: DirectoryPerson = null;

            if (persons) {
                _.each(persons, function (person: DirectoryPerson) {
                    person.editState = Peanut.editState.unchanged;
                });

                me.persons = persons;
                if (selectedPersonId) {
                    selectedPerson = me.getPersonById(selectedPersonId);
                }

                if (!selectedPerson) {
                    selectedPerson = me.selectFirstPerson();
                }
            }
            else {
                me.persons = [];
            }

            me.personCount(persons.length);
            me.selectedPersonId = selectedPerson ? selectedPerson.id : null;
            return selectedPerson;
        }

        public addPersonToList(person: DirectoryPerson, selected: boolean = true) {
            let me = this;
            let i = _.findIndex(me.persons, function (thePerson: DirectoryPerson) {
                return thePerson.id == person.id;
            }); // ,me);
            if (i > 0) {
                me.persons[i] = person;
            }
            else {
                me.persons.push(person);
                me.personCount(me.persons.length);
            }
            if (selected) {
                me.selectedPersonId = person.id;
            }

        }

        /**
         * Return selected person object
         * @returns {DirectoryPerson}
         */
        public getSelected(): DirectoryPerson {
            let me = this;

            let selected = _.find(me.persons, function (person) {
                return me.selectedPersonId == person.id;
            });// ,me);
            return <DirectoryPerson>selected;
        }

        public getPersonById(id: any): DirectoryPerson {
            let me = this;
            if (!id) {
                return null;
            }

            let result = _.find(me.persons, function (person) {
                return id == person.id;
            });//,me);
            return <DirectoryPerson>result;

        }

        /**
         * Set selected person by id
         * @param id
         * @returns {DirectoryPerson}
         */
        public selectPerson(id: any): DirectoryPerson {
            let me = this;
            let selected = null;
            if (id) {
                selected = _.find(me.persons, function (person) {
                    return person.id == id;
                });// ,me);
                if (selected) {
                    me.selectedPersonId = id;
                }
            }
            else {
                me.selectedPersonId = null;
            }
            return <DirectoryPerson>selected;
        }


        /**
         * Set deleted flag on person for id
         * @param personId
         * @returns {DirectoryPerson} (person deleted)
         */
        public removePerson(personId: string) {
            let me = this;
            // remove from array
            let currentPersons = me.persons;
            me.persons = _.reject(currentPersons, function (person: DirectoryPerson) {
                return person.id == personId;
            });

            let selected = me.selectFirstPerson();

            return selected;
        }

        public isLoaded = () => {
            let me = this;
            return (me.address != null || me.persons.length > 0);
        }

    }

    export class NameParser {
        /**
         * Parses a name for sorting purposes: lowercases, strips titles etc. and returns '(last-name),(remainder of name)'
         * Example:
         *      Peanut.NameParser.getFileAsName('Dr Terry L. SoRelle III, MD');
         *      returns 'sorelle,terry l.
         *
         * @param fullName
         * @returns {string}
         */
        public static getFileAsName(fullName: any) {
            if (typeof fullName !== 'string') {
                return <string>'';
            }
            let name: string = fullName ? fullName.trim().toLowerCase() : '';
            if (name.length == 0) {
                return name;
            }
            let last: string = '';
            let parts = name.split(' ');

            while (parts.length > 0) {
                let part = <string>parts.pop();
                if (!NameParser.isEndTitle(part)) {
                    if (part.substr(part.length - 1) === ',') {
                        part = part.substr(0, part.length - 1).trim();
                    }
                    last = part;
                    break;
                }
            }

            if (last) {
                while (parts.length > 0) {
                    let part = parts.shift();
                    if (NameParser.isTitle(part)) {
                        if (parts.length === 0) {
                            return last.trim();
                        }
                    }
                    else {
                        name = last + ',' + part + ' ' + parts.join(' ');
                        return name.trim();
                    }
                }
            }

            return name.trim();
        }

        public static getAddressSortKey(addressname,leadingArticles='the,a,an,el,la,los') {
            if (typeof addressname !== 'string') {
                return <string>'';
            }
            let name: string = addressname ? addressname.trim().toLowerCase() : '';
            if (name.length > 0) {
                let articles = leadingArticles.split(',');
                let parts = name.split(' ');
                if (parts.length > 1 && articles.indexOf(parts[0]) > -1) {
                    parts.shift();
                    name = parts.join(' ');
                    return name.trim();
                }
            }
            return name;
        }

        private static isTitle(word: string) {
            if (word.substr(word.length - 1) === '.') {//  (word.endsWith('.')) {
                word = word.substr(0, word.length - 1).trim();
            }
            switch (word) {
                case 'mr' :
                    return true;
                case 'mrs' :
                    return true;
                case 'ms' :
                    return true;
                case 'dr' :
                    return true;
                case 'fr' :
                    return true;
                case 'sr' :
                    return true;
            }

            return false;
        }

        private static isEndTitle(word: string) {
            if ((word.substr(word.length - 1) === '.') || (word.substr(word.length - 1) === ',')) {
                word = word.substr(0, word.length - 1).trim();
            }
            switch (word) {
                case 'jr' :
                    return true;
                case 'sr' :
                    return true;
                case 'ii' :
                    return true;
                case 'iii' :
                    return true;
                case 'md' :
                    return true;
                case 'm.d' :
                    return true;
                case 'phd' :
                    return true;
                case 'ph.d' :
                    return true;
                case 'd.d' :
                    return true;
                case 'dd' :
                    return true;
                case 'dds' :
                    return true;
                case 'dd.s' :
                    return true;
                case 'atty' :
                    return true;
            }
            return false;
        }
    }

}