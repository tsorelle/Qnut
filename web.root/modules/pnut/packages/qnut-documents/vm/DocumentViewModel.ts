/// <reference path="../../../../pnut/core/ViewModelBase.ts" />
/// <reference path='../../../../typings/knockout/knockout.d.ts' />
/// <reference path='../../../../pnut/core/peanut.d.ts' />

namespace QnutDocuments {


    import IKeyValuePair = Peanut.IKeyValuePair;
    import IViewModel = Peanut.IViewModel;
    import ViewModelBase = Peanut.ViewModelBase;

    interface IDocumentRecord {
        id : any;
        title : string;
        filename : string;
        folder : string;
        abstract : string;
        protected : any;
        publicationDate : string;
        properties : Peanut.IKeyValuePair[];
    }

    interface IDocumentInitResponse {
        properties : Peanut.IPropertyDefinition[];
        propertyLookups: Peanut.ILookupItem[];
        translations : any[];
        canEdit: boolean;
        maxFileSize: any;
        documentsUri: string;
        searchUri: string,
        document: IDocumentRecord;
    }

    interface IDocumentUpdateRequest {
        document: IDocumentRecord;
        fileDisposition: string;
        propertyValues : Peanut.IKeyValuePair[];
    }

    export class documentObservable {
        public constructor(owner: Peanut.ViewModelBase,
                           properties: Peanut.IPropertyDefinition[],lookups : any[], selectText : string = 'Select') {
            this.owner = <ViewModelBase>owner;
            this.propertiesController =  new Peanut.entityPropertiesController(properties,lookups,selectText,true);
        }
        owner : ViewModelBase;
        id = ko.observable(0);
        title = ko.observable('');
        filename = ko.observable('');
        folder = ko.observable('');
        abstract = ko.observable('');
        protected = ko.observable(false);
        publicationDate = ko.observable('');
        propertiesController : Peanut.entityPropertiesController;

        hasErrors = ko.observable(false);
        titleError = ko.observable(false);
        abstractError = ko.observable(false);
        publicationDateError = ko.observable(false);
        fileNameError = ko.observable(false);
        fileSelectError=ko.observable(false);

        public clear = () => {
            this.id(0);
            this.title('');
            this.filename('');
            this.folder('');
            this.abstract('');
            this.protected(false);
            this.publicationDate(this.owner.getTodayString());
            this.propertiesController.clearValues();
            this.clearErrors();
        };

        public clearErrors = () => {
            this.hasErrors(false);
            this.titleError(false);
            this.publicationDateError(false);
            this.abstractError(false);
            this.fileNameError(false);
            this.fileSelectError(false);
        };

        public assign = (document : IDocumentRecord) => {
            this.clearErrors();
            this.id(document.id);
            this.title(document.title || '');
            this.filename(document.filename || '');
            this.folder(document.folder || '');
            this.abstract(document.abstract || '');
            this.protected(document.protected);
            this.publicationDate(this.owner.isoToShortDate(document.publicationDate));

            this.propertiesController.setValues(document.properties);
            this.propertiesController.setValue('committee',47);

            this.fileNameError(true);


        };

        public showFileSelectError = () =>  {
            this.fileSelectError(true);
            this.hasErrors(true);
        };

        public showFileAssignError = () =>  {
            this.fileNameError(true);
            this.hasErrors(true);
        };

        public validate = () => {
            let valid = true;
            // this.clearErrors();
            // assume errors cleared
            let document = <IDocumentRecord>{
                id: this.id(),
                title: this.title(),
                filename: this.filename(),
                folder: this.folder(),
                abstract: this.abstract(),
                protected: this.protected(), // ? 1 : 0,
                publicationDate: this.owner.shortDateToIso(this.publicationDate()),
                properties: this.propertiesController.getValues(),
            };

            if (!document.title) {
                this.titleError(true);
                valid = false;
            }
            if (!document.abstract) {
                this.abstractError(true);
                valid = false;
            }

            if (!document.publicationDate) {
                this.publicationDateError(true);
                valid = false;
            }

            this.hasErrors(!valid);
            return valid ? document : null;
        }

    }

    export class DocumentViewModel extends Peanut.ViewModelBase {
        // observables
        test = ko.observable('DocumentViewModel loaded');
        defaultLookupCaption = ko.observable('');
        fileDisposition = ko.observable('none'); // 'upload','replace','none'
        tab = ko.observable('view'); // 'view','edit','error'
        canEdit = ko.observable(false);
        documentUri : string = '';
        searchUri = ko.observable('');
        documentId = ko.observable<any>(0);
        documentForm : documentObservable;
        downloadHref = ko.observable('');
        viewPdfHref = ko.observable('');
        currentFileName = ko.observable('');
        replaceFile = ko.observable(false);
        currentDocument : IDocumentRecord = null;
        conflicts = ko.observableArray<IDocumentRecord>([]);
        docViewLinkTitle = ko.observable('View document');


        init(successFunction?: () => void) {
            let me = this;
            console.log('Document vm Init');
            me.showLoadWaiter();
            me.application.loadResources([
                '@lib:jqueryui-css',
                '@lib:jqueryui-js',
                // '@lib:lodash',
                '@pnut/ViewModelHelpers.js'
            ], () => {
                // initialize date popups
                jQuery(function () {
                    jQuery(".datepicker").datepicker();
                });

                me.application.registerComponents('@pnut/entity-properties', () => {
                    me.getInitializations(() => {
                        me.application.hideWaiter();
                        me.bindDefaultSection();
                        successFunction();
                    });
                });
            });
        }

        getInitializations(doneFunction?: () => void) {
            let me = this;
            let documentId = Peanut.Helper.getRequestParam('id');
            me.downloadHref('');
            me.viewPdfHref('');
            me.application.hideServiceMessages();
            me.showLoadWaiter();
            me.services.executeService('peanut.qnut-documents::InitDocumentForm',documentId,
                function(serviceResponse: Peanut.IServiceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        let response = <IDocumentInitResponse>serviceResponse.Value;
                        me.canEdit(response.canEdit);
                        me.documentUri = response.documentsUri;
                        me.searchUri(response.searchUri);
                        me.addTranslations(response.translations);
                        me.docViewLinkTitle(me.translate('document-icon-label-view'));
                        let defaultLookupCaption = me.translate('document-search-dropdown-caption','(any)');
                        me.defaultLookupCaption(defaultLookupCaption);
                        me.documentForm = new documentObservable(me,response.properties,
                            response.propertyLookups,defaultLookupCaption);
                        if (response.document) {
                            me.loadDocument(response.document);
                        }
                        else {
                            me.newDocument();
                        }

                        // me.docViewLinkTitle(me.translate('document-icon-label-view'));
                        // me.docDownloadLinkTitle(me.translate('document-icon-label-download'));
                        // me.docEditLinkTitle(me.translate('document-icon-label-edit'));
                    }
                    else {
                        me.tab('error');
                    }
                })
                .fail(function () {
                    me.tab('error');
                    let trace = me.services.getErrorInformation();
                })
                .always(function () {
                    me.application.hideWaiter();
                    if (doneFunction) {
                        doneFunction();
                    }
                });
        }

        private handleDocumentResponse = (response) => {
            let me = this;
            me.loadDocument(response.document);
        };

        loadDocument = (document: IDocumentRecord) => {
            let me = this;
            let href = me.documentUri + document.id;

            let filename = document.filename || '';
            let p = filename.lastIndexOf('.');
            let ext = p >= 0 ? filename.substring(p + 1, filename.length) : '';
            me.viewPdfHref(ext == 'pdf' ? href : '');
            me.downloadHref(href + '/download');

            me.documentId(document.id);
            me.fileDisposition(filename ? 'none' : 'upload');
            me.currentFileName(document.filename);
            // me.currentFileName('');
            me.replaceFile(false);
            me.currentDocument = document;
            me.documentForm.assign(document);
            me.tab('view');
        };

        editDocument = () => {
            if (this.canEdit()) {
                this.tab('edit');
            }
            else {
                this.showErrorPage()
            }
        };

        newDocument = () => {
            let me = this;
            me.currentDocument = null;
            if (me.canEdit()) {
                me.documentId(0);
                me.currentFileName('');
                me.documentForm.clear();
                $("#documentFile").val("");
                me.tab('edit');
                me.fileDisposition('upload');
            }
            else {
                this.showErrorPage('document-access-error');
            }
        };

        getFilesForUpload() {
            let disposition = this.fileDisposition();
            let files = null;
            if (disposition === 'upload' || disposition == 'assign') {
                files = Peanut.Helper.getSelectedFiles('#documentFile');
                if (!files) {
                    return false;
                }
            }
            return files;
        }

        validateForm = (files) => {
            let valid = true;
            this.documentForm.clearErrors();
            let request = <IDocumentUpdateRequest>{
                document: null,
                fileDisposition: this.fileDisposition(),
                propertyValues: []
            };

            switch (this.fileDisposition()) {
                case 'none':
                    $("#documentFile").val("");
                    break;
                case 'assign' :
                    $("#documentFile").val("");
                    if (!this.documentForm.filename()) {
                        this.documentForm.showFileAssignError();
                        valid = false;
                    }
                    break;
                case 'upload' :
                case 'replace' :
                    if (!files) {
                        this.documentForm.showFileSelectError();
                        valid = false;
                    }
            }

            request.document = this.documentForm.validate();

            if (!request.document) {
                valid = false;
            }

            if (valid) {
                request.propertyValues = this.documentForm.propertiesController.getValues();
                return request;
            }

            return false;
        };

        updateDocument = () => {
            let me = this;
            me.application.hideServiceMessages();
            let files = me.getFilesForUpload();
            let request = me.validateForm(files);
            if (request === false) {
                return;
            }

            me.showActionWaiter( request.document.id ? 'update' : 'add','document');
            me.services.postForm( 'peanut.qnut-documents::UpdateDocument', request, files, null,
                function (serviceResponse: Peanut.IServiceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        let response = <IDocumentRecord>serviceResponse.Value;
                        me.loadDocument(response);
                    }
                    else {
                        if (serviceResponse.Value && serviceResponse.Value.conflicts) {
                            me.showConflictsPage(serviceResponse.Value.conflicts);
                        }
                        else {

                            me.showErrorPage();
                        }
                    }
                    }).fail(() => {
                        let trace = me.services.getErrorInformation();
                    }).always(() => {
                        me.application.hideWaiter();
                    });
        };

        cancelEdit = () => {
            if (this.documentForm.id() == 0) {
                this.documentForm.clear();
            }
            else if (this.currentDocument) {
                this.documentForm.assign(this.currentDocument);
            }

            this.tab('view');
        };

        showConflictsPage = (conflicts: any[]) => {
            this.conflicts(conflicts);
            this.tab('conflicts');
        };

        showEditPage = () => {
            this.tab('edit');
        };

        showErrorPage = (message = '') => {
            if (message) {
                this.application.showError(this.translate(message));
            }
            this.tab('error');
        };

        confirmDelete = () => {
            jQuery("#confirm-delete-document-modal").modal('show');
        };

        loadNewDocument = (document: IDocumentRecord) => {
            let me = this;
            me.application.hideServiceMessages();
            me.showLoadWaiter();
            me.services.executeService('peanut.qnut-documents::GetDocumentProperties',document.id,
                function(serviceResponse: Peanut.IServiceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        document.properties =  serviceResponse.Value;
                        me.loadDocument(document);
                    }
                    else {
                        me.tab('error');
                    }
                })
                .fail(function () {
                    me.tab('error');
                    let trace = me.services.getErrorInformation();
                })
                .always(function () {
                    me.application.hideWaiter();
                });

        };

        deleteDocument = () => {
            let me = this;
            jQuery("#confirm-delete-document-modal").modal('hide');

            me.application.hideServiceMessages();
            me.showLoadWaiter();
            me.services.executeService('peanut.qnut-documents::DeleteDocument',me.documentForm.id(),
                function(serviceResponse: Peanut.IServiceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        window.location.assign(me.searchUri());
                    }
                    else {
                        me.tab('error');
                    }
                })
                .fail(function () {
                    me.tab('error');
                    let trace = me.services.getErrorInformation();
                })
                .always(function () {
                    me.application.hideWaiter();
                });
        };
    }
}