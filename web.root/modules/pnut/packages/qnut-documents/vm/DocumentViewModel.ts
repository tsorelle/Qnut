/// <reference path="../../../../pnut/core/ViewModelBase.ts" />
/// <reference path='../../../../typings/knockout/knockout.d.ts' />
/// <reference path='../../../../pnut/core/peanut.d.ts' />

namespace QnutDocuments {

    export class DocumentViewModel extends Peanut.ViewModelBase {
        // observables
        test = ko.observable('DocumentViewModel loaded');

        init(successFunction?: () => void) {
            let me = this;
            console.log('Document vm Init');
            // todo: init document view model
            me.bindDefaultSection();
            successFunction();
        }
    }
}