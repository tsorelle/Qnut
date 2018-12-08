/// <reference path="../../../../pnut/core/ViewModelBase.ts" />
/// <reference path='../../../../typings/knockout/knockout.d.ts' />
/// <reference path='../../../../pnut/core/peanut.d.ts' />
/// <reference path='../../../../pnut/components/entityPropertiesComponent' />


namespace QnutDocuments {

    import INameValuePair = Peanut.INameValuePair;
    import ILookupItem = Peanut.ILookupItem;

    interface IDocumentSearchInitResponse {
        properties : Peanut.IPropertyDefinition[];
        propertyLookups: Peanut.ILookupItem[];
        fileTypes: ILookupItem[];
        fullTextSupported : boolean;
        translations : any[];
    }

    interface IDocumentSearchResult {
        id: any,
        title: string,
        publicationDate: string,
        uri: string,
        editUrl: string,
        documentType: string
    }

    interface IDocumentSearchResponse {
        searchResults: any;
        recordCount: any;
    }

    interface IDocumentSearchRequest {
        searchType: string,
        searchText: string
        sortOrder: any,
        sortDescending: boolean,
        pageNumber: any,
        itemsPerPage: any,
        recordCount: any
    }

    interface IDocumentInfoSearchRequest extends IDocumentSearchRequest{
        title: string,
        fileType: string,
        literal: boolean,
        dateSearchMode: any,
        firstDate: any,
        secondDate: any,
        properties: string[],
    }

    export class DocumentSearchViewModel extends Peanut.ViewModelBase {
        // observables
        searchResults = ko.observableArray<IDocumentSearchResult>([]);
        resultCount = ko.observable(0);
        propertiesController : Peanut.entityPropertiesController;

        textOption = ko.observable('keywords');
        fileTypes = ko.observableArray<ILookupItem>();
        selectedFileType = ko.observable<ILookupItem>();
        dateSearchModes = ko.observableArray<Peanut.INameValuePair>([]);
        selectedDateSearchMode = ko.observable<Peanut.INameValuePair>();
        showSecondDate = ko.observable(false);
        startDate = ko.observable('');
        endDate = ko.observable('');
        startDateVisible = ko.observable(false);
        endDateVisible = ko.observable(false);
        sortOrder = ko.observable(1);
        sortDescending = ko.observable(true);
        titleSearch = ko.observable('');
        textSearch = ko.observable('');
        fullTextSearch = ko.observable(false);
        fullTextSupported = ko.observable(false);
        publicationDate = ko.observable('');
        searchResultMessage = ko.observable('');
        noSearchResultsText = '';
        searchResultsFormat = '';
        defaultLookupCaption = ko.observable('');
        searched = ko.observable(false);
        recordCount = ko.observable(0);
        currentPage = ko.observable(1);
        maxPages = ko.observable(2);

        docViewLinkTitle = ko.observable('View document');
        docDownloadLinkTitle = ko.observable('Download document');
        docEditLinkTitle = ko.observable('Edit document information');


        init(successFunction?: () => void) {
            let me = this;
            console.log('DocumentSearch Init');

            me.application.loadResources([
                '@lib:jqueryui-css',
                '@lib:jqueryui-js',
                '@lib:lodash'
                // ,'@pnut/ViewModelHelpers'
            ], () => {
                // initialize date popups
                jQuery(function () {
                    jQuery(".datepicker").datepicker();
                });

                me.application.registerComponents('@pnut/entity-properties,@pnut/pager', () => {
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
            me.showLoadWaiter();
            me.services.executeService('peanut.qnut-documents::InitDocumentSearch',null,
                function(serviceResponse: Peanut.IServiceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        let response = <IDocumentSearchInitResponse>serviceResponse.Value;
                        me.fileTypes(response.fileTypes);
                        me.selectedFileType(null);
                        me.addTranslations(response.translations);
                        me.noSearchResultsText = me.translate('document-search-not-found');
                        me.searchResultsFormat = me.translate('document-search-found');

                        me.fullTextSupported(response.fullTextSupported);
                        me.dateSearchModes([
                            // {Name: me.defaultLookupCaption(), Value: 1},
                            {Name: me.translate('date-search-mode-on'), Value: 1},
                            {Name: me.translate('date-search-mode-before'), Value: 2},
                            {Name: me.translate('date-search-mode-after'), Value: 3},
                            {Name: me.translate('date-search-mode-between'), Value: 4}
                        ]);
                        me.selectedDateSearchMode.subscribe(me.onDateModeChange);
                        let test = me.dateSearchModes();
                        let defaultLookupCaption = me.translate('document-search-dropdown-caption','(any)');
                        me.propertiesController = new Peanut.entityPropertiesController(response.properties,
                            response.propertyLookups,defaultLookupCaption,true);
                        me.defaultLookupCaption(defaultLookupCaption);
                        me.docViewLinkTitle(me.translate('document-icon-label-view'));
                        me.docDownloadLinkTitle(me.translate('document-icon-label-download'));
                        me.docEditLinkTitle(me.translate('document-icon-label-open'));

                    }
                    else {
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

        clearForm = () => {
            this.fullTextSearch(false);
            this.selectedFileType(null);
            this.titleSearch('');
            this.textSearch('');
            this.selectedDateSearchMode(null);
            this.publicationDate('');
            this.propertiesController.clearValues();
            this.searchResults([]);
            this.recordCount(0);
            this.currentPage(1);
            this.maxPages(0);
        };

        onDateModeChange = (selected: INameValuePair) => {
            this.showSecondDate(selected && selected.Value == 4);
        };

        executeSearch = (isNew = true) => {
            let me = this;
            if (isNew) {
                me.recordCount(0);
                me.currentPage(1);
            }

            let request : any = {
                searchType : me.fullTextSearch() ? 'text' : 'info',
                searchText : me.textSearch(),
                sortOrder: me.sortOrder(),
                sortDescending: me.sortDescending(),
                pageNumber: me.currentPage(),
                itemsPerPage: 4,
                recordCount: me.recordCount()
            };
            if (!me.fullTextSearch()) {
                request.title = me.titleSearch();
                request.fileType = me.selectedFileType() ? me.selectedFileType().code : null;
                request.literal = (me.textOption() == 'literal');
                request.dateSearchMode = me.selectedDateSearchMode() ? me.selectedDateSearchMode().Value : null;
                request.firstDate = me.startDate();
                request.secondDate = me.endDate();
                request.properties = this.propertiesController.getValues();
            };

            me.application.hideServiceMessages();
            me.showLoadWaiter();
            me.services.executeService('peanut.qnut-documents::FindDocuments',request,
                function(serviceResponse: Peanut.IServiceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {

                        let response = <IDocumentSearchResponse>serviceResponse.Value;
                        me.searchResults(response.searchResults);
                        if (isNew) {
                            let resultCount = response.recordCount;
                            me.recordCount(resultCount);
                            me.searchResultMessage(
                                resultCount ? me.searchResultsFormat.replace('%s', resultCount.toString()) : me.noSearchResultsText
                            );
                            me.maxPages(Math.ceil(resultCount / request.itemsPerPage));
                        }
                        me.searched(true);
                    }
                    else {
                    }
                })
                .fail(function () {
                    let trace = me.services.getErrorInformation();
                })
                .always(function () {
                    me.application.hideWaiter();
                });

        };

        downloadDocument = (doc : IDocumentSearchResult) => {
            window.location.href=doc.uri + '/download';
        };

        returnToSearchForm = () => {
            this.searched(false);
        };

        changePage = (move: number) => {
            let current = this.currentPage() + move;
            this.currentPage(current);
            this.executeSearch(false);
        };

        toggleSearchType = () => {
            let current = this.fullTextSearch();
            this.fullTextSearch(!current);
        }
    }
}