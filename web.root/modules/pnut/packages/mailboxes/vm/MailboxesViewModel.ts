/// <reference path="../../../../pnut/core/ViewModelBase.ts" />
/// <reference path='../../../../pnut/components/ViewModelHelpers.ts' />
/// <reference path='../../../../typings/knockout/knockout.d.ts' />
/// <reference path='../../../../pnut/core/peanut.d.ts' />
/// <reference path='mailboxes.d.ts' />
/// <reference path='../../../../typings/lodash/sortBy/index.d.ts' />


namespace Mailboxes {

    export class MailboxesViewModel extends Peanut.ViewModelBase {
        // observables
        private editModal : any;

        private insertId: number = 0;

        private tempMailbox : IMailBox;

        mailboxList : KnockoutObservableArray<IMailBox> = ko.observableArray([]);
        // updatedMailboxList : KnockoutObservableArray<mailBox> = ko.observableArray([]);
        mailboxId = ko.observable('');
        mailboxCode = ko.observable('');
        mailboxName = ko.observable('');
        mailboxDescription = ko.observable('');
        mailboxEmail = ko.observable('');
        mailboxState = ko.observable(0);

        formHeading = ko.observable('');
        editMode  = ko.observable('');

        mailboxDescriptionHasError = ko.observable(false);
        mailboxEmailHasError = ko.observable(false);
        mailboxNameHasError = ko.observable(false);
        mailboxCodeHasError = ko.observable(false);

        init(successFunction?: () => void) {
            let me = this;
            console.log('Mailboxes Init');
            me.application.loadResources([
                'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js',
                '@pnut/ViewModelHelpers.js'
            ], () => {
                me.getMailboxList(() => {
                    me.bindDefaultSection();
                    successFunction();
                });
            });
        }

        getMailboxList(doneFunction?: () => void) {
            let me = this;
            let request = null;
            me.application.hideServiceMessages();
            me.application.showWaiter('Loading mailbox list...');
            me.services.executeService('peanut.Mailboxes::GetMailboxList',request,
                function(serviceResponse: Peanut.IServiceResponse) {
                    me.application.hideWaiter();
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        let list = <IMailBox[]>serviceResponse.Value;
                        me.mailboxList(_.sortBy(list,function(box) {
                            return box.displaytext.toLowerCase()
                        }));
                    }
                }
            ).fail(function () {
                me.application.hideWaiter();
                let trace = me.services.getErrorInformation();
            }).always(function() {
                if (doneFunction) {
                    doneFunction();
                }
            });
        }

        submitChanges = (box: IMailBox) => {
            let me = this;
            me.hideForm();
            me.application.hideServiceMessages();
            me.application.showWaiter('Updating mailboxes. Please wait...');
            me.services.executeService('peanut.Mailboxes::UpdateMailbox',box,
                function(serviceResponse: Peanut.IServiceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        me.hideForm();
                        let list = <IMailBox[]>serviceResponse.Value;
                        me.mailboxList(_.sortBy(list,function(box) {return box.displaytext.toLowerCase()}));
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
            me.mailboxDescription(box.description);
            me.formHeading("Edit mailbox: " + box.mailboxcode);
            me.mailboxState(2);
            me.showForm();
        };

        getMailbox() {
            // GetMailbox
        }

        newMailbox = () => {
            let me = this;
            me.clearValidation();
            me.editMode('add');
            me.mailboxId('0');
            me.mailboxCode('');
            me.mailboxName('');
            me.mailboxEmail('');
            me.mailboxDescription('');
            me.formHeading('New mailbox');
            me.mailboxState(1);
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
                'state' : me.mailboxState(),
                'description' : me.mailboxDescription()
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
            box.state = 3;
            me.tempMailbox = box;
            me.mailboxCode(box.mailboxcode);
            me.showConfirmForm();
        };

        removeMailbox() {
            let me = this;
            me.hideConfirmForm();
            me.submitChanges(me.tempMailbox);
        }
    }
}
