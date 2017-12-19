/**
 * Requirements of parent view model:
 *    Must implement IMailboxFormOwner
 *    application.loadResources must include:
 *       '@lib:lodash',
 *       '@pnut/ViewModelHelpers.js'
 *
 */
/// <reference path="../../../../pnut/core/ViewModelBase.ts" />
/// <reference path='../../../../pnut/js/ViewModelHelpers.ts' />
/// <reference path='../../../../typings/knockout/knockout.d.ts' />
/// <reference path='../../../../pnut/core/peanut.d.ts' />
/// <reference path='../vm/mailboxes.d.ts' />
/// <reference path='../../../../typings/lodash/sortBy/index.d.ts' />


namespace Mailboxes {
    import ViewModelBase = Peanut.ViewModelBase;
    import IPeanutClient = Peanut.IPeanutClient;
    import ServiceBroker = Peanut.ServiceBroker;
    export class mailboxManagerComponent {
        // private ownerVm: ViewModelBase;
        private mailboxes :  MailboxListObservable;
        private application: IPeanutClient;
        private services: ServiceBroker;

        test = ko.observable('test');

        owner : () => ViewModelBase;

        // include constructor if any params used
        constructor(params: any) {
            let me = this;

            if (!params) {
                throw('Params not defined in modalConfirmComponent');
            }
            if (!params.owner) {
                throw('Owner parameter required for modalConfirmComponent');
            }
            me.owner = params.owner;
            me.test('hello');
            let ownerVm = params.owner();
            me.application = ownerVm.getApplication();
            me.services = ownerVm.getServices();
            me.mailboxes = (<any>ownerVm).mailboxes;
            me.mailboxes.subscribe(this.onListChanged)
        }

        onListChanged = (mailboxes: IMailBox[]) => {
            // alert('mailbox list changed')
        };
    }
}