/// <reference path="../../../../pnut/core/ViewModelBase.ts" />
/// <reference path="../../../../pnut/core/KnockoutHelper.ts" />
/// <reference path='../../../../typings/knockout/knockout.d.ts' />
/// <reference path='../../../../typings/jqueryui/jqueryui.d.ts' />
/// <reference path='../../../../typings/jqueryui/jqueryui.d.ts' />
/// <reference path='../../../../pnut/core/peanut.d.ts' />
/// <reference path='../../../../typings/lodash/find/index.d.ts' />

/// <reference path='../js/DirectoryEntities.ts' />
/// <reference path='../js/AddressObservable.ts' />

namespace QnutDirectory {

    import ILookupItem = Peanut.ILookupItem;

    interface IOrganization extends Peanut.INamedEntity {
        addressId : any;
        organizationType : any ;
        email : string;
        phone : string;
        fax : string;
        notes : string;
    }

    interface IOrganizationEntity extends IOrganization {
        createdby : string;
        createdon : string;
        changedby : string;
        changedon : string;
    }

    interface IGetOrganizationResponse extends IOrganizationEntity {
        organization: IOrganizationEntity;
        address : DirectoryAddress;
    }

    interface IOrganizationListItem {
        id: any,
        name: string,
        code: string,
        typeName: string;
    }

    interface IGetOrganizationsResponse {
        organizations: IOrganizationListItem[];
        maxpages: number,
    }

    class organizationObservable {
        id=  ko.observable(null);
        addressId =  ko.observable(null);
        code =  ko.observable('');
        name =  ko.observable('');
        email =  ko.observable('');
        phone =  ko.observable('');
        fax =  ko.observable('');
        notes =  ko.observable('');
        description =  ko.observable('');
        active = ko.observable(true);
        selectedOrganizationType =  ko.observable<Peanut.ILookupItem>();
        orgTypeName = ko.computed(() => {
            let me = this;
            let selected = me.selectedOrganizationType();
            if (selected) {
                return selected.name;
            }
            return '';
        });

        createdby = ko.observable('');
        createdon = ko.observable('');
        changedby = ko.observable('');
        changedon = ko.observable('');

        codeError  = ko.observable('');
        nameError  = ko.observable(false);
        emailError = ko.observable(false);
        orgTypeError = ko.observable(false);
        hasErrors = ko.observable(false);
        organizationTypes = ko.observableArray<Peanut.ILookupItem>();
        typeListCaption = ko.observable('');
        translator: Peanut.ITranslator;

        constructor(owner: Peanut.ITranslator) {
            this.translator = owner;
        };

        clearErrors() {
            let me = this;
            me.codeError('');
            me.nameError(false);
            me.emailError(false);
            me.orgTypeError(false);
            me.hasErrors(false);
        }

        clearForm() {
            let me = this;
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
        }

        assign(organization: IOrganizationEntity) {
            let me = this;
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
            // todo: retest this
            this.selectedOrganizationType(_.find(
                this.organizationTypes(),
                    function (i: ILookupItem) {
                        return i.id == organization.organizationType
                }));
            me.active(!!organization.active);
        }

        validate() {
            let me = this;
            me.clearErrors();

            let valid = true;
            let org = <IOrganization> {
                id          : me.id  (),
                addressId   : me.addressId(),
                code        : Peanut.KnockoutHelper.GetInputValue(me.code),
                name        : Peanut.KnockoutHelper.GetInputValue(me.name),
                email       : Peanut.KnockoutHelper.GetInputValue(me.email),
                phone       : me.phone(),
                fax         : me.fax (),
                notes       : me.notes(),
                description : me.description(),
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
        }
    }

    export class OrganizationsViewModel extends Peanut.ViewModelBase {
        private pageSize = 10;

        userCanEdit = ko.observable(true);
        tab = ko.observable('list');
        directoryListingTypes = ko.observableArray<Peanut.ILookupItem>();
        confirmSaveText = ko.observable('confirm save');
        confirmSaveHeader = ko.observable('confirm save');
        confirmDeleteText = ko.observable('confirm delete');
        useOrganizationNameForAddress = ko.observable(true);

        confirmDeleteHeader = ko.observable('confirm delete');
        currentPage = ko.observable(1);
        maxPages = ko.observable(1);
        refreshing = ko.observable(false);

        addressForm: addressObservable;
        organizationForm = new organizationObservable(this);

        organizationsList = ko.observableArray<IOrganizationListItem>();
        formHasErrors = ko.observable(false);

        updateRequest = null;

        init(successFunction?: () => void) {
            let me = this;
            console.log('Directory Init');
            me.application.loadResources([
                // Load libraries and core components
                '@lib:lodash',
                '@pnut/ViewModelHelpers',
                '@pnut/editPanel'
                //, '@pnut/searchListObservable',
            ], () => {
                // load classes that depend on Peanut core components. I.e. editPanel
                me.application.loadResources(['@pkg/qnut-directory/DirectoryEntities'], () => {
                    // load classes thatdepend on DirectoryEntities
                    me.application.loadResources(['@pkg/qnut-directory/AddressObservable'], () => {
                        // load remaining dependent classes/components and start initializations
                        me.addressForm = new addressObservable(me);
                        me.application.registerComponents([
                            '@pnut/modal-confirm',
                            '@pnut/pager'], () => {
                            me.getInitializations(() => {
                                me.bindDefaultSection();
                                successFunction();
                            });
                        });
                    });
                });
            });
        }

        getInitializations(doneFunction?: () => void) {
            let me = this;
            me.services.executeService('peanut.qnut-directory::organizations.InitializeOrganizations', {pageSize: me.pageSize} ,
                (serviceResponse: Peanut.IServiceResponse) => {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        let response = serviceResponse.Value;
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
            .fail(() => {
                let trace = me.services.getErrorInformation();
            });
        }

        private handleGetOrganizationResponse(response: IGetOrganizationResponse) {
            let me = this;
            me.organizationForm.assign(response.organization);
            if (response.address) {
                me.useOrganizationNameForAddress((!response.address.addressname) || (response.address.addressname == response.organization.name));
                me.addressForm.assign(response.address);
            }
            else {
                me.useOrganizationNameForAddress(true);
                me.addressForm.clear();
            }

        }

        private getOrganization(id: any) {
            let me = this;
            me.services.executeService('peanut.qnut-directory::organizations.GetOrganization', id,
                (serviceResponse: Peanut.IServiceResponse) => {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        let response = <IGetOrganizationResponse>serviceResponse.Value;
                        me.handleGetOrganizationResponse(response);
                        me.tab('view');
                    }
                })
                .fail(() => {
                    let trace = me.services.getErrorInformation();
                });
        }

        onPagerClick = (move: number) => {
            let pageNumber = this.currentPage() + move;
            let me = this;
            me.refreshing(true);
            me.services.executeService('peanut.qnut-directory::organizations.GetOrganizations',
                {pageSize: me.pageSize, pageNumber: pageNumber} ,
                (serviceResponse: Peanut.IServiceResponse) => {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        me.organizationsList(serviceResponse.Value);
                        me.currentPage(pageNumber);
                    }
                })
                .fail(() => {
                    let trace = me.services.getErrorInformation();
                })
                .always(() => {
                    me.refreshing(false)
                });
        };

        newOrganization = () => {
            let me = this;
            me.organizationForm.clearForm();
            me.organizationForm.id(0);
            me.useOrganizationNameForAddress(true);
            me.tab('edit');
        };

        viewOrganization  = (org: IOrganizationListItem) => {
            this.getOrganization(org.id);
        };

        showList = () => {
            this.tab('list');
        };
        editOrganization = () => {
            this.tab('edit');
        };
        removeOrganization = () => {
            let me = this;
        };

        createAddress = () => {
            let me = this;
            me.addressForm.clear();
            me.organizationForm.addressId(0);
        };

        removeAddress = () => {
            let me = this;
            me.organizationForm.addressId(null);
        };

        validateAddress() {
            let me = this;
            if (me.organizationForm.addressId() === null) {
                return null;
            }
            if (!me.addressForm.validate()) {
                return false;
            }
            let address =  new DirectoryAddress();
            me.addressForm.updateDirectoryAddress(address);
            address.editState = me.organizationForm.addressId() === 0 ? Peanut.editState.created : Peanut.editState.updated;
            return address;
        };

        confirmSaveOrganization = () => {
            let me = this;
            me.updateRequest = null;
            me.formHasErrors(false);
            let org = me.organizationForm.validate();
            if (me.useOrganizationNameForAddress()) {
                if (!me.organizationForm.name()) {
                    me.formHasErrors(true);
                    return;
                }
                me.addressForm.addressname(me.organizationForm.name());
            }
            let address = me.validateAddress();
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
                me.updateRequest.address =  new DirectoryAddress();
                me.addressForm.updateDirectoryAddress(me.updateRequest.address);
                me.updateRequest.address.id = me.organizationForm.addressId();
                me.updateRequest.address.editState = me.organizationForm.addressId() === 0 ? Peanut.editState.created : Peanut.editState.updated;
            }

            jQuery('#confirm-save-modal').modal('show');
        };

        saveOrganization = () => {
            let me = this;
            jQuery('#confirm-save-modal').modal('hide');
            me.showActionWaiterBanner(
                me.updateRequest.organizationId == 0 ? 'add' : 'update','organization-entity'
            );
            me.services.executeService('peanut.qnut-directory::organizations.UpdateOrganization',me.updateRequest,
                (serviceResponse: Peanut.IServiceResponse) => {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        let response = <IGetOrganizationsResponse>serviceResponse.Value;
                        me.organizationsList(response.organizations);
                        me.maxPages(response.maxpages);
                        me.currentPage(1);
                        me.handleGetOrganizationResponse(<IGetOrganizationResponse>serviceResponse.Value);
                        me.tab('view');
                    }
                    else  {
                        let response = serviceResponse.Value || {};
                        if (response.errortype) {
                            switch (response.errortype) {
                                case 'duplicate-code' :
                                    me.organizationForm.codeError(response.errormessage);
                                    me.formHasErrors(true);
                                    break;
                            }
                        }
                    }
                }
            ).fail(() => {
                let trace = me.services.getErrorInformation();
            }).always(() => {
                me.updateRequest = null;
                me.application.hideWaiter();
            });

        };
        cancelOrganizationEdit = () => {
            let me = this;
            me.tab(
                this.organizationForm.id() === 0 ? 'list' : 'view'
            );
        };

        confirmDeleteOrganization = () => {
            let me = this;
            jQuery('#confirm-delete-modal').modal('show');
        };

        deleteOrganization = () => {
            let me = this;
            me.showActionWaiterBanner('delete','organization-entity');
            me.services.executeService('peanut.qnut-directory::organizations.DeleteOrganization',
                {
                    id: me.organizationForm.id(),
                    pageSize: me.pageSize,
                },(serviceResponse: Peanut.IServiceResponse) => {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        let response = <IGetOrganizationsResponse>serviceResponse.Value;
                        me.organizationForm.clearForm();
                        me.addressForm.clear();
                        me.organizationsList(response.organizations);
                        me.maxPages(response.maxpages);
                        me.currentPage(1);

                        jQuery('#confirm-delete-modal').modal('hide');
                        me.tab('list');
                    }
                }
            ).fail(() => {
                let trace = me.services.getErrorInformation();
            }).always(() => {
                me.application.hideWaiter();
            });
        };
    }
}