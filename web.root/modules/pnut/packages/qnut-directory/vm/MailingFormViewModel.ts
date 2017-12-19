/// <reference path="../../../../pnut/core/ViewModelBase.ts" />
/// <reference path='../../../../typings/knockout/knockout.d.ts' />
/// <reference path='../../../../typings/tinymce/tinymce.d.ts' />
/// <reference path='../../../../pnut/core/peanut.d.ts' />
/// <reference path='../../../../pnut/js/ViewModelHelpers.ts' />
/// <reference path='../../mailboxes/vm/mailboxes.d.ts' />
/// <reference path='../../../../typings/lodash/filter/index.d.ts' />


namespace QnutDirectory {

    import ILookupItem = Peanut.ILookupItem;
    import INameValuePair = Peanut.INameValuePair;
    import IMailboxFormOwner = Mailboxes.IMailboxFormOwner;
    import IMailBox = Mailboxes.IMailBox;

    interface IGetMailingListsResponse {
        emailLists : IEmailListItem[];
        translations : string[];
        templates : string[];
    }

    interface IEMailListSendRequest {
        listId: any;
        subject: string;
        template: string;
        messageText: string;
        contentType: string;
    }

    interface IEmailListMessgeUpdate {
        messageId: any;
        subject: string;
        template: string;
        messageText: string;
    }

    interface IMessageHistoryItem {
        messageId: any;
        timeSent: string;
        listName: string;
        recipientCount: number;
        sentCount: number;
        sender: string;
        subject: string;
        active: boolean;
    }

    interface IGetMessageHistoryResponse {
        status: string;
        pausedUntil: string;
        items: IMessageHistoryItem[];
    }

    interface IEmailListItem extends ILookupItem {
        mailBox: string;
        mailboxName: string;
        active: number;
    }

    export class MailingFormViewModel extends Peanut.ViewModelBase implements IMailboxFormOwner{
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
        mailboxes : Mailboxes.MailboxListObservable;

        mailingListLookup = ko.observableArray<ILookupItem>([]);
        mailingLists = ko.observableArray<IEmailListItem>([]);
        mailboxList : KnockoutObservableArray<IMailBox> = ko.observableArray([]);
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
        editorView = ko.observable('html');
        tab=ko.observable('message');
        queueStatus=ko.observable('active');
        messageHistory = ko.observableArray<IMessageHistoryItem>([]);
        pausedUntil = ko.observable('');
        
        messageEditForm = {
            messageId: 0,
            subject: ko.observable(''),
            template: ko.observable(''),
            messageText: ko.observable(''),
            selectedTemplate: ko.observable(),
            bodyError: ko.observable(''),
            subjectError: ko.observable('')
        };

        listEditForm = {
            listId: 0,
            mailboxCode: '',
            selectedMailbox: ko.observable<IMailBox>(null),
            active: ko.observable(true),
            code: ko.observable(''),
            name: ko.observable(''),
            description: ko.observable(''),
            codeError: ko.observable(''),
            nameError: ko.observable('')
        };




        previousMessage = {'listId' : -1, 'messageText' : ''};
        currentModal = '';

        init(successFunction?: () => void) {
            let me = this;
            console.log('MailingForm Init');
            me.showLoadWaiter();
            me.application.loadResources([
                '@lib:tinymce',
                '@lib:lodash',
                '@pnut/ViewModelHelpers.js'
                ,'@pkg/mailboxes/MailboxListObservable.js'
            ], () => {
                me.mailboxes = new Mailboxes.MailboxListObservable(me);
                tinymce.init({
                    selector: '#messagehtml',
                    toolbar: "undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link | image",
                    plugins: "image imagetools link",
                    default_link_target: "_blank",
                    branding: false

                });

                me.application.registerComponents(['@pnut/modal-confirm', '@pkg/mailboxes/mailbox-manager'], () => {
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
                            let lookup = _.filter(response.emailLists, (item: IEmailListItem) => {
                               return (item.active == 1);
                            });
                            me.mailingListLookup(lookup);
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
                messageText: me.messageBody(),
                template: template ? template : '',
                contentType: me.selectedMessageFormat().Value,
            };

            let valid = true;

            if (message.subject.trim() == '') {
                me.subjectError(': '+me.translate('form-error-email-subject-blank')); //A subject is required
                valid = false;
            }

            if (message.messageText.trim() == '') {
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
                if (me.sendRequest.listId) {
                    let modalId = (
                        me.previousMessage.listId == me.sendRequest.listId &&
                        me.previousMessage.messageText == me.sendRequest.messageText
                    ) ? 'resend' : 'send';
                    me.showConfirmation(modalId);
                }
                else {
                    me.doSend();
                }
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
                            if (me.sendRequest.listId) {
                                me.previousMessage = me.sendRequest;
                            }
                        }
                    }
                }
            ).fail(function () {
                let trace = me.services.getErrorInformation();
            }).always(function () {
                me.application.hideWaiter();
            });
        };

        showMessageTab = () => {
            this.tab('message');
        };

        getFakeResponse($status) {
            let fakelist : IMessageHistoryItem[] = [
                {
                    active: true,
                    listName: 'Friendsly notes',
                    messageId: 1,
                    recipientCount: 215,
                    sentCount: 50,
                    sender: 'James fuller',
                    timeSent: '2017-12-20 14:13:19',
                    subject: 'Friendly Notes December 2017',
                },
                {
                    active: false,
                    listName: 'Weekly Bulletin',
                    messageId: 1,
                    recipientCount: 287,
                    sentCount: 100,
                    sender: 'Terry SoRelle',
                    timeSent: '2017-12-28 10:23:07',
                    subject: 'Weekly Bulletin Jan 1, 2017'
                }
            ];

            let response : IGetMessageHistoryResponse = {
                items: fakelist,
                status: $status,
                pausedUntil: '12:13 pm'
            };
            return response;
        }

        refreshQueue = () => {
            let me = this;

            me.showQueueTab(me.getFakeResponse('active'));
        };

        pauseQueue = () => {
            let me = this;
            me.showQueueTab(me.getFakeResponse('paused'));
        };

        restartQueue = () => {
            let me = this;
            me.showQueueTab(me.getFakeResponse('active'));
        };

        removeQueuedMessage = (item: IMessageHistoryItem) => {
            let me = this;
            alert('removeQueuedMessage');
        };

        editQueuedMessage = (item: IMessageHistoryItem) => {
            let me = this;
            me.messageEditForm.messageId = item.messageId;
            me.messageEditForm.subject(item.subject);
            me.messageEditForm.messageText('Edit message text here.');
            me.messageEditForm.selectedTemplate(null);
            jQuery('#edit-message-modal').modal('show');

        };
        
        updateQueuedMessage = () => {
            let me = this;
            jQuery('#edit-message-modal').modal('hide');
            let request = <IEmailListMessgeUpdate> {
                messageId: me.messageEditForm.messageId,
                subject: me.messageEditForm.subject(),
                template: me.messageEditForm.selectedTemplate(),
                messageText: me.messageEditForm.messageText()
            };

            let response = me.getFakeResponse(me.queueStatus());
            me.application.showMessage("Update message");
            //me.showQueueTab(response);
        };

        showQueueTab = (response: IGetMessageHistoryResponse) => {
            let me = this;
            me.queueStatus(response.status);
            me.messageHistory(response.items);
            me.pausedUntil(response.pausedUntil);
            me.tab('queue');
        };

        showLists = () => {
            let me = this;
            me.tab('lists');
        };

        editEmailList = (item: IEmailListItem) => {
            let me = this;
            me.showEmailListForm(item);
        };

        newEmailList = () => {
            let me = this;
            let item = <IEmailListItem> {
                id: 0,
                name: '',
                code: '',
                active: 1,
                description: '',
                mailBox: '',
                mailboxName: ''
            };
            me.showEmailListForm(item);
        };

        updateEmailList = () => {
            let me = this;
            jQuery('#edit-list-modal').modal('hide');
        };

        showEmailListForm = (item: IEmailListItem) => {
            let me = this;
            me.listEditForm.description(item.description);
            me.listEditForm.code(item.code);
            me.listEditForm.name(item.name);
            me.listEditForm.listId = item.id;
            me.listEditForm.active(item.active == 1);
            me.listEditForm.mailboxCode = item.mailBox;
            if (me.mailboxList().length == 0) {
                me.mailboxes.subscribe(me.onMailboxListChanged)
            }
            me.mailboxes.getMailboxList(() => {
                jQuery('#edit-list-modal').modal('show');
            });
        };

        onMailboxListChanged = (mailboxes: IMailBox[]) => {
            let me = this;
            let filtered = _.filter(mailboxes,(box: IMailBox) => {
                return box.active == 1;
            });
            me.mailboxList(filtered);
            if (me.listEditForm.mailboxCode) {
                let mailboxItem = _.find(me.mailboxList(), (mailbox:IMailBox) => {
                    return mailbox.mailboxcode == me.listEditForm.mailboxCode;
                });
                me.listEditForm.selectedMailbox(mailboxItem);
            }
            else {
                me.listEditForm.selectedMailbox(null);
            }
        };

        showMailboxes = () => {
            let me = this;
            me.mailboxes.getMailboxList(() => {
                me.tab('mailboxes');
            });
        }

    }
}

