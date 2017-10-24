/// <reference path="../../../../pnut/core/ViewModelBase.ts" />
/// <reference path='../../../../typings/knockout/knockout.d.ts' />
/// <reference path='../../../../pnut/core/peanut.d.ts' />
/// <reference path='../../../../pnut/components/ViewModelHelpers.ts' />
/// <reference path='mailboxes.d.ts' />


namespace Mailboxes {

    export class ContactFormViewModel extends Peanut.ViewModelBase {
        // observables
        headerMessage = ko.observable('Send a Message');
        fromAddress = ko.observable('');
        fromName = ko.observable('');
        messageSubject = ko.observable('');
        messageBody = ko.observable('');
        formVisible = ko.observable(false);
        mailboxList = ko.observableArray<IMailBox>([]);
        selectedMailbox = ko.observable<IMailBox>(null);
        subjectError = ko.observable('');
        bodyError = ko.observable('');
        fromNameError = ko.observable('');
        fromAddressError = ko.observable('');
        mailboxSelectError = ko.observable('');

        userIsAnonymous = ko.observable(false);

        mailboxCode: string;


        init(successFunction?: () => void) {
            let me = this;
            console.log('ContactForm Init');
            me.mailboxCode = me.getRequestVar('box', 'all');
            me.application.loadResources([
                // '@lib:lodash',
                '@pnut/ViewModelHelpers.js'
            ], () => {
                me.getMailbox(() => {
                    me.bindDefaultSection();
                    successFunction();
                });
            });
        }

        getMailbox = (doneFunction?: () => void) => {
            let me = this;

            me.application.hideServiceMessages();
            me.application.showWaiter('Loading mailbox. Please wait...');

            me.services.executeService('peanut.Mailboxes::GetContactForm', me.mailboxCode,
                function (serviceResponse: Peanut.IServiceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                            let response = <IGetContactFormResponse>serviceResponse.Value;
                            me.fromAddress(response.fromAddress);
                            me.fromName(response.fromName);
                            me.userIsAnonymous(response.fromAddress.trim() == '');
                            if (me.mailboxCode == 'all') {
                                me.selectedMailbox(null);
                                me.selectedMailbox.subscribe(me.onMailBoxSelected);
                                me.mailboxList(response.mailboxList);
                                me.headerMessage('Send a message: (please select recipient)');
                            }
                            else {
                                me.headerMessage("Send a message to: " + response.mailboxName);
                            }
                            me.formVisible(true);
                        }
                        else {
                            me.formVisible(false);
                            // me.headerMessage('No mailbox found for ' + me.mailboxCode);
                        }
                    }
                }).fail(() => {
                    let trace = me.services.getErrorInformation();
                }).always(() => {
                    me.application.hideWaiter();
                    if (doneFunction) {
                        doneFunction();
                        // jQuery("#main-form").show();
                    }
                });
        };


        createMessage = () => {
            let me = this;

            me.mailboxSelectError('');
            me.subjectError('');
            me.bodyError('');
            me.fromAddressError('');
            me.fromNameError('');

            let code = me.mailboxCode;
            if (code == 'all') {
                let box = me.selectedMailbox();
                if (!box) {
                    me.mailboxSelectError(': Please select a recipient');
                    return false;
                }
                code = box.mailboxcode;
            }

            let message = <IMailMessage> {
                toName: '',
                mailboxCode: code,
                fromName: me.fromName(),
                fromAddress: me.fromAddress(),
                subject: me.messageSubject(),
                body: me.messageBody()
            };

            let valid = true;

            if (message.fromAddress.trim() == '') {
                me.fromAddressError(': please enter your e-mail address');
                valid = false;
            }
            else {
                let fromAddressOk = Peanut.Helper.ValidateEmail(message.fromAddress);
                if (!fromAddressOk) {
                    me.fromAddressError(': This e-mail address is not valid.');
                    valid = false;
                }
            }

            if (message.fromName.trim() == '') {
                me.fromNameError(': Please enter your name.')
            }

            if (message.subject.trim() == '') {
                me.subjectError(': A subject is required');
                valid = false;
            }

            if (message.body.trim() == '') {
                me.bodyError(': Message text is required.');
                valid = false;
            }
            if (valid) {
                return message;
            }
            return null;
        };

        sendMessage = () => {
            let me = this;
            let message = me.createMessage();
            if (message) {
                me.application.hideServiceMessages();
                me.application.showWaiter('Sending message...');
                me.services.executeService('peanut.Mailboxes::SendContactMessage', message,
                    function (serviceResponse: Peanut.IServiceResponse) {
                        if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                            me.formVisible(false);
                            me.headerMessage('Thanks for your message.')
                        }
                    }
                ).fail(function () {
                    let trace = me.services.getErrorInformation();
                }).always(function () {
                    me.application.hideWaiter();
                });
            }
        };

        onMailBoxSelected = (selected: IMailBox) => {
            let me = this;
            let title = 'Send a Message';
            if (selected) {
                me.headerMessage('Send a message to: ' + selected.displaytext);
            }
            else {
                me.headerMessage('Send a message: (please select recipient)');
            }
        }
    }
}

