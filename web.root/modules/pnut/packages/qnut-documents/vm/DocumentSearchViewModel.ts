/// <reference path="../../../../pnut/core/ViewModelBase.ts" />
/// <reference path='../../../../typings/knockout/knockout.d.ts' />
/// <reference path='../../../../pnut/core/peanut.d.ts' />

namespace QnutDocuments {

    interface IDocumentSearchInitResponse {
        properties : Peanut.IEntityPropertyDefinition[];
        propertyLookups: Peanut.ILookupItem[];
        documentStatusTypes: Peanut.ILookupItem[];
        documentTypes: Peanut.ILookupItem[];
        translations : any[];
    }

    export class DocumentSearchViewModel extends Peanut.ViewModelBase {
        // observables
        test = ko.observable('DocumentSearchViewModel loaded');

        init(successFunction?: () => void) {
            let me = this;
            console.log('DocumentSearch Init');
            // todo: init Document search

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
                me.getInitializations(() => {
                    me.bindDefaultSection();
                    successFunction();
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
                        // todo: assign initialization data
                        me.addTranslations(response.translations);
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
    }
}