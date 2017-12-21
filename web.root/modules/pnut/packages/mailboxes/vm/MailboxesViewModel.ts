/// <reference path="../../../../pnut/core/ViewModelBase.ts" />
/// <reference path='../../../../pnut/js/ViewModelHelpers.ts' />
/// <reference path='../../../../typings/knockout/knockout.d.ts' />
/// <reference path='../../../../pnut/core/peanut.d.ts' />
/// <reference path='mailboxes.d.ts' />
/// <reference path='../../../../typings/lodash/sortBy/index.d.ts' />
namespace Mailboxes {

    export class MailboxesViewModel extends Peanut.ViewModelBase {
        mailboxes: Mailboxes.MailboxListObservable;

        init(successFunction?: () => void) {
            let me = this;
            console.log('Mailboxes form Init');
            me.application.loadResources([
                '@lib:fontawesome',
                '@lib:lodash',
                '@pnut/ViewModelHelpers.js'
                , '@pkg/mailboxes/MailboxListObservable.js'
            ], () => {
                me.mailboxes = new Mailboxes.MailboxListObservable(me);
                me.application.registerComponents(['@pnut/modal-confirm', '@pkg/mailboxes/mailbox-manager'], () => {
                    me.mailboxes.getMailboxListWithTranslations(() => {
                        // me.application.hideWaiter();
                        me.bindDefaultSection();
                        successFunction();
                    });
                });
            });
        }
    }
}
