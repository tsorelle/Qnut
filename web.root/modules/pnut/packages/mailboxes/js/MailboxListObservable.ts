namespace Mailboxes {
    import ViewModelBase = Peanut.ViewModelBase;
    import IPeanutClient = Peanut.IPeanutClient;
    import ServiceBroker = Peanut.ServiceBroker;
    import mailBox = Peanut.mailBox;

    export class MailboxListObservable {
        list = ko.observableArray<IMailBox>([]);
        private owner : ViewModelBase;
        private application: IPeanutClient;
        private services: ServiceBroker;
        private callbacks = [];
        private subscriptions = [];

        constructor(client: ViewModelBase) {
            let me = this;
            me.application = client.getApplication();
            me.services = client.getServices();
            me.owner = client;
        }

        subscribe(callback: (mailboxes: IMailBox[]) => void) {
            let me = this;
            me.callbacks.push(callback);
            let subscription = me.list.subscribe(callback);
            me.subscriptions.push(subscription);
        }

        suspendSubscriptions() {
            let me = this;
            for(let i=0;i<me.subscriptions.length; i++) {
                me.subscriptions[i].dispose();
            }
            me.subscriptions = [];
        }

        restoreSubscriptions() {
            let me = this;
            for(let i=0;i<me.callbacks.length; i++) {
                let subscription = me.list.subscribe(me.callbacks[i]);
                me.subscriptions.push(subscription);
            }
        }

        getUpdatedMailboxList(doneFunction?: () => void) {
            let me = this;
            let request = null;
            me.application.hideServiceMessages();
            me.owner.showActionWaiterBanner('load','mailbox-entity-plural');
            me.application.showWaiter(me.owner.translate('mailbox-wait-load') + '...');
            me.services.executeService('peanut.Mailboxes::GetMailboxList',request,
                function(serviceResponse: Peanut.IServiceResponse) {
                    me.application.hideWaiter();
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        let response = <IGetMailboxesResponse>serviceResponse.Value;
                        me.owner.addTranslations(response.translations);
                        me.setMailboxes(response.list)
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

        getMailboxList = (doneFunction?: () => void) => {
            let me = this;
            let list = me.list();
            if (list.length == 0) {
                me.getUpdatedMailboxList(doneFunction);
            }
            else {
                me.suspendSubscriptions();
                me.list([]);
                me.restoreSubscriptions();
                me.list(list); // reassign to trigger subscriptions.
                doneFunction();
            }
        };

        setMailboxes = (mailboxes: IMailBox[]) =>  {
            let me = this;
            let list = _.sortBy(mailboxes,(box: IMailBox) => {
                return box.displaytext.toLowerCase()
            });
            me.list(list);
        };


    }

}