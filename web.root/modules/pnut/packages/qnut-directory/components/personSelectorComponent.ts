/**
 * Created by Terry on 5/24/2016.
 */
///<reference path="../../../../pnut/js/searchListObservable.ts"/>
/// <reference path='../../../../typings/knockout/knockout.d.ts' />
/// <reference path='../../../../pnut/core/peanut.d.ts' />
/// <reference path="../../../../pnut/core/ViewModelBase.ts" />

namespace QnutDirectory {
    import ViewModelBase = Peanut.ViewModelBase;
    import ISearchListObservable = Peanut.ISearchListObservable;
    import searchListObservable = Peanut.searchListObservable;
    import IServiceResponse = Peanut.IServiceResponse;
    import INameValuePair = Peanut.INameValuePair;

    export class personSelectorComponent {
        private owner:ViewModelBase;
        private selectorId : string;
        private itemName: string;
        private itemPlural: string;
        personsList:ISearchListObservable;

        public headerText:KnockoutObservable<string>;
        public bodyText:KnockoutObservable<string>;
        public modalId:KnockoutObservable<string>;

        public closeLabel:KnockoutObservable<string>;
        public resultsMessage: KnockoutObservable<string>;
        public showMoreLabel:KnockoutObservable<string>;


        constructor(owner: ViewModelBase, modalId: string = null) {
            var me = this;
            me.owner = owner;
            if (!modalId) {
                modalId = 'persons-search-modal';
            }
            me.modalId = ko.observable(modalId);
            me.selectorId = '#' + modalId;
            me.headerText = ko.observable('');
            me.closeLabel = ko.observable('');
            me.resultsMessage = ko.observable('');
            me.showMoreLabel = ko.observable('');
            // me.headerText = (typeof params.headerText == 'string') ?  ko.observable(params.headerText) : params.headerText;
        }
        public initialize(finalFunction? : () => void) {
            var me = this;
            me.headerText(me.owner.translate('dir-find-person'));
            me.closeLabel(me.owner.translate('label-close'));
            me.showMoreLabel(me.owner.translate('dir-show-more'));
            me.itemName = me.owner.translate('person-entity');
            me.itemPlural = me.owner.translate('person-entity-plural');


            me.personsList = new searchListObservable(2, 6);
            if (finalFunction) {
                finalFunction();
            }
        }

        setResultsMessage = () => {
            let me = this;
            let itemCount = this.personsList.selectionCount();
            if (itemCount == 1) {
                me.resultsMessage(me.owner.translate('dir-one-person-found'))
            }
            else if (itemCount == 0) {
                me.resultsMessage(me.owner.translate('dir-no-person-found'));
            }
            else {
                me.resultsMessage(itemCount + ' ' +me.owner.translate('dir-persons-found'));
            }
        };
        
        reset = () => {
            var me = this;
            me.personsList.reset();
            me.resultsMessage('');
        };

        findPersons = () => {
            var me = this;
            var request = me.personsList.searchValue();
            me.owner.hideServiceMessages();
            me.owner.getServices().executeService('peanut.qnut-directory::membership.FindPersons', request,
                function (serviceResponse: IServiceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        var list = <INameValuePair[]>serviceResponse.Value;
                        me.personsList.setList(list);
                        me.setResultsMessage();
                    }
                    else {
                        me.hide();
                    }
                }
            ).fail(function () {
                let trace = me.owner.getServices().getErrorInformation();
            })
        };
        
        selectPerson = (personItem:INameValuePair)=> {
            var me = this;
            me.hide();
            if (me.owner) {
                me.owner.handleEvent('person-selected',
                    {person: personItem, modalId: me.modalId()}
                )
            }
        };

        show = () => {
            let me = this;
            if (me.personsList) {
                // initialized
                me.showList();
            }
            else {
                me.initialize(me.showList);
            }
        };

        showList = () => {
            let me = this;
            me.reset();
            jQuery(me.selectorId).modal('show');
        };

        hide = () => {
            var me = this;
            jQuery(me.selectorId).modal('hide');
        };

        cancelSearch = () => {
            var me = this;
            me.hide();
            if (me.owner) {
                me.owner.handleEvent('person-search-cancelled', me.modalId);
            }
        };
    }
}