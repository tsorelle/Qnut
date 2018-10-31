/// <reference path="../../../../pnut/core/ViewModelBase.ts" />
/// <reference path='../../../../typings/knockout/knockout.d.ts' />
/// <reference path='../../../../pnut/core/peanut.d.ts' />
/// <reference path='../../../../pnut/components/entityPropertiesComponent' />


namespace QnutDocuments {

    import INameValuePair = Peanut.INameValuePair;

    interface IDocumentSearchInitResponse {
        properties : Peanut.IPropertyDefinition[];
        propertyLookups: Peanut.ILookupItem[];
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

    interface IDocumentSearchRequest {
        title: string,
        keywords: string,
        fulltext: boolean,
        literal: boolean,
        dateSearchMode: any,
        firstDate: any,
        secondDate: any,
        properties: string[]
    }

    export class DocumentSearchViewModel extends Peanut.ViewModelBase {
        // observables
        searchResults = ko.observableArray<IDocumentSearchResult>([]);
        resultCount = ko.observable(0);
        propertiesController : Peanut.entityPropertiesController;

        textOption = ko.observable('keywords');
        dateSearchModes = ko.observableArray<Peanut.INameValuePair>([]);
        selectedDateSearchMode = ko.observable<Peanut.INameValuePair>();
        showSecondDate = ko.observable(false);
        startDate = ko.observable('');
        endDate = ko.observable('');
        startDateVisible = ko.observable(false);
        endDateVisible = ko.observable(false);

        titleSearch = ko.observable('');
        textSearch = ko.observable('');
        fullTextSearch = ko.observable(true);
        fullTextSupported = ko.observable(false);
        publicationDate = ko.observable('');
        searchResultMessage = ko.observable('');
        noSearchResultsText = '';
        searchResultsFormat = '';
        defaultLookupCaption = ko.observable('');
        searched = ko.observable(false);

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

                me.application.registerComponents('@pnut/entity-properties', () => {
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
                        me.docEditLinkTitle(me.translate('document-icon-label-edit'));

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
            this.fullTextSearch(true);
            this.titleSearch('');
            this.textSearch('');
            this.selectedDateSearchMode(null);
            this.publicationDate('');
            this.propertiesController.clearValues();
            this.searchResults([]);
            this.resultCount(0);
        };

        onDateModeChange = (selected: INameValuePair) => {
            this.showSecondDate(selected && selected.Value == 4);
        };

        executeSearch = () => {
            // todo: impliement paging
            let me = this;
            let request = <IDocumentSearchRequest>{
                title: me.titleSearch(),
                keywords: me.textSearch(),
                literal: (me.textOption() == 'literal'),
                fulltext: me.fullTextSearch(),
                dateSearchMode: me.selectedDateSearchMode() ? me.selectedDateSearchMode().Value : null,
                firstDate: me.startDate(),
                secondDate: me.endDate(),
                properties: this.propertiesController.getValues()
            };

            me.application.hideServiceMessages();
            me.showLoadWaiter();
            me.services.executeService('peanut.qnut-documents::FindDocuments',request,
                function(serviceResponse: Peanut.IServiceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        let response = <IDocumentSearchResult[]>serviceResponse.Value;
                        me.searchResults(response);
                        let resultCount = response.length;
                        me.searchResultMessage (
                            resultCount ? me.searchResultsFormat.replace('%s',resultCount.toString()) : me.noSearchResultsText
                        );
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
            // todo: implement downDocument
            alert('downDocument')
        };

        newDocument = () => {
            // todo: implement newDocument
            alert('newDocument')
        };

        returnToSearchForm = () => {
            this.searched(false);
        }
    }
}