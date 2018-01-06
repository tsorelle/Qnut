/// <reference path="../../../../pnut/core/ViewModelBase.ts" />
/// <reference path='../../../../typings/knockout/knockout.d.ts' />
/// <reference path='../../../../typings/jqueryui/jqueryui.d.ts' />
/// <reference path='../../../../pnut/core/peanut.d.ts' />
/// <reference path='../js/DirectoryEntities.ts' />
/// <reference path='../js/AddressObservable.ts' />

namespace QnutDirectory {
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

    export class OrganizationsViewModel extends Peanut.ViewModelBase {
        private pageSize = 10;

        userCanEdit = ko.observable(true);
        tab = ko.observable('list');
        directoryListingTypes = ko.observableArray<Peanut.ILookupItem>();
        organizationTypes = ko.observableArray<Peanut.ILookupItem>();
        confirmSaveText = ko.observable('confirm save');
        confirmSaveHeader = ko.observable('confirm save');
        confirmDeleteText = ko.observable('confirm delete');

        confirmDeleteHeader = ko.observable('confirm delete');
        currentPage = ko.observable(1);
        maxPages = ko.observable(1);
        refreshing = ko.observable(false);

        addressForm: addressObservable;
        organizationForm = {
            id: ko.observable(null),
            addressId : ko.observable(null),
            code : ko.observable(''),
            name : ko.observable(''),
            email : ko.observable(''),
            phone : ko.observable(''),
            fax : ko.observable(''),
            notes : ko.observable(''),
            description : ko.observable(''),
            typeName: ko.observable(''),
            selectedOrganizationType : ko.observable(),
        };

        organizationsList = ko.observableArray<IOrganizationListItem>();

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
                        // todo: me.addressForm.addressTypes(response.addressTypes);
                        // todo: me.userCanEdit(response.canEdit);
                        //  todo: me.directoryListingTypes(response.listingTypes);
                        //  todo: me.addressForm.assignPostalSubscriptionList(response.postalLists);

                        //  todo: me.addTranslations(response.translations);
                        //  todo: me.organizationTypes(response.organizationTypes);
                        //  todo: me.confirmDeleteHeader(me.translate('organization-confirm-delete-header'));
                        //  todo: me.confirmDeleteText(me.translate('organization-confirm-delete-text'));
                        //  todo: me.confirmSaveHeader(me.translate('organization-confirm-save-header'));
                        //  todo: me.confirmSaveText(me.translate('organization-confirm-save-text'));
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
        };

        viewOrganization  = () => {
            let me = this;
        };

        editOrganization = () => {
            let me = this;
        };
        removeOrganization = () => {
            let me = this;
        };
        createAddress = () => {
            let me = this;
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
        };
        deleteOrganization = () => {
            let me = this;
        };
    }
}