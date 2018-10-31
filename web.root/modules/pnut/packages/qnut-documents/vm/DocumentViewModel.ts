/// <reference path="../../../../pnut/core/ViewModelBase.ts" />
/// <reference path='../../../../typings/knockout/knockout.d.ts' />
/// <reference path='../../../../pnut/core/peanut.d.ts' />

namespace QnutDocuments {


    interface IDocumentUpdateRequest {
        documentId: any;
        protected: boolean;
        folder: string;
        fileName: string;


    }
    export class DocumentViewModel extends Peanut.ViewModelBase {
        // observables
        test = ko.observable('DocumentViewModel loaded');

        init(successFunction?: () => void) {
            let me = this;
            console.log('Document vm Init');
            // todo: init document view model
            me.showLoadWaiter();
            me.application.loadResources([
                '@pnut/ViewModelHelpers.js'
            ], () => {
                me.application.hideWaiter();
                me.bindDefaultSection();
                successFunction();
            });
        }

        uploadFile = () => {
            let me = this;
            let files = Peanut.Helper.getSelectedFiles('#documentFile');
            if (files)
                console.log('Files selected '+files.length);
            else
                console.log('No files selected.');

            let request = {testValue: 99, folder: 'new/tests'};

            me.services.postForm( 'peanut.qnut-documents::UpdateDocument', request, files, null,
                function (serviceResponse: Peanut.IServiceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        }
                        else {
                        }
                    }
                    }).fail(() => {
                        let trace = me.services.getErrorInformation();
                    }).always(() => {
                    });


        }
    }
}