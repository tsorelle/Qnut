/// <reference path="../../../../pnut/core/ViewModelBase.ts" />
/// <reference path='../../../../typings/knockout/knockout.d.ts' />
/// <reference path='../../../../typings/tinymce/tinymce.d.ts' />
/// <reference path='../../../../pnut/core/peanut.d.ts' />
/// <reference path='../../../../pnut/js/ViewModelHelpers.ts' />


namespace QnutDirectory {

    import ILookupItem = Peanut.ILookupItem;
    import INameValuePair = Peanut.INameValuePair;

    interface IGetMailingListsResponse {
        emailLists : Peanut.ILookupItem[];
        translations : string[];
        templates : string[];
    }

    interface IEMailListSendRequest {
        listId: any;
        subject: string;
        body: string;
        template?: string;
    }

    export class MailingFormViewModel extends Peanut.ViewModelBase {
        sendRequest : IEMailListSendRequest = null;

        // observables
        messageSubject = ko.observable('');
        messageBody = ko.observable('');
        formVisible = ko.observable(false);
        bodyError = ko.observable('');
        subjectError = ko.observable('');
        mailingListSelectError = ko.observable('');
        confirmCaption = ko.observable('');
        confirmSendMessage = ko.observable('');
        confirmResendMessage = ko.observable('');

        mailingLists = ko.observableArray<ILookupItem>([]);
        selectedMailingList = ko.observable<ILookupItem>(null);
        selectMailingListCaption = ko.observable('Select a mailing list');
        templateSelectCaption = ko.observable('No template');
        messasageFormats = ko.observableArray<INameValuePair> (
            [
                {Name: 'Html', Value: 'html'},
                {Name: 'Plain text',Value:'text'}
            ]);

        selectedMessageFormat = ko.observable(this.messasageFormats()[0]);
        templateList : string[] = [];
        messageTemplates = ko.observableArray<string>([]);
        selectedMessageTemplate = ko.observable();
        headerMessage = ko.observable('');
        editorView = ko.observable('html');

        previousMessage = {'listId' : -1, 'body' : ''};
        currentModal = '';

        init(successFunction?: () => void) {
            let me = this;
            console.log('MailingForm Init');
            me.showLoadWaiter();
            me.application.loadResources([
                '@lib:tinymce'
            ], () => {
                tinymce.init({
                    selector: '#messagehtml',
                    toolbar: "undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link | image",
                    plugins: "image imagetools link",
                    default_link_target: "_blank"

                });

                me.application.registerComponents('@pnut/modal-confirm', () => {
                        me.getMailingLists(() => {
                            me.application.hideWaiter();
                            me.bindDefaultSection();
                            successFunction();
                        });

                    });
            });
        }

        showConfirmation = (modalId) => {
            let me = this;
            me.currentModal = '#confirm-'+modalId+'-modal';
            jQuery(me.currentModal).modal('show');

        };

        hideConfirmation = () => {
            let me = this;
            jQuery(this.currentModal).modal('hide');
            me.currentModal = '';
        };

        getMailingLists = (doneFunction?: () => void) => {
            let me = this;
            let request = null;

            me.application.hideServiceMessages();


            me.services.executeService('peanut.qnut-directory::GetMailingLists', request,
                function (serviceResponse: Peanut.IServiceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                            let response = <IGetMailingListsResponse>serviceResponse.Value;
                            me.addTranslations(response.translations);
                            me.selectMailingListCaption(me.translate('mailing-test-template'));
                            me.templateSelectCaption(me.translate('mailing-no-template'));
                            me.confirmCaption(me.translate('confirm-caption'));
                            me.confirmResendMessage(me.translate('mailing-confirm-resend'));
                            me.confirmSendMessage(me.translate('mailing-confirm-send'));
                            me.mailingLists(response.emailLists);
                            me.formVisible(true);
                            me.templateList = response.templates;
                            me.messageTemplates(me.templateList['html']);
                            me.selectedMessageFormat.subscribe(me.onFormatChange);
                        }
                        else {
                            me.formVisible(false);
                        }
                    }
                }).fail(() => {
                let trace = me.services.getErrorInformation();
            }).always(() => {
                if (doneFunction) {
                    doneFunction();
                }
            });
        };

        onFormatChange = (format: INameValuePair) => {
            let me=this;
            me.messageTemplates(me.templateList[<string>format.Value]);
            if (format.Value == 'text' && me.editorView() == 'html') {
                me.showPlainText();
            }
        };


        showEditor = () => {
            let me = this;
            tinymce.get('messagehtml').setContent(me.messageBody());
            me.selectedMessageFormat(me.messasageFormats()[0]);
            me.editorView('html');
        };

        showPlainText = () => {
            let me = this;
            tinymce.triggerSave();
            me.messageBody(jQuery('#messagehtml').val());
            me.editorView('text');
        };

        createMessage = () => {
            let me = this;

            me.subjectError('');
            me.bodyError();

            if (me.editorView() == 'html') {
                tinymce.triggerSave();
                me.messageBody(jQuery('#messagehtml').val())
            }

            let list = me.selectedMailingList();
            let template = me.selectedMessageTemplate();

            let message = <IEMailListSendRequest> {
                listId: list ? list.id : 0,
                subject: me.messageSubject(),
                body: me.messageBody(),
                template: template ? template : ''
            };

            let valid = true;

            if (message.subject.trim() == '') {
                me.subjectError(': '+me.translate('form-error-email-subject-blank')); //A subject is required
                valid = false;
            }

            if (message.body.trim() == '') {
                me.bodyError(': '+me.translate('form-error-email-message-blank')); // Message text is required.);
                valid = false;
            }
            if (valid) {
                return message;
            }
            return null;
        };

        sendMessage = () => {
            let me = this;
            me.sendRequest = me.createMessage();
            if (me.sendRequest) {
                let modalId = (
                    me.previousMessage.listId == me.sendRequest.listId &&
                        me.previousMessage.body == me.sendRequest.body
                ) ? 'resend' : 'send';
                me.showConfirmation(modalId);
            }
        };

        doSend = () => {
            let me = this;
            me.hideConfirmation();
            // alert('sending');

            me.application.hideServiceMessages();
            me.application.showWaiter(me.translate('wait-sending-message')); //'Sending message...');

            me.services.executeService('peanut.qnut-directory::SendMailingListMessage', me.sendRequest
                ,function (serviceResponse: Peanut.IServiceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                            me.previousMessage = me.sendRequest;
                        }
                    }
                }
            ).fail(function () {
                let trace = me.services.getErrorInformation();
            }).always(function () {
                me.application.hideWaiter();
            });
        };

        onMailingListSelected = (selected: ILookupItem) => {
            let me = this;
            // todo: replace translations
            let title = 'Send a Message';
            if (selected) {
                me.headerMessage(me.translate('mail-header-send') + ':  ' + selected.name); // Send a message to
            }
            else {
                me.headerMessage(me.translate('mail-header-select')); //'Send a message: (please select recipient)');
            }
        }


    }
}

