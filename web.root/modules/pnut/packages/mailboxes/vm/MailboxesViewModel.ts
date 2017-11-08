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
        mailboxPublic = ko.observable(true);

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
                '@lib:lodash',
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
            me.showActionWaiterBanner('load','mailbox-entity-plural');
            me.application.showWaiter(me.translate('mailbox-wait-load') + '...');
            me.services.executeService('peanut.Mailboxes::GetMailboxList',request,
                function(serviceResponse: Peanut.IServiceResponse) {
                    me.application.hideWaiter();
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        let response = <IGetMailboxesResponse>serviceResponse.Value;
                        me.showList(response.list);
                        me.addTranslations(response.translations);
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
            me.showActionWaiter(me.editMode(),'mailbox-entity');
            me.services.executeService('peanut.Mailboxes::UpdateMailbox',box,
                function(serviceResponse: Peanut.IServiceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        me.showList(<IMailBox[]>serviceResponse.Value);
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
            me.showActionWaiter('delete','mailbox-entity');
            me.services.executeService('peanut.Mailboxes::DeleteMailbox',box.mailboxcode,
                function(serviceResponse: Peanut.IServiceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        me.showList(<IMailBox[]>serviceResponse.Value);
                    }
                }
            ).fail(function () {
                let trace = me.services.getErrorInformation();
            }).always(function() {
                me.application.hideWaiter();
            })
        };

        showList = (list: IMailBox[]) => {
            let me = this;
            let test = me.mailboxList();
            me.hideForm();
            list = _.sortBy(list,function(box) {return box.displaytext.toLowerCase()});
            me.mailboxList(list);
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

    export interface IGetMailboxesResponse {
        list: IMailBox[];
        translations: string[];
    }
}
