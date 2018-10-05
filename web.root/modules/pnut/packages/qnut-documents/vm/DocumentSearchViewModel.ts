/// <reference path="../../../../pnut/core/ViewModelBase.ts" />
/// <reference path='../../../../typings/knockout/knockout.d.ts' />
/// <reference path='../../../../pnut/core/peanut.d.ts' />
/// <reference path='../../../../pnut/components/entityPropertiesComponent' />


namespace QnutDocuments {

    import INameValuePair = Peanut.INameValuePair;

    interface IDocumentSearchInitResponse {
        properties : Peanut.IPropertyDefinition[];
        propertyLookups: Peanut.ILookupItem[];
        // documentStatusTypes: Peanut.ILookupItem[];
        // documentTypes: Peanut.ILookupItem[];
        translations : any[];
    }

    interface IDocumentSearchResult {
        id: any,
        title: string,
        publicationDate: string,
        documentType: string,
        fileType: string,
    }

    interface IDocumentSearchRequest {
        title: '',
        keywords: '',
        fulltext: false,
        dateSearchMode: any,
        firstDate: any,
        secondDate: any,
        properties: string[]
    }

    export class DocumentSearchViewModel extends Peanut.ViewModelBase {
        // observables
        test = ko.observable('DocumentSearchViewModel loaded');

        searchResults = ko.observableArray<IDocumentSearchResult>([]);
        resultCount = ko.observable(0);
        tab = ko.observable('search');
        propertiesController : Peanut.entityPropertiesController;

        statusTypes = ko.observableArray<Peanut.ILookupItem>([]);
        selectedStatusType = ko.observable<Peanut.ILookupItem>(null);

        // documentTypes = ko.observableArray<Peanut.ILookupItem>([]);
        // selectedDocumentType = ko.observable<Peanut.ILookupItem>(null);

        // documentFileTypes = ko.observableArray([]);
        // selectedFileType = ko.observable(null);

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
        publicationDate = ko.observable('');

        defaultLookupCaption = ko.observable('');
        searched = ko.observable(false);

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
                        let defaultLookupCaption = me.translate('document-search-dropdown-caption','(any)');
                        me.propertiesController = new Peanut.entityPropertiesController(response.properties,
                            response.propertyLookups,defaultLookupCaption,true);
                        me.defaultLookupCaption(defaultLookupCaption);
                        // me.documentTypes(response.documentTypes);
                        // me.statusTypes(response.documentStatusTypes);

                        // todo: translate
                        // me.documentFileTypes([
                        //     {Name: me.defaultLookupCaption(), Value: ''},
                        //     {Name: me.translate('document-type-label-pdf'), Value: 'pdf'},
                        //     {Name: me.translate('document-type-label-word'), Value: 'doc'},
                        //     ]);
                        // let test = me.documentFileTypes();

                        me.dateSearchModes([
                            // {Name: me.defaultLookupCaption(), Value: 1},
                            {Name: me.translate('date-seach-mode-on'), Value: 1},
                            {Name: me.translate('date-seach-mode-before'), Value: 2},
                            {Name: me.translate('date-seach-mode-after'), Value: 3},
                            {Name: me.translate('date-seach-mode-between'), Value: 4}
                        ]);
                        me.selectedDateSearchMode.subscribe(me.onDateModeChange);
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
            this.selectedStatusType(null);
//            this.selectedDocumentType(null);
            this.fullTextSearch(true);
            this.titleSearch('');
            this.textSearch('');
            this.selectedDateSearchMode(null);
            this.publicationDate('');
  //          this.selectedFileType(null);
            this.propertiesController.clearValues();
            this.searchResults([]);
            this.resultCount(0);
            this.tab('search');
        };

        onDateModeChange = (selected: INameValuePair) => {
            this.showSecondDate(selected && selected.Value == 4);
        };

        showSearchForm  = () => {
            this.tab('search');
        };

        showResults  = () => {
            this.tab('results');
        };

        executeSearch = () => {
            // todo: implement executeSearch
            this.searched(true);
        };

        newDocument = () => {
            // todo: implement newDocument
        };

        returnToSearchForm = () => {
            this.searched(false);
        }
    }
}