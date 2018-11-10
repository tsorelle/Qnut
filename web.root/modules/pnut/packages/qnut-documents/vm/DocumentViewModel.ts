/// <reference path="../../../../pnut/core/ViewModelBase.ts" />
/// <reference path='../../../../typings/knockout/knockout.d.ts' />
/// <reference path='../../../../pnut/core/peanut.d.ts' />

namespace QnutDocuments {


    import IKeyValuePair = Peanut.IKeyValuePair;
    import IViewModel = Peanut.IViewModel;

    interface IDocumentRecord {
        id : any;
        title : string;
        filename : string;
        folder : string;
        abstract : string;
        protected : boolean;
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
        document: IDocumentRecord;
        fileNeeded: boolean;
    }

    interface IDocumentUpdateRequest {
        document: IDocumentRecord;
        fileDisposition: string;
    }

    export class documentObservable {
        public constructor(owner: Peanut.ViewModelBase,
                           properties: Peanut.IPropertyDefinition[],lookups : any[], selectText : string = 'Select') {
            this.translator = <Peanut.ITranslator>owner;
            this.propertiesController =  new Peanut.entityPropertiesController(properties,lookups,selectText,true);
        }
        translator : Peanut.ITranslator;
        id = 0;
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

        public clear = () => {
            this.id = 0;
            this.title('');
            this.filename('');
            this.folder('');
            this.abstract('');
            this.protected(false);
            this.publicationDate(Peanut.Helper.getTodayString('us'));
            this.propertiesController.clearValues();

            this.clearErrors();
        };

        public clearErrors = () => {
            this.hasErrors(false);
            this.titleError(false);
            this.publicationDateError(false);
            this.abstractError(false);
        };

        public assign = (document : IDocumentRecord) => {
            this.clearErrors();
            this.id = document.id;
            this.title(document.title || '');
            this.filename(document.filename || '');
            this.folder(document.folder || '');
            this.abstract(document.abstract || '');
            this.protected(document.protected);
            this.publicationDate(document.publicationDate);



            this.propertiesController.setValues(document.properties);
            this.propertiesController.setValue('committee',47);
        };

        public validate = () => {
            let valid = true;
            this.clearErrors();
            let document = <IDocumentRecord>{
                id: this.id,
                title: this.title(),
                filename: this.filename(),
                folder: this.folder(),
                abstract: this.abstract(),
                protected: this.protected(),
                publicationDate: this.publicationDate(),
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
        documentId = ko.observable<any>(0);
        documentForm : documentObservable;
        downloadHref = ko.observable('');
        viewPdfHref = ko.observable('');
        currentFileName = ko.observable('');
        replaceFile = ko.observable(false);

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
                        me.addTranslations(response.translations);
                        let defaultLookupCaption = me.translate('document-search-dropdown-caption','(any)');
                        me.documentForm = new documentObservable(me,response.properties,
                            response.propertyLookups,defaultLookupCaption);
                        me.defaultLookupCaption(defaultLookupCaption);
                        if (documentId === 'new' || (!documentId)) {
                            me.newDocument();
                        }
                        else if (response.document) {
                            let href = response.documentsUri + response.document.id;
                            let filename = response.document.filename || '';
                            let p = filename.lastIndexOf('.');
                            let ext = p >= 0 ? filename.substring(p+1, filename.length) : '';
                            me.viewPdfHref(ext == 'pdf' ? href : '');
                            me.downloadHref(href + '/download');
                            me.loadDocument(response.document,
                                // response.fileNeeded &&
                                response.canEdit ? 'upload' : 'none');
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

        loadDocument = (document: IDocumentRecord,fileDisposition: string) => {
            let me = this;

            me.documentId(document.id);
            me.fileDisposition(fileDisposition);
            me.currentFileName(document.filename);
            // me.currentFileName('');
            me.replaceFile(false);
            me.documentForm.assign(document);
            me.tab('view');
        };

        editDocument = () => {
            if (this.canEdit()) {
                this.tab('edit');
            }
            else {
                // todo: handle access error
            }
        };

        newDocument = () => {
            let me = this;
            if (me.canEdit()) {
                me.documentId(0);
                me.documentForm.clear();
                $("#fileButton").val("");
                me.tab('edit');
                me.fileDisposition('upload');
            }
            else {
                // todo: handle access error
            }
        };

        getFilesForUpload() {
            let disposition = this.fileDisposition();
            let files = null;
            if (disposition === 'upload' || disposition == 'assign') {
                let files = Peanut.Helper.getSelectedFiles('#documentFile');
                if (!files) {
                    // todo: no files warning
                    return false;
                }
            }
            return files;
        }

        validateForm = (files) => {
            let valid = true;

            let request = <IDocumentUpdateRequest>{
                document: null,
                fileDisposition: this.fileDisposition()
            };

            if (request.fileDisposition !== 'none' && (!files)) {
                // todo: display error
                valid = false;
            }

            request.document = this.documentForm.validate();

            return valid ? request : false;

        };
        updateDocument = () => {
            let me = this;
            let files = me.getFilesForUpload();
            let request = me.validateForm(files);
            if (request === false) {
                return;
            }
            me.showActionWaiter( request.document.id ? 'new' : 'update','document');
            me.services.postForm( 'peanut.qnut-documents::UpdateDocument', request, files, null,
                function (serviceResponse: Peanut.IServiceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                            // todo: handle sucessful post if needed
                        }
                        else {
                        }
                    }
                    }).fail(() => {
                        let trace = me.services.getErrorInformation();
                    }).always(() => {
                        me.application.hideWaiter();
                    });
        }
    }
}