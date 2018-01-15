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
        bootstrapVersion : KnockoutObservable<number>;

        // include constructor if any params used
        constructor(params: any) {
            let me = this;

            if (!params) {
                console.error('maibox-manager: Params not defined in modalConfirmComponent');
                return;
            }
            if (!params.owner) {
                console.error('maibox-manager: Owner parameter required for modalConfirmComponent');
                return;
            }
            me.owner = params.owner;
            me.test('hello');
            let ownerVm = params.owner();
            me.application = ownerVm.getApplication();
            me.bootstrapVersion = ownerVm.bootstrapVersion;
            me.services = ownerVm.getServices();
            me.mailboxes = (<any>ownerVm).mailboxes;
            me.mailboxes.subscribe(this.onListChanged)
        }

        onListChanged = (mailboxes: IMailBox[]) => {
            // alert('mailbox list changed')
        };

        // observables
        private editModal : any;

        private insertId: number = 0;

        private tempMailbox : IMailBox;

        mailboxId = ko.observable('');
        mailboxCode = ko.observable('');
        mailboxName = ko.observable('');
        mailboxDescription = ko.observable('');
        mailboxEmail = ko.observable('');
        mailboxPublic = ko.observable(true);

        formHeading = ko.observable('');
        editMode  = ko.observable('');

        mailboxDescriptionHasError = ko.observable(false);
        mailboxEmailHasError = ko.observable(false);
        mailboxNameHasError = ko.observable(false);
        mailboxCodeHasError = ko.observable(false);

        submitChanges = (box: IMailBox) => {
            let me = this;
            me.hideForm();
            me.application.hideServiceMessages();
            me.owner().showActionWaiter(me.editMode(),'mailbox-entity');
            me.services.executeService('peanut.Mailboxes::UpdateMailbox',box,
                function(serviceResponse: Peanut.IServiceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        me.mailboxes.setMailboxes(<IMailBox[]>serviceResponse.Value);
                    }
                }
            ).fail(function () {
                let trace = me.services.getErrorInformation();
            }).always(function() {
                me.application.hideWaiter();
            })
        };

        dropMailbox = (box: IMailBox) => {
            let me = this;
            me.hideForm();
            me.application.hideServiceMessages();
            me.owner().showActionWaiter('delete','mailbox-entity');
            me.services.executeService('peanut.Mailboxes::DeleteMailbox',box.mailboxcode,
                function(serviceResponse: Peanut.IServiceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        me.mailboxes.setMailboxes(<IMailBox[]>serviceResponse.Value);
                    }
                }
            ).fail(function () {
                let trace = me.services.getErrorInformation();
            }).always(function() {
                me.application.hideWaiter();
            })
        };

        hideForm() {
            jQuery("#mailbox-update-modal").modal('hide');
        }

        showForm() {
            let me = this;
            me.clearValidation();
            jQuery("#mailbox-update-modal").modal('show');
        }

        hideConfirmForm() {
            jQuery("#confirm-delete-modal").modal('hide');
        }

        showConfirmForm() {
            let me = this;
            jQuery("#confirm-delete-modal").modal('show');
        }

        editMailbox = (box: IMailBox) => {
            let me = this;
            me.clearValidation();
            me.editMode('update');
            me.mailboxId(box.id);
            me.mailboxCode(box.mailboxcode);
            me.mailboxName(box.displaytext);
            me.mailboxEmail(box.address);
            me.mailboxPublic(box.public == '1');
            me.mailboxDescription(box.description);
            me.formHeading("Edit mailbox: " + box.mailboxcode);
            me.showForm();
        };

        newMailbox = () => {
            let me = this;
            me.clearValidation();
            me.editMode('add');
            me.mailboxId('0');
            me.mailboxCode('');
            me.mailboxName('');
            me.mailboxEmail('');
            me.mailboxDescription('');
            me.mailboxPublic(true);
            me.formHeading('New mailbox');
            me.showForm();
        };

        clearValidation = () =>  {
            let me = this;
            me.mailboxCodeHasError(false);
            me.mailboxDescriptionHasError(false);
            me.mailboxEmailHasError(false);
            me.mailboxDescriptionHasError(false);
            me.mailboxNameHasError(false);
        };

        createMailboxDto = () =>  {
            let me = this;
            let valid = true;
            let box = <IMailBox>{
                'id' : me.mailboxId(),
                'mailboxcode' : me.mailboxCode(),
                'displaytext' : me.mailboxName(),
                'address' : me.mailboxEmail(),
                'description' : me.mailboxDescription(),
                'public' : me.mailboxPublic()
            };

            if (box.mailboxcode == '') {
                me.mailboxCodeHasError(true);
                valid = false;
            }
            if (box.displaytext == '') {
                me.mailboxNameHasError(true);
                valid = false;
            }

            let emailOk = Peanut.Helper.ValidateEmail(box.address);
            me.mailboxEmailHasError(!emailOk);
            if (!emailOk) {
                valid = false;
                me.mailboxEmailHasError(true);
            }
            if (valid) {
                return box;
            }
            return null;
        };

        updateMailbox() {
            // UpdateMailbox
            let me = this;
            let box = me.createMailboxDto();
            if (box) {
                me.submitChanges(box);
            }
        }

        confirmRemoveMailbox = (box : IMailBox)=> {
            let me = this;
            me.tempMailbox = box;
            me.mailboxCode(box.mailboxcode);
            me.showConfirmForm();
        };

        removeMailbox() {
            let me = this;
            me.hideConfirmForm();
            me.dropMailbox(me.tempMailbox);
        }


    }
}