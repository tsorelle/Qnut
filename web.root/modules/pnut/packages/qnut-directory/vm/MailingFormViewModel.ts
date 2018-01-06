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
    }

    interface IGetMessageHistoryResponse {
        status: string;
        pausedUntil: string;
        items: IMessageHistoryItem[];
        maxPages: number;
    }

    interface IEmailListItem extends ILookupItem {
        mailBox: string;
        mailboxName?: string;
        active?: number;
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

        private queuePageSize = 10;

        currentQueuePage = ko.observable(1);
        maxQueuePages = ko.observable(1);
        refreshingQueue = ko.observable(false);

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
        messageRemoveText = ko.observable('');
        messageRemoveHeader = ko.observable('');
        messageRemoveId = 0;
        
        messageEditForm = {
            messageId: 0,
            subject: ko.observable(''),
            template: ko.observable(''),
            messageText: ko.observable(''),
            // selectedTemplate: ko.observable(),
            bodyError: ko.observable(''),
            subjectError: ko.observable('')
        };

        listEditForm = {
            listId: ko.observable(0),
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
            me.tab.subscribe(me.onTabChange);
            me.showLoadWaiter();
            me.application.loadResources([
                '@lib:tinymce',
                '@lib:lodash',
                '@pnut/ViewModelHelpers.js'
                ,'@pkg/mailboxes/MailboxListObservable.js'
            ], () => {
                me.initEditor('#messagehtml');
                // me.initEditor('#edit-messagetext');
                me.mailboxes = new Mailboxes.MailboxListObservable(me);
                me.application.registerComponents([
                    '@pnut/modal-confirm',
                    '@pkg/mailboxes/mailbox-manager',
                    '@pnut/pager'], () => {
                        me.getMailingLists(() => {
                            me.application.hideWaiter();
                            me.bindDefaultSection();
                            successFunction();
                        });

                    });
            });
        }

        initEditor = (selector: string) => {
            tinymce.init({
                selector: selector,
                toolbar: "undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link | image",
                plugins: "image imagetools link",
                default_link_target: "_blank",
                branding: false
            });

        };

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


            me.services.executeService('peanut.qnut-directory::messaging.GetMailingLists', request,
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
                            me.assignEmailLists(response.emailLists);
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

        assignEmailLists = (emailLists : IEmailListItem[]) => {
            let me = this;
            let lookup = _.filter(emailLists, (item: IEmailListItem) => {
                return (item.active == 1);
            });
            me.mailingListLookup(lookup);
            me.mailingLists(emailLists);
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
            me.showActionWaiterBanner('send','mailing-message-entity');
            // showWaiter(me.translate('wait-sending-message')); //'Sending message...');

            me.services.executeService('peanut.qnut-directory::messaging.SendMailingListMessage', me.sendRequest
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

        onQueuePaged = (moved: number) => {
            this.getMessageQueue(this.currentQueuePage() + moved);
        };

        refreshQueue = () => {
            let me = this;
            me.getMessageQueue(1);
        };

        getMessageQueue = (pageNumber) => {
            let me = this;
            me.refreshingQueue(true);
            if (pageNumber == 1) {
                me.application.showBannerWaiter('mailing-get-history');
            }
            let request = {pageSize: me.queuePageSize, pageNumber: pageNumber};
            me.services.executeService( 'peanut.qnut-directory::messaging.GetEmailListHistory',
                request,
                function (serviceResponse: Peanut.IServiceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                            let response = <IGetMessageHistoryResponse>serviceResponse.Value;
                            me.currentQueuePage(pageNumber);
                            me.maxQueuePages(response.maxPages);
                            me.showQueueTab(response);
                        }
                    }
                }).fail(() => {
                let trace = me.services.getErrorInformation();
            }).always(() => {
                if (pageNumber == 1) {
                    me.application.hideWaiter();
                }
                me.refreshingQueue(false);
            });
        };

        controlQueue = (action: string) => {
            let me = this;
            me.application.showBannerWaiter('mailing-get-history');
            me.services.executeService('peanut.qnut-directory::messaging.ControlMessageProcess', action,
                function (serviceResponse: Peanut.IServiceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                            let response = <IGetMessageHistoryResponse>serviceResponse.Value;
                            me.currentQueuePage(1);
                            me.showQueueTab(response);
                        }
                    }
                }).fail(() => {
                let trace = me.services.getErrorInformation();
            }).always(() => {
                me.application.hideWaiter();
            });
        };

        pauseQueue = () => {
            this.controlQueue('pause');
        };

        restartQueue = () => {
            this.controlQueue('start');
        };

        removeQueuedMessage = (item: IMessageHistoryItem) => {
            let me = this;
            me.messageRemoveText(
                me.translate('mailing-remove-queue').replace('%s',item.subject)
            );
            me.messageRemoveHeader(
                me.translate('mailing-remove-header')
            );
            me.messageRemoveId = item.messageId;
            jQuery("#confirm-remove-modal").modal('show');
        };

        doRemoveMessage = () => {
            let me = this;
            jQuery("#confirm-remove-modal").modal('hide');
            me.showActionWaiterBanner('remove','mailing-message-entity');
            // me.application.showBannerWaiter('wait-remove-message');
            me.services.executeService('peanut.qnut-directory::messaging.RemoveQueuedMessage', me.messageRemoveId,
                function (serviceResponse: Peanut.IServiceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                            let response = <IGetMessageHistoryResponse>serviceResponse.Value;
                            me.currentQueuePage(1);
                            me.showQueueTab(response);
                        }
                    }
                }).fail(() => {
                let trace = me.services.getErrorInformation();
            }).always(() => {
                me.application.hideWaiter();
            });

        };

        editQueuedMessage = (item: IMessageHistoryItem) => {
            let me = this;
            me.messageEditForm.messageId = item.messageId;
            me.messageEditForm.subject(item.subject);
            me.services.executeService('peanut.qnut-directory::messaging.GetQueuedMessageText', item.messageId,
                function (serviceResponse: Peanut.IServiceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                            let response = <string>serviceResponse.Value;
                            me.messageEditForm.messageText(response);
                            jQuery('#edit-message-modal').modal('show');
                        }
                    }
                }).fail(() => {
                let trace = me.services.getErrorInformation();
            }).always(() => {
            });


        };
        
        updateQueuedMessage = () => {
            let me = this;
            jQuery('#edit-message-modal').modal('hide');
            let request = <IEmailListMessgeUpdate> {
                messageId: me.messageEditForm.messageId,
                subject: me.messageEditForm.subject(),
                // template: me.messageEditForm.selectedTemplate(),
                messageText: me.messageEditForm.messageText()
            };
            me.showActionWaiterBanner('update','mailing-message-entity');
            me.services.executeService('peanut.qnut-directory::messaging.UpdateQueuedMessage', request,
                function (serviceResponse: Peanut.IServiceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                            let response = <IGetMessageHistoryResponse>serviceResponse.Value;
                            me.currentQueuePage(1);
                            me.showQueueTab(response);
                        }
                    }
                }).fail(() => {
                let trace = me.services.getErrorInformation();
            }).always(() => {
                me.application.hideWaiter();
            });
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

        valadateEmailList = (item: IEmailListItem) => {
            let me = this;
            if (item.name.trim() == '') {
                me.listEditForm.nameError(me.translate('form-error-name-blank'));
                return false;
            }
            if (item.code.trim() == '') {
                me.listEditForm.codeError(me.translate('form-error-code-blank'));
                return false;
            }
            if (item.description.trim() == '') {
                item.description = item.name;
            }
            return true;
        };

        updateEmailList = () => {
            let me = this;
            let request = <IEmailListItem> {
                id:  me.listEditForm.listId(),
                name: me.listEditForm.name(),
                code: me.listEditForm.code(),
                active: me.listEditForm.active() ? 1 : 0,
                description: me.listEditForm.description(),
                mailBox: me.listEditForm.selectedMailbox().mailboxcode,
            };

            if (me.valadateEmailList(request)) {
                jQuery('#edit-list-modal').modal('hide');
                me.showActionWaiterBanner('update','mailing-list-entity');
                me.services.executeService('peanut.qnut-directory::messaging.UpdateMailingList', request,
                    function (serviceResponse: Peanut.IServiceResponse) {
                        if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                            if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                                let response = <IEmailListItem[]>serviceResponse.Value;
                                me.assignEmailLists(response);
                            }
                        }
                    }).fail(() => {
                        let trace = me.services.getErrorInformation();
                    }).always(() => {
                        me.application.hideWaiter();
                    });
            }
        };

        showEmailListForm = (item: IEmailListItem) => {
            let me = this;
            me.application.hideServiceMessages();
            me.listEditForm.description(item.description);
            me.listEditForm.code(item.code);
            me.listEditForm.name(item.name);
            me.listEditForm.listId(item.id);
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
        };

        onTabChange = () => {
            this.application.hideServiceMessages();
        }
    }
}

