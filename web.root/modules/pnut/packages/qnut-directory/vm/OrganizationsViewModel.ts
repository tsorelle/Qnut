/// <reference path="../../../../pnut/core/ViewModelBase.ts" />
/// <reference path='../../../../typings/knockout/knockout.d.ts' />
/// <reference path='../../../../typings/jqueryui/jqueryui.d.ts' />
/// <reference path='../../../../typings/jqueryui/jqueryui.d.ts' />
/// <reference path='../../../../pnut/core/peanut.d.ts' />
/// <reference path='../../../../typings/lodash/first/index.d.ts' />
/// <reference path='../js/DirectoryEntities.ts' />
/// <reference path='../js/AddressObservable.ts' />

namespace QnutDirectory {

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

        codeError  = ko.observable(false);
        nameError  = ko.observable(false);
        emailError = ko.observable(false);
        orgTypeError = ko.observable(false);
        hasErrors = ko.observable(false);
        organizationTypes = ko.observableArray<Peanut.ILookupItem>();
        typeListCaption = ko.observable('');



        clearErrors() {
            let me = this;
            me.codeError(false);
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
            this.selectedOrganizationType(_.find(this.organizationTypes(),{id: organization.organizationType }));
            me.active(!!organization.active);
        }

        validate() {
            let me = this;
            me.clearErrors();
            let valid = true;
            let org = <IOrganization> {
                id          : me.id  (),
                addressId   : me.addressId(),
                code        : me.code() ? me.code() : me.code().trim(),
                name        : me.name() ? me.name() : me.name().trim(),
                email       : me.email()  ? me.email() : me.email().trim(),
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
                me.codeError(true);
            }

            if (org.email) {
                valid = (!Peanut.Helper.ValidateEmail(org.email));
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

        confirmDeleteHeader = ko.observable('confirm delete');
        currentPage = ko.observable(1);
        maxPages = ko.observable(1);
        refreshing = ko.observable(false);

        addressForm: addressObservable;
        organizationForm = new organizationObservable();

        organizationsList = ko.observableArray<IOrganizationListItem>();
        formHasErrors = ko.observable(false);

        init(successFunction?: () => void) {
            let me = this;
            console.log('Directory Init');

            me.application.loadResources([
                // '@lib:jqueryui-css',
                // '@lib:jqueryui-js',
                '@lib:lodash',
                '@pnut/ViewModelHelpers',
                // '@pnut/searchListObservable',
                '@pkg/qnut-directory/DirectoryEntities'], () => {
                me.application.loadResources([
                    '@pkg/qnut-directory/AddressObservable'], () => {
                    me.addressForm = new addressObservable(me);
                    me.application.registerComponents([
                        '@pnut/modal-confirm',
                        '@pnut/pager'], () => {
                        // initialize date popups
                        // jQuery(function () {
                        //     jQuery(".datepicker").datepicker();
                        // });
                        me.getInitializations(() => {
                            me.bindDefaultSection();
                            successFunction();
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
                        me.maxPages(response.maxPages);
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
                        me.organizationForm.typeListCaption('organization-select-type');
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

        private getOrganization(id: any) {
            let me = this;
            me.services.executeService('peanut.qnut-directory::organizations.GetOrganization', id,
                (serviceResponse: Peanut.IServiceResponse) => {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        let response = <IGetOrganizationResponse>serviceResponse.Value;
                        me.organizationForm.assign(response.organization);
                        if (response.address) {
                            me.addressForm.assign(response.address);
                        }
                        else {
                            me.addressForm.clear();
                        }
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

        confirmDeleteOrganization = () => {
            let me = this;
        };

        confirmSaveOrganization = () => {
            let me = this;
        };
        saveOrganization = () => {
            let me = this;
        };
        cancelOrganizationEdit = () => {
            let me = this;
            me.tab('view');
        };
        deleteOrganization = () => {
            let me = this;
        };
    }
}