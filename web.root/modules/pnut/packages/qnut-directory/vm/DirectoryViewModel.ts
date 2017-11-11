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
/// <reference path='../../../../pnut/js/editPanel.ts' />
/// <reference path='../js/DirectoryEntities.ts' />

namespace QnutDirectory {


    interface IDirectoryFamily {
        address : DirectoryAddress;
        persons: DirectoryPerson[];
        selectedPersonId : any;
    }

    /** Service Contracts **/
    interface IInitDirectoryResponse {
        canEdit : boolean;
        directoryListingTypes : Peanut.INameValuePair[];
        affiliationCodes : Peanut.INameValuePair[];
        family : IDirectoryFamily;
    }

    interface addressPersonServiceRequest {
        personId: any;
        addressId: any;
    }

    interface newPersonForAddressRequest {
        person: DirectoryPerson;
        addressId: any;
    }

    interface newAddressForPersonRequest {
        personId: any;
        address: DirectoryAddress;
    }

    /** View Model **/

    export class DirectoryViewModel extends Peanut.ViewModelBase {
        // todo: complete port from SCYM
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

        personForm: personObservable;
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
                '@pkg/qnut-directory/DirectoryEntities'
            ], () => {
                me.familiesList = new Peanut.searchListObservable(6, 10);
                me.personsList = new Peanut.searchListObservable(2, 12);
                me.addressesList = new Peanut.searchListObservable(2, 12);
                me.personForm = new personObservable();
                me.addressForm = new addressObservable();
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
        }


        getInitializations(doneFunction?: () => void) {
            let me = this;
            me.application.hideServiceMessages();

            let personId = Peanut.Helper.getRequestParam('pid');
            me.showLoadWaiter();
            me.services.executeService('qnut-directory::InitDirectoryApp',personId,
                function(serviceResponse: Peanut.IServiceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        let response = <IInitDirectoryResponse>serviceResponse.Value;
                        me.userCanEdit(response.canEdit);
                        me.personForm.affiliations(response.affiliationCodes);
                        me.personForm.directoryListingTypes(response.directoryListingTypes);
                        // me.personForm.membershipTypes(response.membershipTypes);
                        me.addressForm.directoryListingTypes(response.directoryListingTypes);
                        me.userIsAuthorized(true);
                        if (response.family) {
                            me.searchType('Persons');
                            me.selectFamily(response.family);
                        }
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
                    if (person.editState != editState.deleted && person.id != selected.personId) {
                        personList.push(<Peanut.IKeyValuePair> {
                            Key: me.personForm.fullName(),
                            Value: person.id.toString(),
                        });
                    }
                }); // , selected);
                if (me.userCanEdit()) {
                    let newPersonItem = new Peanut.KeyValueDTO();
                    // todo: KeyValue or NameValue?
                    let temp  = <Peanut.INameValuePair>{
                        Name: '',
                        Value: ''
                    };
                    newPersonItem.Value = 'new';
                    newPersonItem.Key = 'Find or create new person';
                    personList.push(newPersonItem);
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
            me.application.showWaiter('Updating...');
            me.services.executeService('qnut-directory::AddPersonToAddress',request, me.handleAddPersonToAddressResponse)
                .always(function() {
                    me.application.hideWaiter();
                });

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
            me.services.executeService('qnut-directory::ChangePersonAddress',request, me.handleChangePersonAddress)
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
                // todo: KeyValue or NameValue?
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

            // todo: KeyValue or NameValue?
            let request  = <Peanut.INameValuePair>{
                Name: me.searchType(),
                Value: item.Value
            };

            me.application.hideServiceMessages();
            me.application.showWaiter('Locating family...');
            me.services.executeService('qnut-directory::GetFamily',request,me.handleFamilyResponse)
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

            me.application.hideServiceMessages();
            me.application.showWaiter('Deleting address...');
            me.services.executeService('qnut-directory::DeleteAddress',request, me.handleClearAddressResponse)
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
            me.services.executeService('qnut-directory::DeletePerson',request, me.handleRemovePersonResponse)
                .always(function() {
                    me.application.hideWaiter();
                });
        }

        /**
         * On click find address button
         */
        public findAddresses() {
            let me = this;
            // todo: KeyValue or NameValue?
            let request = <Peanut.INameValuePair>{
                Name: 'Addresses',
                Value: me.addressesList.searchValue()
            };

            me.application.hideServiceMessages();
            me.application.showWaiter('Searching...');
            me.services.executeService('qnut-directory::DirectorySearch',request, me.showAddressSearchResults)
                .always(function() {
                    me.application.hideWaiter();
                });
        }
        private findFamilies(searchType: string) {
            let me = this;
            me.searchType(searchType);
            me.family.visible(false);
            // todo: KeyValue or NameValue?
            let request = <Peanut.INameValuePair>{
                Name: searchType,
                Value: me.familiesList.searchValue()
            };

            me.application.hideServiceMessages();
            me.application.showWaiter('Searching...');
            me.services.executeService('qnut-directory::DirectorySearch',request, me.handleFindFamiliesResponse)
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

            // todo: KeyValue or NameValue?
            let request =  <Peanut.INameValuePair>{
                Name: 'Persons',
                Value: me.personsList.searchValue()
            };

            me.application.hideServiceMessages();
            me.application.showWaiter('Searching...');
            me.services.executeService('qnut-directory::DirectorySearch',request, me.showPersonSearchResults)
                .always(function() {
                    me.application.hideWaiter();
                });
        }

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

        private handleClearAddressResponse = (serviceResponse: Peanut.IServiceResponse) => {
            let me = this;
            if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                me.family.clearAddress();
                me.addressForm.empty();
                me.personForm.view();
            }
        };

        private handleFamilyResponse = (serviceResponse: Peanut.IServiceResponse)=> {
            let me = this;
            if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                let family = <IDirectoryFamily>serviceResponse.Value;
                me.selectFamily(family);
            }
        };
        private handleFindFamiliesResponse = (serviceResponse: Peanut.IServiceResponse) => {
            let me = this;
            if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                let list = <Peanut.INameValuePair[]>serviceResponse.Value;
                me.familiesList.setList(list);
                me.familiesList.searchValue('');
            }
        };

        private handleRemovePersonResponse = (serviceResponse: Peanut.IServiceResponse) => {
            // TODO: ui issue, last person disappears if address deleted.
            let me = this;
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
        };
        private handleUpdateAddressResponse = (serviceResponse: Peanut.IServiceResponse) => {
            let me = this;
            if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                let address = <DirectoryAddress>serviceResponse.Value;
                let selected = me.family.setAddress(address);
                me.addressForm.assign(address);
                me.personForm.view();
                me.addressForm.view();
            }
        };

        private handleUpdateFamilyResponse = (serviceResponse: Peanut.IServiceResponse)=> {
            let me = this;
            me.addressPersonsList([]);
            if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                let family = <IDirectoryFamily>serviceResponse.Value;
                // let currentSelected = me.family.getSelected();
                // let personId = currentSelected ? currentSelected.personId : 0;
                let selected = me.family.setFamily(family);
                me.refreshFamilyForms(selected);
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
        public saveAddress() {
            let me = this;

            if (!me.addressForm.validate()) {
                return;
            }


            let address = null;
            let addressId = me.addressForm.addressId();

            if (!addressId) {
                address = new DirectoryAddress();
                address.editState = editState.created;
            }
            else {
                address = me.family.address;
                address.editState = editState.updated;
            }
            me.addressForm.updateDirectoryAddress(address);

            if (address.editState == editState.created && me.addressForm.relationId) {
                let request = <INewAddressForPersonRequest> {
                    address: address,
                    personId: me.family.selectedPersonId
                };
                me.application.showWaiter("Adding new address for person ...");
                me.services.executeService('qnut-directory::NewAddressForPerson',request, me.handleChangePersonAddress)
                    .always(function() {
                        me.application.hideWaiter();
                    });
            }
            else {
                let updateMessage = address.editState == editState.created ? 'Adding address ...' : 'Updating address...';
                me.application.showWaiter(updateMessage);
                me.services.executeService('qnut-directory::UpdateAddress',address, me.handleUpdateAddressResponse)
                    .always(function() {
                        me.application.hideWaiter();
                    });
            }
        }
        /**
         * on save button click on person panel in edit mode
         */
        public savePerson(): void {
            let me = this;
            if (!me.personForm.validate()) {
                return;
            }

            let person = null;
            let updateMessage = 'Updating person...';
            let personId = me.personForm.personId();

            if (!personId) {
                person = new DirectoryPerson();
                person.editState = editState.created;
            }
            else {
                person = me.family.getPersonById(personId);
                person.editState = editState.updated;
            }
            me.personForm.updateDirectoryPerson(person);

            if (person.editState == editState.created && me.personForm.relationId) {
                let request = <INewPersonForAddressRequest> {
                    person: person,
                    addressId: me.family.address ? me.family.address.id : null
                };
                me.application.showWaiter("Adding new person to address ...");
                me.services.executeService('qnut-directory::NewPersonForAddress',request, me.handleAddPersonToAddressResponse)
                    .always(function() {
                        me.application.hideWaiter();
                    });
            }
            else {
                let updateMessage = person.editState == editState.created ? 'Adding person ...' : 'Updating person...';
                me.application.showWaiter(updateMessage);
                me.services.executeService('qnut-directory::UpdatePerson',person, me.handleUpdatePersonResponse)
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
                    // todo: KeyValue or NameValue?
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
    }

    /** Supporting Definitions **/

    /** observable container classes **/
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
                return person.editState != editState.deleted;
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
                    person.editState = editState.unchanged;
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

    class directoryEditPanel extends Peanut.editPanel {
        public searchList: Peanut.searchListObservable;
        public directoryListingTypeId = ko.observable(1);
        public selectedDirectoryListingType : KnockoutObservable<Peanut.INameValuePair> = ko.observable(null);
        public directoryListingTypes = ko.observableArray<Peanut.INameValuePair>([]);
        public constructor() {
            super();
            let me = this;
            me.searchList = new Peanut.searchListObservable(2,10);
        }
        protected getDirectoryListingItem = () => {
            let me = this;
            let lookup = me.directoryListingTypes();
            let id = me.directoryListingTypeId();
            if (!id) {
                id = 0;
            }
            let key = id.toString();

            let result = _.find(lookup,function(item : Peanut.INameValuePair) {
                return item.Value == key;
            }); // ,me);  // lodash doesn't have context param
            return result;
        };

    }

    /**
     * observable container for person panel
     */
    class personObservable extends directoryEditPanel {
        // todo: figure what to do about affiliation

        public personId = ko.observable('');
        public fullName = ko.observable('');
        public phone = ko.observable('');
        public phone2 = ko.observable('');
        public email = ko.observable('');
        public dateOfBirth = ko.observable('');
        public junior= ko.observable(false);
        public deceased= ko.observable(false);
        public sortkey = ko.observable('');
        public notes = ko.observable('');
        public active= ko.observable(1);
        public username = ko.observable('');
        public lastUpdate = ko.observable('');
        public organization = ko.observable('');

        public selectedAffiliation : KnockoutObservable<Peanut.INameValuePair> = ko.observable(null);
        public affiliations = ko.observableArray<Peanut.INameValuePair>([]);
        public selectedMembershipAffiliation : KnockoutObservable<Peanut.INameValuePair> = ko.observable(null);

        public affiliation : KnockoutComputed<string>;
        public membership : KnockoutComputed<string>;
        public hasAffiliation : KnockoutComputed<boolean>;
        public hasMembership : KnockoutComputed<boolean>;
        public emailLink : KnockoutComputed<string>;

        // public directoryListing: KnockoutComputed<string>;

        public nameError = ko.observable('');
        public emailError = ko.observable('');
        // public affiliationError = ko.observable('');
        // public showOutsideMeeting = ko.observable(false);
        // public membershipType = ko.observable('');

        private ignoreTriggers = false;


        constructor() {
            super();
            let me = this;
            // me.directoryListing = ko.computed(me.computeDirectoryListing);
            // me.membershipType = ko.computed(me.computeMembershipType);
            // me.affiliation = ko.computed(me.computeAffiliation);
            // me.membership = ko.computed(me.computeMembership);
            // me.hasAffiliation = ko.computed(me.computeHasAffiliation);
            // me.hasMembership = ko.computed(me.computeHasMembership);
            me.emailLink = ko.computed(me.computeEmailLink);
            // me.selectedAffiliation.subscribe(me.onAffiliationCodeSelected);
            // me.selectedMembershipAffiliation.subscribe(me.onMemberAffiliationSelected);
            // me.membershipType.subscribe(me.onMembershiptypeChanged);
        }

        private getAffiliationItem = (key: string) => {
            let me = this;
            let lookup = me.affiliations();
            let result = _.find(lookup,function(item : Peanut.INameValuePair) {
                return item.Value == key;
            }); // ,me);
            return result;
        };

        onAffiliationCodeSelected = (selected : Peanut.INameValuePair) => {
            let me = this;
            /*
            if (!me.ignoreTriggers) {
                if (selected) {
                    me.affiliationcode(selected.Value);
                }
                else {
                    me.affiliationcode('');
                }
                me.setMembershipType();

            }
            */
        };

        onMemberAffiliationSelected = (selected : Peanut.INameValuePair) => {
            let me = this;
            /*
            if (!me.ignoreTriggers) {
                if (selected) {
                    me.memberaffiliation(selected.Value);
                }
                else {
                    me.memberaffiliation('');
                }
                me.setMembershipType();

            }
            */
        };

        onMembershiptypeChanged = (value : string) => {
            let me = this;
            /*
            if (!me.ignoreTriggers) {
                if (value == 'attender') {
                    me.setMembershipAffiliation('NONE');
                }
                else if (value == 'member') {
                    let attending = me.affiliationcode();
                    me.setMembershipAffiliation(attending);
                }
            }
            */
        };

        setMembershipAffiliation(value : string) {
            let me = this;
            /*
            me.ignoreTriggers = true;
            let item = me.getAffiliationItem(value);
            me.selectedMembershipAffiliation(item);
            me.memberaffiliation(value);
            me.ignoreTriggers = false;
            */
        }

        setMembershipType = () => {
            let me = this;
            /*
            let type = me.getMembershipType();
            me.ignoreTriggers = true;
            me.membershipType(type);
            me.ignoreTriggers = false;
            */
        };

        getMembershipType() {
            let me = this;
/*

            let attender = me.affiliationcode();
            let member = me.memberaffiliation();
            if (member == 'OTHER' || attender=='OTHER') {
                me.showOutsideMeeting(true);
                return 'other';
            }
            me.showOutsideMeeting(false);
            if (attender == 'NONE' || attender == '') {
                return '';
            }
            if (member == 'NONE' || member == '') {
                return 'attender';
            }
            if (member == attender) {
                return 'member';
            }
            return 'other';
*/
        }

        computeAffiliation = () => {
            let me = this;
/*
            let key = me.affiliationcode();
            let result = me.getAffiliationItem(key);
            return result ? result.Name : '';
*/
        };

        computeMembership = () => {
            let me = this;
/*
            let key = me.memberaffiliation();
            let result = me.getAffiliationItem(key);
            return result ? result.Name : '';
*/
        };

        computeHasAffiliation = () => {
            let me = this;
/*
            let code = me.affiliationcode();
            if (code == 'NONE' || code === '' || code === null ) {
                return false;
            }
            return true;
*/
        };

        computeHasMembership = () => {
            let me = this;
/*
            let code = me.memberaffiliation();
            if (code == 'NONE' || code === '' || code === null ) {
                return false;
            }
            return true;
*/
        };

        computeEmailLink = () => {
            let me = this;
            let email = me.email();
            return email ? 'mailto:' + me.fullName() + '<' + email + '>' : '#';
        };

        /**
         * reset fields
         */
        public clear() {
            // todo: check all fields included
            let me=this;
            me.isAssigned = false;
            me.clearValidations();
            
            me.fullName('');
            me.username('');
            me.phone('');
            me.phone2('');
            me.email('');
            me.dateOfBirth('');
            me.notes('');
            me.junior(false);
            me.active(1);
            me.sortkey('');
            // me.affiliationcode('');
            // me.memberaffiliation('');
            // me.otheraffiliation('');
            me.directoryListingTypeId = ko.observable(1);
            me.lastUpdate('');
            me.personId('');
            me.organization('');
            me.selectedAffiliation(null);
            me.selectedMembershipAffiliation(null);
            // me.membershipType('');
        }

        public clearValidations() {
            let me = this;
            me.nameError('');
            me.emailError('');
            // me.affiliationError('');
            me.hasErrors(false);
        }

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
            me.username(person.username);
            me.phone(person.phone);
            me.phone2(person.phone2);
            me.email(person.email);
            me.dateOfBirth(person.dateofbirth);
            me.notes(person.notes);
            me.junior(person.junior == '1');
            me.active(person.active);
            me.sortkey(person.sortkey);
            // me.affiliationcode(person.affiliationcode);
            // me.memberaffiliation(person.memberaffiliation);
            // me.otheraffiliation(person.otheraffiliation);
            me.directoryListingTypeId(person.listingtypeId);
            me.lastUpdate(person.changedon);
            me.personId(person.id);
            // let affiliationItem = me.getAffiliationItem(person.affiliationcode);
            // me.selectedAffiliation(affiliationItem);
            // affiliationItem = me.getAffiliationItem(person.memberaffiliation);
            // me.selectedMembershipAffiliation(affiliationItem);
            let directoryListingItem = me.getDirectoryListingItem();
            me.selectedDirectoryListingType(directoryListingItem);
            // me.setMembershipType();
        };

        public updateDirectoryPerson = (person: DirectoryPerson) => {
            // todo: check all fields included
            let me = this;

            person.active = me.active();
            // let affiliation = me.selectedAffiliation();
            // if (affiliation) {
            //     me.affiliationcode(affiliation.Value);
            // }
            // person.affiliationcode = me.affiliationcode();

            // affiliation = me.selectedMembershipAffiliation();
            // let membershipAffiliationCode = affiliation ? affiliation.Value : 'NONE';
            // if (affiliation) {
            //     me.memberaffiliation(membershipAffiliationCode);
            // }
            // person.memberaffiliation = membershipAffiliationCode;

            let listingType = me.selectedDirectoryListingType();
            if (listingType) {
                let listingCode = listingType.Value ? Number(listingType.Value) : 0;
                me.directoryListingTypeId(listingCode);
            }

            person.listingtypeId = me.directoryListingTypeId();
            person.id = me.personId();
            person.dateofbirth = me.dateOfBirth();
            // todo: check this logic
            if (person.dateofbirth) {
                me.junior(false);
            }
            person.junior = me.junior() ? '1' : '0';
            person.email = me.email();
            person.fullname = me.fullName();
            person.notes = me.notes();
            // person.otheraffiliation = me.otheraffiliation();
            person.phone = me.phone();
            person.phone2 = me.phone2();
            person.sortkey = me.sortkey();
            person.username = me.username();
            // person.organization = me.organization();
        };

        public validate = ():boolean => {
            let me = this;
            me.clearValidations();
            let valid = true;
            let value = me.fullName();
            if (!value) {
                // todo: translate
                me.nameError(": Please enter the first name");
                valid = false;
            }
            value = me.email();
            if (value) {
                let emailOk = Peanut.Helper.ValidateEmail(value);
                if (!emailOk) {
                    // todo: tranlate
                    me.emailError(': Please enter a valid email address.');
                    valid = false;
                }
            }
/*
            
            value = me.affiliationcode();
            if (!value) {
                me.affiliationError(': Please select the attended meeting, or "None".');
                valid = false;
            }

*/
            me.hasErrors(!valid);
            return valid;
        };
        
    }

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

        constructor() {
            super();
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

        /**
         * reset fields
         */
        public clear() {
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
        }

        private clearValidations() {
            let me = this;
            me.hasErrors(false);
            me.addressNameError('');
        }

        public validate = ():boolean => {
            let me = this;
            me.clearValidations();
            let valid = true;
            let value = me.addressname();
            if (!value) {
                // todo: translate
                me.addressNameError(": Please enter a name for the address");
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
            me.addressname(address.addressname);
            me.address1(address.address1);
            me.address2(address.address2);
            me.city(address.city);
            me.state(address.state);
            me.postalcode(address.postalcode);
            me.country(address.country);
            me.phone(address.phone);
            me.notes(address.notes);
            me.active (address.active);
            me.sortkey(address.sortkey);
            me.lastUpdate(address.changedon);
            me.addressId(address.id);
            me.addressTypeId(address.addresstypeId);
            me.directoryListingTypeId(address.listingtypeId);
            let directoryListingItem = me.getDirectoryListingItem();
            me.selectedDirectoryListingType(directoryListingItem);
        };

        public updateDirectoryAddress(address: DirectoryAddress) {
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
                let listingCode = listingType.Value ? Number(listingType.Value) : 0;
                me.directoryListingTypeId(listingCode);
            }
            address.listingtypeId = me.directoryListingTypeId();
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
                            return last;
                        }
                    }
                    else {
                        return last + ',' + part + ' ' + parts.join(' ');
                    }
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