var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var QnutDirectory;
(function (QnutDirectory) {
    var organizationObservable = (function () {
        function organizationObservable(owner) {
            var _this = this;
            this.id = ko.observable(null);
            this.addressId = ko.observable(null);
            this.code = ko.observable('');
            this.name = ko.observable('');
            this.email = ko.observable('');
            this.phone = ko.observable('');
            this.fax = ko.observable('');
            this.notes = ko.observable('');
            this.description = ko.observable('');
            this.active = ko.observable(true);
            this.selectedOrganizationType = ko.observable();
            this.orgTypeName = ko.computed(function () {
                var me = _this;
                var selected = me.selectedOrganizationType();
                if (selected) {
                    return selected.name;
                }
                return '';
            });
            this.createdby = ko.observable('');
            this.createdon = ko.observable('');
            this.changedby = ko.observable('');
            this.changedon = ko.observable('');
            this.codeError = ko.observable('');
            this.nameError = ko.observable(false);
            this.emailError = ko.observable(false);
            this.orgTypeError = ko.observable(false);
            this.hasErrors = ko.observable(false);
            this.organizationTypes = ko.observableArray();
            this.typeListCaption = ko.observable('');
            this.translator = owner;
        }
        ;
        organizationObservable.prototype.clearErrors = function () {
            var me = this;
            me.codeError('');
            me.nameError(false);
            me.emailError(false);
            me.orgTypeError(false);
            me.hasErrors(false);
        };
        organizationObservable.prototype.clearForm = function () {
            var me = this;
            me.clearErrors();
            me.active(true);
            me.id(null);
            me.addressId(null);
            me.code('');
            me.name('');
            me.email('');
            me.phone('');
            me.fax('');
            me.notes('');
            me.description('');
            me.createdby('');
            me.createdon('');
            me.changedby('');
            me.changedon('');
            me.selectedOrganizationType(null);
        };
        organizationObservable.prototype.assign = function (organization) {
            var me = this;
            me.clearErrors();
            me.id(organization.id);
            me.addressId(organization.addressId);
            me.code(organization.code);
            me.name(organization.name);
            me.email(organization.email);
            me.phone(organization.phone);
            me.fax(organization.fax);
            me.notes(organization.notes);
            me.description(organization.description);
            me.createdby(organization.createdby);
            me.createdon(organization.createdon);
            me.changedby(organization.changedby);
            me.changedon(organization.changedon);
            this.selectedOrganizationType(_.find(this.organizationTypes(), function (i) {
                return i.id == organization.organizationType;
            }));
            me.active(!!organization.active);
        };
        organizationObservable.prototype.validate = function () {
            var me = this;
            me.clearErrors();
            var valid = true;
            var org = {
                id: me.id(),
                addressId: me.addressId(),
                code: Peanut.KnockoutHelper.GetInputValue(me.code),
                name: Peanut.KnockoutHelper.GetInputValue(me.name),
                email: Peanut.KnockoutHelper.GetInputValue(me.email),
                phone: me.phone(),
                fax: me.fax(),
                notes: me.notes(),
                description: me.description(),
                active: me.active ? 1 : 0,
                organizationType: me.selectedOrganizationType() ? me.selectedOrganizationType().id : null
            };
            if (!org.name) {
                valid = false;
                me.nameError(true);
            }
            if (!org.code) {
                valid = false;
                me.codeError(me.translator.translate('organization-code-error-blank'));
            }
            if (org.email) {
                valid = Peanut.Helper.ValidateEmail(org.email);
                if (!valid) {
                    me.emailError(true);
                }
            }
            if (!org.organizationType) {
                valid = false;
                me.orgTypeError(true);
            }
            me.hasErrors(valid);
            return valid ? org : false;
        };
        return organizationObservable;
    }());
    var OrganizationsViewModel = (function (_super) {
        __extends(OrganizationsViewModel, _super);
        function OrganizationsViewModel() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.pageSize = 10;
            _this.userCanEdit = ko.observable(true);
            _this.tab = ko.observable('list');
            _this.directoryListingTypes = ko.observableArray();
            _this.confirmSaveText = ko.observable('confirm save');
            _this.confirmSaveHeader = ko.observable('confirm save');
            _this.confirmDeleteText = ko.observable('confirm delete');
            _this.useOrganizationNameForAddress = ko.observable(true);
            _this.confirmDeleteHeader = ko.observable('confirm delete');
            _this.currentPage = ko.observable(1);
            _this.maxPages = ko.observable(1);
            _this.refreshing = ko.observable(false);
            _this.organizationForm = new organizationObservable(_this);
            _this.organizationsList = ko.observableArray();
            _this.formHasErrors = ko.observable(false);
            _this.updateRequest = null;
            _this.onPagerClick = function (move) {
                var pageNumber = _this.currentPage() + move;
                var me = _this;
                me.refreshing(true);
                me.services.executeService('peanut.qnut-directory::organizations.GetOrganizations', { pageSize: me.pageSize, pageNumber: pageNumber }, function (serviceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        me.organizationsList(serviceResponse.Value);
                        me.currentPage(pageNumber);
                    }
                })
                    .fail(function () {
                    var trace = me.services.getErrorInformation();
                })
                    .always(function () {
                    me.refreshing(false);
                });
            };
            _this.newOrganization = function () {
                var me = _this;
                me.organizationForm.clearForm();
                me.organizationForm.id(0);
                me.useOrganizationNameForAddress(true);
                me.tab('edit');
            };
            _this.viewOrganization = function (org) {
                _this.getOrganization(org.id);
            };
            _this.showList = function () {
                _this.tab('list');
            };
            _this.editOrganization = function () {
                _this.tab('edit');
            };
            _this.removeOrganization = function () {
                var me = _this;
            };
            _this.createAddress = function () {
                var me = _this;
                me.addressForm.clear();
                me.organizationForm.addressId(0);
            };
            _this.removeAddress = function () {
                var me = _this;
                me.organizationForm.addressId(null);
            };
            _this.confirmSaveOrganization = function () {
                var me = _this;
                me.updateRequest = null;
                me.formHasErrors(false);
                var org = me.organizationForm.validate();
                if (me.useOrganizationNameForAddress()) {
                    if (!me.organizationForm.name()) {
                        me.formHasErrors(true);
                        return;
                    }
                    me.addressForm.addressname(me.organizationForm.name());
                }
                var address = me.validateAddress();
                if (org === false || address === false) {
                    me.formHasErrors(true);
                    return;
                }
                me.formHasErrors(false);
                me.updateRequest = {
                    pageSize: me.pageSize,
                    organization: org,
                    address: address
                };
                if (me.organizationForm.addressId() !== null) {
                    me.updateRequest.address = new QnutDirectory.DirectoryAddress();
                    me.addressForm.updateDirectoryAddress(me.updateRequest.address);
                    me.updateRequest.address.id = me.organizationForm.addressId();
                    me.updateRequest.address.editState = me.organizationForm.addressId() === 0 ? Peanut.editState.created : Peanut.editState.updated;
                }
                jQuery('#confirm-save-modal').modal('show');
            };
            _this.saveOrganization = function () {
                var me = _this;
                jQuery('#confirm-save-modal').modal('hide');
                me.showActionWaiterBanner(me.updateRequest.organizationId == 0 ? 'add' : 'update', 'organization-entity');
                me.services.executeService('peanut.qnut-directory::organizations.UpdateOrganization', me.updateRequest, function (serviceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        var response = serviceResponse.Value;
                        me.organizationsList(response.organizations);
                        me.maxPages(response.maxpages);
                        me.currentPage(1);
                        me.handleGetOrganizationResponse(serviceResponse.Value);
                        me.tab('view');
                    }
                    else {
                        var response = serviceResponse.Value || {};
                        if (response.errortype) {
                            switch (response.errortype) {
                                case 'duplicate-code':
                                    me.organizationForm.codeError(response.errormessage);
                                    me.formHasErrors(true);
                                    break;
                            }
                        }
                    }
                }).fail(function () {
                    var trace = me.services.getErrorInformation();
                }).always(function () {
                    me.updateRequest = null;
                    me.application.hideWaiter();
                });
            };
            _this.cancelOrganizationEdit = function () {
                var me = _this;
                me.tab(_this.organizationForm.id() === 0 ? 'list' : 'view');
            };
            _this.confirmDeleteOrganization = function () {
                var me = _this;
                jQuery('#confirm-delete-modal').modal('show');
            };
            _this.deleteOrganization = function () {
                var me = _this;
                me.showActionWaiterBanner('delete', 'organization-entity');
                me.services.executeService('peanut.qnut-directory::organizations.DeleteOrganization', {
                    id: me.organizationForm.id(),
                    pageSize: me.pageSize
                }, function (serviceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        var response = serviceResponse.Value;
                        me.organizationForm.clearForm();
                        me.addressForm.clear();
                        me.organizationsList(response.organizations);
                        me.maxPages(response.maxpages);
                        me.currentPage(1);
                        jQuery('#confirm-delete-modal').modal('hide');
                        me.tab('list');
                    }
                }).fail(function () {
                    var trace = me.services.getErrorInformation();
                }).always(function () {
                    me.application.hideWaiter();
                });
            };
            return _this;
        }
        OrganizationsViewModel.prototype.init = function (successFunction) {
            var me = this;
            console.log('Directory Init');
            me.application.loadResources([
                '@lib:lodash',
                '@pnut/ViewModelHelpers',
                '@pnut/editPanel'
            ], function () {
                me.application.loadResources(['@pkg/qnut-directory/DirectoryEntities'], function () {
                    me.application.loadResources(['@pkg/qnut-directory/AddressObservable'], function () {
                        me.addressForm = new QnutDirectory.addressObservable(me);
                        me.application.registerComponents([
                            '@pnut/modal-confirm',
                            '@pnut/pager'
                        ], function () {
                            me.getInitializations(function () {
                                me.bindDefaultSection();
                                successFunction();
                            });
                        });
                    });
                });
            });
        };
        OrganizationsViewModel.prototype.getInitializations = function (doneFunction) {
            var me = this;
            me.services.executeService('peanut.qnut-directory::organizations.InitializeOrganizations', { pageSize: me.pageSize }, function (serviceResponse) {
                if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                    var response = serviceResponse.Value;
                    me.organizationsList(response.organizations);
                    me.maxPages(response.maxpages);
                    me.currentPage(1);
                    me.addressForm.addressTypes(response.addressTypes);
                    me.userCanEdit(response.canEdit);
                    me.directoryListingTypes(response.listingTypes);
                    me.addressForm.assignPostalSubscriptionList(response.postalLists);
                    me.organizationForm.organizationTypes(response.organizationTypes);
                    me.addTranslations(response.translations);
                    me.confirmDeleteHeader(me.translate('organization-confirm-delete-header'));
                    me.confirmDeleteText(me.translate('organization-confirm-delete-text'));
                    me.confirmSaveHeader(me.translate('organization-confirm-save-header'));
                    me.confirmSaveText(me.translate('organization-confirm-save-text'));
                    me.organizationForm.typeListCaption(me.translate('organization-select-caption'));
                }
                else {
                    me.userCanEdit(false);
                }
                doneFunction();
            })
                .fail(function () {
                var trace = me.services.getErrorInformation();
            });
        };
        OrganizationsViewModel.prototype.handleGetOrganizationResponse = function (response) {
            var me = this;
            me.organizationForm.assign(response.organization);
            if (response.address) {
                me.useOrganizationNameForAddress((!response.address.addressname) || (response.address.addressname == response.organization.name));
                me.addressForm.assign(response.address);
            }
            else {
                me.useOrganizationNameForAddress(true);
                me.addressForm.clear();
            }
        };
        OrganizationsViewModel.prototype.getOrganization = function (id) {
            var me = this;
            me.services.executeService('peanut.qnut-directory::organizations.GetOrganization', id, function (serviceResponse) {
                if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                    var response = serviceResponse.Value;
                    me.handleGetOrganizationResponse(response);
                    me.tab('view');
                }
            })
                .fail(function () {
                var trace = me.services.getErrorInformation();
            });
        };
        OrganizationsViewModel.prototype.validateAddress = function () {
            var me = this;
            if (me.organizationForm.addressId() === null) {
                return null;
            }
            if (!me.addressForm.validate()) {
                return false;
            }
            var address = new QnutDirectory.DirectoryAddress();
            me.addressForm.updateDirectoryAddress(address);
            address.editState = me.organizationForm.addressId() === 0 ? Peanut.editState.created : Peanut.editState.updated;
            return address;
        };
        ;
        return OrganizationsViewModel;
    }(Peanut.ViewModelBase));
    QnutDirectory.OrganizationsViewModel = OrganizationsViewModel;
})(QnutDirectory || (QnutDirectory = {}));
//# sourceMappingURL=OrganizationsViewModel.js.map