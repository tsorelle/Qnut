var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var QnutDirectory;
(function (QnutDirectory) {
    var MailingFormViewModel = (function (_super) {
        __extends(MailingFormViewModel, _super);
        function MailingFormViewModel() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.sendRequest = null;
            _this.messageSubject = ko.observable('');
            _this.messageBody = ko.observable('');
            _this.formVisible = ko.observable(false);
            _this.bodyError = ko.observable('');
            _this.subjectError = ko.observable('');
            _this.mailingListSelectError = ko.observable('');
            _this.confirmCaption = ko.observable('');
            _this.confirmSendMessage = ko.observable('');
            _this.confirmResendMessage = ko.observable('');
            _this.queuePageSize = 10;
            _this.currentQueuePage = ko.observable(1);
            _this.maxQueuePages = ko.observable(1);
            _this.refreshingQueue = ko.observable(false);
            _this.mailingListLookup = ko.observableArray([]);
            _this.mailingLists = ko.observableArray([]);
            _this.mailboxList = ko.observableArray([]);
            _this.selectedMailingList = ko.observable(null);
            _this.selectMailingListCaption = ko.observable('Select a mailing list');
            _this.templateSelectCaption = ko.observable('No template');
            _this.messasageFormats = ko.observableArray([
                { Name: 'Html', Value: 'html' },
                { Name: 'Plain text', Value: 'text' }
            ]);
            _this.selectedMessageFormat = ko.observable(_this.messasageFormats()[0]);
            _this.templateList = [];
            _this.messageTemplates = ko.observableArray([]);
            _this.selectedMessageTemplate = ko.observable();
            _this.editorView = ko.observable('html');
            _this.tab = ko.observable('message');
            _this.queueStatus = ko.observable('active');
            _this.messageHistory = ko.observableArray([]);
            _this.pausedUntil = ko.observable('');
            _this.messageRemoveText = ko.observable('');
            _this.messageRemoveHeader = ko.observable('');
            _this.messageRemoveId = 0;
            _this.messageEditForm = {
                messageId: 0,
                subject: ko.observable(''),
                template: ko.observable(''),
                messageText: ko.observable(''),
                bodyError: ko.observable(''),
                subjectError: ko.observable('')
            };
            _this.listEditForm = {
                listId: ko.observable(0),
                mailboxCode: '',
                selectedMailbox: ko.observable(null),
                active: ko.observable(true),
                code: ko.observable(''),
                name: ko.observable(''),
                description: ko.observable(''),
                codeError: ko.observable(''),
                nameError: ko.observable('')
            };
            _this.previousMessage = { 'listId': -1, 'messageText': '' };
            _this.currentModal = '';
            _this.initEditor = function (selector) {
                tinymce.init({
                    selector: selector,
                    toolbar: "undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link | image",
                    plugins: "image imagetools link",
                    default_link_target: "_blank",
                    branding: false
                });
            };
            _this.showConfirmation = function (modalId) {
                var me = _this;
                me.currentModal = '#confirm-' + modalId + '-modal';
                jQuery(me.currentModal).modal('show');
            };
            _this.hideConfirmation = function () {
                var me = _this;
                jQuery(_this.currentModal).modal('hide');
                me.currentModal = '';
            };
            _this.getMailingLists = function (doneFunction) {
                var me = _this;
                var request = null;
                me.application.hideServiceMessages();
                me.services.executeService('peanut.qnut-directory::messaging.GetMailingLists', request, function (serviceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                            var response = serviceResponse.Value;
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
                }).fail(function () {
                    var trace = me.services.getErrorInformation();
                }).always(function () {
                    if (doneFunction) {
                        doneFunction();
                    }
                });
            };
            _this.assignEmailLists = function (emailLists) {
                var me = _this;
                var lookup = _.filter(emailLists, function (item) {
                    return (item.active == 1);
                });
                me.mailingListLookup(lookup);
                me.mailingLists(emailLists);
            };
            _this.onFormatChange = function (format) {
                var me = _this;
                me.messageTemplates(me.templateList[format.Value]);
                if (format.Value == 'text' && me.editorView() == 'html') {
                    me.showPlainText();
                }
            };
            _this.showEditor = function () {
                var me = _this;
                tinymce.get('messagehtml').setContent(me.messageBody());
                me.selectedMessageFormat(me.messasageFormats()[0]);
                me.editorView('html');
            };
            _this.showPlainText = function () {
                var me = _this;
                tinymce.triggerSave();
                me.messageBody(jQuery('#messagehtml').val());
                me.editorView('text');
            };
            _this.createMessage = function () {
                var me = _this;
                me.subjectError('');
                me.bodyError();
                if (me.editorView() == 'html') {
                    tinymce.triggerSave();
                    me.messageBody(jQuery('#messagehtml').val());
                }
                var list = me.selectedMailingList();
                var template = me.selectedMessageTemplate();
                var message = {
                    listId: list ? list.id : 0,
                    subject: me.messageSubject(),
                    messageText: me.messageBody(),
                    template: template ? template : '',
                    contentType: me.selectedMessageFormat().Value
                };
                var valid = true;
                if (message.subject.trim() == '') {
                    me.subjectError(': ' + me.translate('form-error-email-subject-blank'));
                    valid = false;
                }
                if (message.messageText.trim() == '') {
                    me.bodyError(': ' + me.translate('form-error-email-message-blank'));
                    valid = false;
                }
                if (valid) {
                    return message;
                }
                return null;
            };
            _this.sendMessage = function () {
                var me = _this;
                me.sendRequest = me.createMessage();
                if (me.sendRequest) {
                    if (me.sendRequest.listId) {
                        var modalId = (me.previousMessage.listId == me.sendRequest.listId &&
                            me.previousMessage.messageText == me.sendRequest.messageText) ? 'resend' : 'send';
                        me.showConfirmation(modalId);
                    }
                    else {
                        me.doSend();
                    }
                }
            };
            _this.doSend = function () {
                var me = _this;
                me.hideConfirmation();
                me.application.hideServiceMessages();
                me.showActionWaiterBanner('send', 'mailing-message-entity');
                me.services.executeService('peanut.qnut-directory::messaging.SendMailingListMessage', me.sendRequest, function (serviceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                            if (me.sendRequest.listId) {
                                me.previousMessage = me.sendRequest;
                            }
                        }
                    }
                }).fail(function () {
                    var trace = me.services.getErrorInformation();
                }).always(function () {
                    me.application.hideWaiter();
                });
            };
            _this.showMessageTab = function () {
                _this.tab('message');
            };
            _this.onQueuePaged = function (moved) {
                _this.getMessageQueue(_this.currentQueuePage() + moved);
            };
            _this.refreshQueue = function () {
                var me = _this;
                me.getMessageQueue(1);
            };
            _this.getMessageQueue = function (pageNumber) {
                var me = _this;
                me.refreshingQueue(true);
                if (pageNumber == 1) {
                    me.application.showBannerWaiter('mailing-get-history');
                }
                var request = { pageSize: me.queuePageSize, pageNumber: pageNumber };
                me.services.executeService('peanut.qnut-directory::messaging.GetEmailListHistory', request, function (serviceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                            var response = serviceResponse.Value;
                            me.currentQueuePage(pageNumber);
                            me.maxQueuePages(response.maxPages);
                            me.showQueueTab(response);
                        }
                    }
                }).fail(function () {
                    var trace = me.services.getErrorInformation();
                }).always(function () {
                    if (pageNumber == 1) {
                        me.application.hideWaiter();
                    }
                    me.refreshingQueue(false);
                });
            };
            _this.controlQueue = function (action) {
                var me = _this;
                me.application.showBannerWaiter('mailing-get-history');
                me.services.executeService('peanut.qnut-directory::messaging.ControlMessageProcess', action, function (serviceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                            var response = serviceResponse.Value;
                            me.currentQueuePage(1);
                            me.showQueueTab(response);
                        }
                    }
                }).fail(function () {
                    var trace = me.services.getErrorInformation();
                }).always(function () {
                    me.application.hideWaiter();
                });
            };
            _this.pauseQueue = function () {
                _this.controlQueue('pause');
            };
            _this.restartQueue = function () {
                _this.controlQueue('start');
            };
            _this.removeQueuedMessage = function (item) {
                var me = _this;
                me.messageRemoveText(me.translate('mailing-remove-queue').replace('%s', item.subject));
                me.messageRemoveHeader(me.translate('mailing-remove-header'));
                me.messageRemoveId = item.messageId;
                jQuery("#confirm-remove-modal").modal('show');
            };
            _this.doRemoveMessage = function () {
                var me = _this;
                jQuery("#confirm-remove-modal").modal('hide');
                me.showActionWaiterBanner('remove', 'mailing-message-entity');
                me.services.executeService('peanut.qnut-directory::messaging.RemoveQueuedMessage', me.messageRemoveId, function (serviceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                            var response = serviceResponse.Value;
                            me.currentQueuePage(1);
                            me.showQueueTab(response);
                        }
                    }
                }).fail(function () {
                    var trace = me.services.getErrorInformation();
                }).always(function () {
                    me.application.hideWaiter();
                });
            };
            _this.editQueuedMessage = function (item) {
                var me = _this;
                me.messageEditForm.messageId = item.messageId;
                me.messageEditForm.subject(item.subject);
                me.services.executeService('peanut.qnut-directory::messaging.GetQueuedMessageText', item.messageId, function (serviceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                            var response = serviceResponse.Value;
                            me.messageEditForm.messageText(response);
                            jQuery('#edit-message-modal').modal('show');
                        }
                    }
                }).fail(function () {
                    var trace = me.services.getErrorInformation();
                }).always(function () {
                });
            };
            _this.updateQueuedMessage = function () {
                var me = _this;
                jQuery('#edit-message-modal').modal('hide');
                var request = {
                    messageId: me.messageEditForm.messageId,
                    subject: me.messageEditForm.subject(),
                    messageText: me.messageEditForm.messageText()
                };
                me.showActionWaiterBanner('update', 'mailing-message-entity');
                me.services.executeService('peanut.qnut-directory::messaging.UpdateQueuedMessage', request, function (serviceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                            var response = serviceResponse.Value;
                            me.currentQueuePage(1);
                            me.showQueueTab(response);
                        }
                    }
                }).fail(function () {
                    var trace = me.services.getErrorInformation();
                }).always(function () {
                    me.application.hideWaiter();
                });
            };
            _this.showQueueTab = function (response) {
                var me = _this;
                me.queueStatus(response.status);
                me.messageHistory(response.items);
                me.pausedUntil(response.pausedUntil);
                me.tab('queue');
            };
            _this.showLists = function () {
                var me = _this;
                me.tab('lists');
            };
            _this.editEmailList = function (item) {
                var me = _this;
                me.showEmailListForm(item);
            };
            _this.newEmailList = function () {
                var me = _this;
                var item = {
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
            _this.valadateEmailList = function (item) {
                var me = _this;
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
            _this.updateEmailList = function () {
                var me = _this;
                var request = {
                    id: me.listEditForm.listId(),
                    name: me.listEditForm.name(),
                    code: me.listEditForm.code(),
                    active: me.listEditForm.active() ? 1 : 0,
                    description: me.listEditForm.description(),
                    mailBox: me.listEditForm.selectedMailbox().mailboxcode
                };
                if (me.valadateEmailList(request)) {
                    jQuery('#edit-list-modal').modal('hide');
                    me.showActionWaiterBanner('update', 'mailing-list-entity');
                    me.services.executeService('peanut.qnut-directory::messaging.UpdateMailingList', request, function (serviceResponse) {
                        if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                            if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                                var response = serviceResponse.Value;
                                me.assignEmailLists(response);
                            }
                        }
                    }).fail(function () {
                        var trace = me.services.getErrorInformation();
                    }).always(function () {
                        me.application.hideWaiter();
                    });
                }
            };
            _this.showEmailListForm = function (item) {
                var me = _this;
                me.application.hideServiceMessages();
                me.listEditForm.description(item.description);
                me.listEditForm.code(item.code);
                me.listEditForm.name(item.name);
                me.listEditForm.listId(item.id);
                me.listEditForm.active(item.active == 1);
                me.listEditForm.mailboxCode = item.mailBox;
                if (me.mailboxList().length == 0) {
                    me.mailboxes.subscribe(me.onMailboxListChanged);
                }
                me.mailboxes.getMailboxList(function () {
                    jQuery('#edit-list-modal').modal('show');
                });
            };
            _this.onMailboxListChanged = function (mailboxes) {
                var me = _this;
                var filtered = _.filter(mailboxes, function (box) {
                    return box.active == 1;
                });
                me.mailboxList(filtered);
                if (me.listEditForm.mailboxCode) {
                    var mailboxItem = _.find(me.mailboxList(), function (mailbox) {
                        return mailbox.mailboxcode == me.listEditForm.mailboxCode;
                    });
                    me.listEditForm.selectedMailbox(mailboxItem);
                }
                else {
                    me.listEditForm.selectedMailbox(null);
                }
            };
            _this.showMailboxes = function () {
                var me = _this;
                me.mailboxes.getMailboxList(function () {
                    me.tab('mailboxes');
                });
            };
            _this.onTabChange = function () {
                _this.application.hideServiceMessages();
            };
            return _this;
        }
        MailingFormViewModel.prototype.init = function (successFunction) {
            var me = this;
            console.log('MailingForm Init');
            me.tab.subscribe(me.onTabChange);
            me.showLoadWaiter();
            me.application.loadResources([
                '@lib:tinymce',
                '@lib:lodash',
                '@pnut/ViewModelHelpers.js',
                '@pkg/mailboxes/MailboxListObservable.js'
            ], function () {
                me.initEditor('#messagehtml');
                me.mailboxes = new Mailboxes.MailboxListObservable(me);
                me.application.registerComponents([
                    '@pnut/modal-confirm',
                    '@pkg/mailboxes/mailbox-manager',
                    '@pnut/pager'
                ], function () {
                    me.getMailingLists(function () {
                        me.application.hideWaiter();
                        me.bindDefaultSection();
                        successFunction();
                    });
                });
            });
        };
        return MailingFormViewModel;
    }(Peanut.ViewModelBase));
    QnutDirectory.MailingFormViewModel = MailingFormViewModel;
})(QnutDirectory || (QnutDirectory = {}));
//# sourceMappingURL=MailingFormViewModel.js.map