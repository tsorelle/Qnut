/// <reference path="../../../../pnut/core/ViewModelBase.ts" />
/// <reference path='../../../../typings/knockout/knockout.d.ts' />
/// <reference path='../../../../pnut/core/peanut.d.ts' />

namespace Mailboxes {

    export class MailboxesViewModel extends Peanut.ViewModelBase {
        // observables
        test = ko.observable('Hello world');

        init(successFunction?: () => void) {
            let me = this;
            console.log('Mailboxes Init');

            me.bindDefaultSection();
            successFunction();
        }
    }
}
