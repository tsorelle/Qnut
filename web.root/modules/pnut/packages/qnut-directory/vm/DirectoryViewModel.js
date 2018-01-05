var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var QnutDirectory;
(function (QnutDirectory) {
    var DirectoryViewModel = (function (_super) {
        __extends(DirectoryViewModel, _super);
        function DirectoryViewModel() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.family = new clientFamily();
            _this.insertAssociation = 'none';
            _this.personUpdateOperation = 'update';
            _this.searchValue = ko.observable('');
            _this.searchType = ko.observable('');
            _this.addressPersonsList = ko.observableArray();
            _this.userCanEdit = ko.observable(true);
            _this.debugMode = ko.observable(false);
            _this.userIsAuthorized = ko.observable(false);
            _this.directoryListingTypes = ko.observableArray();
            _this.computeShowPersonViewButtons = function () {
                var me = _this;
                return (me.userCanEdit() && (me.addressForm.viewState() == 'view' || me.addressForm.viewState() == 'empty'));
            };
            _this.computeShowAddPersonButton = function () {
                var me = _this;
                return (me.family.personCount() < 2 &&
                    (me.userCanEdit() && (me.personForm.viewState() == 'view' || me.personForm.viewState() == 'empty')));
            };
            _this.computeShowEditButton = function () {
                var me = _this;
                return me.userCanEdit() && (me.personForm.viewState() == 'view' || me.personForm.viewState() == 'empty');
            };
            _this.computePersonFormHeader = function () {
                var me = _this;
                var name = me.personForm.fullName();
                return name ? name : 'Person';
            };
            _this.selectFamily = function (family) {
                var me = _this;
                me.addressPersonsList([]);
                var selected = me.family.setFamily(family);
                me.refreshFamilyForms(selected);
            };
            _this.addPersonToAddress = function (personItem) {
                var me = _this;
                if (me.family.address == null) {
                    return;
                }
                var request = {
                    addressId: me.family.address.id,
                    personId: personItem.Value
                };
                me.application.hideServiceMessages();
                me.showActionWaiterBanner('update', 'dir-address-entity');
                me.application.showWaiter('Updating...');
                me.services.executeService('peanut.qnut-directory::AddPersonToAddress', request, me.handleAddPersonToAddressResponse)
                    .always(function () {
                    me.application.hideWaiter();
                });
            };
            _this.assignAddressToPerson = function (addressItem) {
                var me = _this;
                var request = {
                    addressId: addressItem.Value,
                    personId: me.family.selectedPersonId
                };
                me.application.hideServiceMessages();
                me.application.showWaiter('Updating...');
                me.services.executeService('peanut.qnut-directory::ChangePersonAddress', request, me.handleChangePersonAddress)
                    .always(function () {
                    me.application.hideWaiter();
                });
                me.addressesList.reset();
                me.addressForm.view();
            };
            _this.addAffiliation = function () {
                var me = _this;
                jQuery("#confirm-delete-address-modal").modal('hide');
            };
            _this.displayFamily = function (item) {
                var me = _this;
                me.family.visible(false);
                me.familiesList.reset();
                me.personForm.clear();
                me.personForm.close();
                me.addressForm.clear();
                me.addressForm.close();
                me.addressPersonsList([]);
                var request = {
                    Name: me.searchType(),
                    Value: item.Value
                };
                me.application.hideServiceMessages();
                me.application.showWaiter('Locating family...');
                me.services.executeService('peanut.qnut-directory::GetFamily', request, function (serviceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        var family = serviceResponse.Value;
                        me.selectFamily(family);
                    }
                })
                    .fail(function () {
                    var err = me.services.getErrorInformation();
                })
                    .always(function () {
                    me.application.hideWaiter();
                });
            };
            _this.handleChangePersonAddress = function (serviceResponse) {
                var me = _this;
                if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                    var family = serviceResponse.Value;
                    var currentPersonId = family.selectedPersonId;
                    me.addressesList.reset();
                    var selected = me.family.setFamily(family);
                    me.refreshFamilyForms(selected);
                }
            };
            _this.handleAddPersonToAddressResponse = function (serviceResponse) {
                var me = _this;
                if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                    var person = serviceResponse.Value;
                    me.personsList.reset();
                    me.family.addPersonToList(person);
                    me.buildPersonSelectList(person);
                    me.personForm.assign(person);
                    me.personForm.view();
                }
            };
            _this.handleUpdatePersonResponse = function (serviceResponse) {
                var me = _this;
                if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                    var person = serviceResponse.Value;
                    me.family.addPersonToList(person);
                    me.personForm.assign(person);
                    me.family.visible(true);
                    me.personForm.view();
                    me.addressForm.view();
                }
            };
            _this.newPerson = function () {
                var me = _this;
                me.familiesList.reset();
                me.personForm.clear();
                me.addressForm.clear();
                me.family.empty();
                me.personForm.edit();
                me.addressForm.empty();
                me.family.visible(true);
            };
            _this.newAddress = function () {
                var me = _this;
                me.familiesList.reset();
                me.personForm.clear();
                me.addressForm.clear();
                me.family.empty();
                me.addressForm.edit();
                me.personForm.empty();
                me.family.visible(true);
            };
            _this.saveAddress = function () {
                var me = _this;
                if (!me.addressForm.validate()) {
                    return;
                }
                var address = null;
                var addressId = me.addressForm.addressId();
                if (!addressId) {
                    address = new QnutDirectory.DirectoryAddress();
                    address.editState = Peanut.editState.created;
                }
                else {
                    address = me.family.address;
                    address.editState = Peanut.editState.updated;
                }
                me.addressForm.updateDirectoryAddress(address);
                if (address.editState == Peanut.editState.created && me.addressForm.relationId) {
                    var request = {
                        address: address,
                        personId: me.family.selectedPersonId
                    };
                    me.application.showWaiter("Adding new address for person ...");
                    me.services.executeService('peanut.qnut-directory::NewAddressForPerson', request, me.handleChangePersonAddress)
                        .always(function () {
                        me.application.hideWaiter();
                    });
                }
                else {
                    var updateMessage = address.editState == Peanut.editState.created ? 'Adding address ...' : 'Updating address...';
                    me.application.showWaiter(updateMessage);
                    me.services.executeService('peanut.qnut-directory::UpdateAddress', address, function (serviceResponse) {
                        if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                            var address_1 = serviceResponse.Value;
                            var selected = me.family.setAddress(address_1);
                            me.addressForm.assign(address_1);
                            me.personForm.view();
                            me.addressForm.view();
                        }
                    })
                        .always(function () {
                        me.application.hideWaiter();
                    });
                }
            };
            _this.selectPerson = function (item) {
                var me = _this;
                if (item.Value == 'new') {
                    me.personForm.search();
                }
                else {
                    var selected = me.family.selectPerson(item.Value);
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
            _this.showAddressSearchResults = function (serviceResponse) {
                var me = _this;
                if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                    var list = [];
                    if (me.family.address) {
                        var removeItem = {
                            Name: '(No address)',
                            Value: null
                        };
                        list.push(removeItem);
                        list = list.concat(serviceResponse.Value);
                    }
                    else {
                        list = serviceResponse.Value;
                    }
                    me.addressesList.setList(list);
                }
            };
            _this.showPersonSearchResults = function (serviceResponse) {
                var me = _this;
                if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                    var list = serviceResponse.Value;
                    me.personsList.setList(list);
                }
            };
            _this.personFormColumnClass = ko.pureComputed(function () {
                return _this.addressForm.viewState() === 'empty' ? 'col-sm-12' : 'col-sm-6';
            });
            _this.addressFormColumnClass = ko.pureComputed(function () {
                return _this.personForm.viewState() === 'empty' ? 'col-sm-12' : 'col-sm-6';
            });
            return _this;
        }
        DirectoryViewModel.prototype.init = function (successFunction) {
            var me = this;
            console.log('Directory Init');
            me.application.loadResources([
                '@lib:jqueryui-css',
                '@lib:jqueryui-js',
                '@lib:lodash',
                '@pnut/ViewModelHelpers',
                '@pnut/searchListObservable',
                '@pkg/qnut-directory/DirectoryEntities'
            ], function () {
                me.application.loadResources([
                    '@pkg/qnut-directory/PersonObservable',
                    '@pkg/qnut-directory/AddressObservable'
                ], function () {
                    me.familiesList = new Peanut.searchListObservable(6, 10);
                    me.personsList = new Peanut.searchListObservable(2, 12);
                    me.addressesList = new Peanut.searchListObservable(2, 12);
                    me.personForm = new QnutDirectory.personObservable(me);
                    me.addressForm = new QnutDirectory.addressObservable(me);
                    me.personFormHeader = ko.computed(me.computePersonFormHeader);
                    me.showEditButton = ko.computed(me.computeShowEditButton);
                    me.showAddPersonButton = ko.computed(me.computeShowAddPersonButton);
                    me.showPersonViewButtons = ko.computed(me.computeShowPersonViewButtons);
                    jQuery(function () {
                        jQuery(".datepicker").datepicker();
                    });
                    me.getInitializations(function () {
                        me.bindDefaultSection();
                        successFunction();
                    });
                });
            });
        };
        DirectoryViewModel.prototype.getInitializations = function (doneFunction) {
            var me = this;
            me.application.hideServiceMessages();
            var personId = Peanut.Helper.getRequestParam('pid');
            me.showLoadWaiter();
            me.services.executeService('peanut.qnut-directory::InitializeDirectory', personId, function (serviceResponse) {
                if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                    var response = serviceResponse.Value;
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
                var trace = me.services.getErrorInformation();
            })
                .always(function () {
                me.application.hideWaiter();
                if (doneFunction) {
                    doneFunction();
                }
            });
        };
        DirectoryViewModel.prototype.refreshFamilyForms = function (selected) {
            var me = this;
            if (selected) {
                me.personForm.assign(selected);
                me.personForm.view();
            }
            else {
                me.personForm.empty();
            }
            if (me.family.address) {
                me.addressForm.assign(me.family.address);
                me.buildPersonSelectList(selected);
                me.addressForm.view();
            }
            else {
                me.addressPersonsList([]);
                me.addressForm.empty();
            }
            me.buildPersonSelectList(selected);
            me.family.visible(true);
        };
        DirectoryViewModel.prototype.buildPersonSelectList = function (selected) {
            var me = this;
            me.family.persons.sort(function (x, y) {
                if (x.id === y.id) {
                    return 0;
                }
                if (x.sortkey > y.sortkey) {
                    return 1;
                }
                return -1;
            });
            var personList = [];
            if (selected) {
                _.each(me.family.persons, function (person) {
                    if (person.editState != Peanut.editState.deleted && person.id != selected.id) {
                        personList.push({
                            Name: person.fullname,
                            Value: person.id.toString()
                        });
                    }
                });
                if (me.userCanEdit()) {
                    personList.push({
                        Name: me.translate('dir-list-new-person'),
                        Value: 'new'
                    });
                }
            }
            me.addressPersonsList(personList);
        };
        DirectoryViewModel.prototype.cancelAddressEdit = function () {
            var me = this;
            if (me.family.isLoaded()) {
                me.addressForm.assign(me.family.address);
                me.addressForm.view();
            }
            else {
                me.family.visible(false);
                me.addressForm.clear();
            }
        };
        DirectoryViewModel.prototype.cancelPersonEdit = function () {
            var me = this;
            if (me.family.isLoaded()) {
                var selected = me.family.getSelected();
                me.personForm.assign(selected);
                me.personForm.view();
            }
            else {
                me.family.visible(false);
                me.personForm.clear();
            }
        };
        DirectoryViewModel.prototype.cancelAddressSearch = function () {
            var me = this;
            me.addressesList.reset();
            me.addressForm.view();
        };
        DirectoryViewModel.prototype.cancelPersonSearch = function () {
            var me = this;
            me.personsList.reset();
            me.personForm.view();
        };
        DirectoryViewModel.prototype.clearAddressSearchList = function () {
            var me = this;
            var list = [];
            if (me.family.address) {
                list.push({
                    Name: '(No address)',
                    Value: null
                });
            }
            me.addressesList.setList(list);
        };
        DirectoryViewModel.prototype.createAddressForPerson = function () {
            var me = this;
            me.addressesList.reset();
            me.addressForm.clear();
            me.addressForm.edit(me.family.selectedPersonId);
        };
        DirectoryViewModel.prototype.createPersonForAddress = function () {
            var me = this;
            me.personForm.clear();
            var addressId = me.family.address ? me.family.address.id : null;
            me.personForm.edit(addressId);
        };
        DirectoryViewModel.prototype.createSelectedPersonRequest = function () {
            var me = this;
            return {
                personId: me.family.selectedPersonId,
                addressId: me.family.address ? me.family.address.id : 0
            };
        };
        DirectoryViewModel.prototype.deleteAddress = function () {
            var me = this;
            me.showAddressDeleteConfirmForm();
        };
        DirectoryViewModel.prototype.deletePerson = function () {
            var me = this;
            me.showPersonDeleteConfirmForm();
        };
        DirectoryViewModel.prototype.showAddAffiliationModal = function () {
            jQuery("#confirm-delete-address-modal").modal('show');
        };
        DirectoryViewModel.prototype.editAddress = function () {
            var me = this;
            me.addressForm.edit();
        };
        DirectoryViewModel.prototype.editPerson = function () {
            var me = this;
            var addressFormState = me.addressForm.viewState();
            var personFormState = me.personForm.viewState();
            me.personForm.edit();
        };
        DirectoryViewModel.prototype.executeDeleteAddress = function () {
            var me = this;
            jQuery("#confirm-delete-address-modal").modal('hide');
            var addressId = me.family.address ? me.family.address.id : 0;
            if (!addressId) {
                return;
            }
            var request = addressId;
            var currentPerson = me.family.getSelected();
            me.application.hideServiceMessages();
            me.application.showWaiter('Deleting address...');
            me.services.executeService('peanut.qnut-directory::DeleteAddress', request, function (serviceResponse) {
                if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                    me.family.clearAddress();
                    me.addressForm.empty();
                    me.personForm.view();
                }
            })
                .always(function () {
                me.application.hideWaiter();
            });
        };
        DirectoryViewModel.prototype.executeDeletePerson = function () {
            var me = this;
            jQuery("#confirm-delete-person-modal").modal('hide');
            var request = me.family.selectedPersonId;
            me.application.hideServiceMessages();
            me.application.showWaiter('Delete person...');
            me.services.executeService('peanut.qnut-directory::DeletePerson', request, function (serviceResponse) {
                if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                    var selected = me.family.removePerson(me.family.selectedPersonId);
                    me.buildPersonSelectList(selected);
                    if (selected) {
                        me.personForm.assign(selected);
                        me.personForm.view();
                    }
                    else {
                        me.personForm.empty();
                    }
                }
            })
                .always(function () {
                me.application.hideWaiter();
            });
        };
        DirectoryViewModel.prototype.findAddresses = function () {
            var me = this;
            var request = {
                Name: 'Addresses',
                Value: me.addressesList.searchValue()
            };
            me.application.hideServiceMessages();
            me.application.showWaiter('Searching...');
            me.services.executeService('peanut.qnut-directory::DirectorySearch', request, me.showAddressSearchResults)
                .always(function () {
                me.application.hideWaiter();
            });
        };
        DirectoryViewModel.prototype.findFamilies = function (searchType) {
            var me = this;
            me.searchType(searchType);
            me.family.visible(false);
            var request = {
                Name: searchType,
                Value: me.familiesList.searchValue()
            };
            if (!request.Value) {
                return;
            }
            me.application.hideServiceMessages();
            me.application.showWaiter('Searching...');
            me.services.executeService('peanut.qnut-directory::DirectorySearch', request, function (serviceResponse) {
                if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                    var list = serviceResponse.Value;
                    me.familiesList.setList(list);
                    me.familiesList.searchValue('');
                }
            })
                .always(function () {
                me.application.hideWaiter();
            });
        };
        DirectoryViewModel.prototype.findFamiliesByAddressName = function () {
            var me = this;
            me.findFamilies('Addresses');
        };
        DirectoryViewModel.prototype.findFamiliesByPersonName = function () {
            var me = this;
            me.findFamilies('Persons');
        };
        DirectoryViewModel.prototype.findPersonForAddress = function () {
            var me = this;
            me.personsList.reset();
            me.personForm.search();
        };
        DirectoryViewModel.prototype.findPersons = function () {
            var me = this;
            var request = {
                Name: 'Persons',
                Value: me.personsList.searchValue(),
                Exclude: me.addressForm.viewState() == 'view' ? me.addressForm.addressId() : 0
            };
            me.personsList.reset();
            me.application.hideServiceMessages();
            me.application.showWaiter('Searching...');
            me.services.executeService('peanut.qnut-directory::DirectorySearch', request, me.showPersonSearchResults)
                .always(function () {
                me.application.hideWaiter();
            });
        };
        DirectoryViewModel.prototype.movePerson = function () {
            var me = this;
            me.addressesList.reset();
            me.clearAddressSearchList();
            me.addressForm.search();
        };
        DirectoryViewModel.prototype.savePerson = function () {
            var me = this;
            if (!me.personForm.validate()) {
                return;
            }
            var person = null;
            var personId = me.personForm.personId();
            if (!personId) {
                person = new QnutDirectory.DirectoryPerson();
                person.editState = Peanut.editState.created;
            }
            else {
                person = me.family.getPersonById(personId);
                person.editState = Peanut.editState.updated;
            }
            me.personForm.updateDirectoryPerson(person);
            if (person.editState == Peanut.editState.created && me.personForm.relationId) {
                var request = {
                    person: person,
                    addressId: me.family.address ? me.family.address.id : null
                };
                me.application.showWaiter("Adding new person to address ...");
                me.services.executeService('peanut.qnut-directory::NewPersonForAddress', request, me.handleAddPersonToAddressResponse)
                    .always(function () {
                    me.application.hideWaiter();
                });
            }
            else {
                var updateAction = person.editState == Peanut.editState.created ? 'add' : 'update';
                me.showActionWaiterBanner(updateAction, 'dir-person-entity');
                me.services.executeService('peanut.qnut-directory::UpdatePerson', person, me.handleUpdatePersonResponse)
                    .always(function () {
                    me.application.hideWaiter();
                });
            }
        };
        DirectoryViewModel.prototype.showAddressDeleteConfirmForm = function () {
            var me = this;
            jQuery("#confirm-delete-address-modal").modal('show');
        };
        DirectoryViewModel.prototype.showPersonDeleteConfirmForm = function () {
            var me = this;
            jQuery("#confirm-delete-person-modal").modal('show');
        };
        return DirectoryViewModel;
    }(Peanut.ViewModelBase));
    QnutDirectory.DirectoryViewModel = DirectoryViewModel;
    var clientFamily = (function () {
        function clientFamily() {
            var _this = this;
            this.persons = [];
            this.selectedPersonId = null;
            this.newId = 0;
            this.changeCount = 0;
            this.visible = ko.observable(false);
            this.hasAddress = ko.observable(false);
            this.personCount = ko.observable(0);
            this.isLoaded = function () {
                var me = _this;
                return (me.address != null || me.persons.length > 0);
            };
        }
        clientFamily.prototype.setFamily = function (family) {
            var me = this;
            me.setAddress(family.address);
            var selected = me.setPersons(family.persons, family.selectedPersonId);
            return selected;
        };
        clientFamily.prototype.empty = function () {
            var me = this;
            me.address = null;
            me.hasAddress(false);
            me.persons = [];
            me.personCount(0);
            me.selectedPersonId = 0;
        };
        clientFamily.prototype.setAddress = function (address) {
            var me = this;
            me.address = address;
            me.hasAddress(address != null);
        };
        clientFamily.prototype.clearAddress = function (selectedPersonId) {
            if (selectedPersonId === void 0) { selectedPersonId = 0; }
            var me = this;
            me.address = null;
            me.hasAddress(false);
            var person = null;
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
        };
        clientFamily.prototype.getActivePersons = function () {
            var me = this;
            var result = _.filter(me.persons, function (person) {
                return person.editState != Peanut.editState.deleted;
            });
            return result;
        };
        clientFamily.prototype.selectFirstPerson = function () {
            var me = this;
            var active = me.getActivePersons();
            var firstPerson = _.first(active);
            if (firstPerson) {
                me.selectedPersonId = firstPerson.id;
            }
            else {
                me.selectedPersonId = 0;
            }
            return firstPerson;
        };
        clientFamily.prototype.setPersons = function (persons, selectedPersonId) {
            if (selectedPersonId === void 0) { selectedPersonId = 0; }
            var me = this;
            me.personCount(0);
            var selectedPerson = null;
            if (persons) {
                _.each(persons, function (person) {
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
        };
        clientFamily.prototype.addPersonToList = function (person, selected) {
            if (selected === void 0) { selected = true; }
            var me = this;
            var i = _.findIndex(me.persons, function (thePerson) {
                return thePerson.id == person.id;
            });
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
        };
        clientFamily.prototype.getSelected = function () {
            var me = this;
            var selected = _.find(me.persons, function (person) {
                return me.selectedPersonId == person.id;
            });
            return selected;
        };
        clientFamily.prototype.getPersonById = function (id) {
            var me = this;
            if (!id) {
                return null;
            }
            var result = _.find(me.persons, function (person) {
                return id == person.id;
            });
            return result;
        };
        clientFamily.prototype.selectPerson = function (id) {
            var me = this;
            var selected = null;
            if (id) {
                selected = _.find(me.persons, function (person) {
                    return person.id == id;
                });
                if (selected) {
                    me.selectedPersonId = id;
                }
            }
            else {
                me.selectedPersonId = null;
            }
            return selected;
        };
        clientFamily.prototype.removePerson = function (personId) {
            var me = this;
            var currentPersons = me.persons;
            me.persons = _.reject(currentPersons, function (person) {
                return person.id == personId;
            });
            var selected = me.selectFirstPerson();
            return selected;
        };
        return clientFamily;
    }());
    var NameParser = (function () {
        function NameParser() {
        }
        NameParser.getFileAsName = function (fullName) {
            if (typeof fullName !== 'string') {
                return '';
            }
            var name = fullName ? fullName.trim().toLowerCase() : '';
            if (name.length == 0) {
                return name;
            }
            var last = '';
            var parts = name.split(' ');
            while (parts.length > 0) {
                var part = parts.pop();
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
                    var part = parts.shift();
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
        };
        NameParser.getAddressSortKey = function (addressname, leadingArticles) {
            if (leadingArticles === void 0) { leadingArticles = 'the,a,an,el,la,los'; }
            if (typeof addressname !== 'string') {
                return '';
            }
            var name = addressname ? addressname.trim().toLowerCase() : '';
            if (name.length > 0) {
                var articles = leadingArticles.split(',');
                var parts = name.split(' ');
                if (parts.length > 1 && articles.indexOf(parts[0]) > -1) {
                    parts.shift();
                    name = parts.join(' ');
                    return name.trim();
                }
            }
            return name;
        };
        NameParser.isTitle = function (word) {
            if (word.substr(word.length - 1) === '.') {
                word = word.substr(0, word.length - 1).trim();
            }
            switch (word) {
                case 'mr':
                    return true;
                case 'mrs':
                    return true;
                case 'ms':
                    return true;
                case 'dr':
                    return true;
                case 'fr':
                    return true;
                case 'sr':
                    return true;
            }
            return false;
        };
        NameParser.isEndTitle = function (word) {
            if ((word.substr(word.length - 1) === '.') || (word.substr(word.length - 1) === ',')) {
                word = word.substr(0, word.length - 1).trim();
            }
            switch (word) {
                case 'jr':
                    return true;
                case 'sr':
                    return true;
                case 'ii':
                    return true;
                case 'iii':
                    return true;
                case 'md':
                    return true;
                case 'm.d':
                    return true;
                case 'phd':
                    return true;
                case 'ph.d':
                    return true;
                case 'd.d':
                    return true;
                case 'dd':
                    return true;
                case 'dds':
                    return true;
                case 'dd.s':
                    return true;
                case 'atty':
                    return true;
            }
            return false;
        };
        return NameParser;
    }());
    QnutDirectory.NameParser = NameParser;
})(QnutDirectory || (QnutDirectory = {}));
//# sourceMappingURL=DirectoryViewModel.js.map