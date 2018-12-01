
/// <reference path='../../../../pnut/core/peanut.d.ts' />
/// <reference path="../../../../pnut/core/ViewModelBase.ts" />
/// <reference path='../../../../pnut/js/searchListObservable.ts' />
/// <reference path='../js/committees.d.ts' />
/// <reference path='../js/CommitteeEntities.ts' />
/// <reference path='../../../../typings/tinymce/tinymce.d.ts' />
/// <reference path='../../../../typings/knockout/knockout.d.ts' />
/// <reference path='../../../../typings/jqueryui/jqueryui.d.ts' />
/// <reference path='../../../../typings/lodash/filter/index.d.ts' />
/// <reference path='../../qnut-directory/js/PersonSelector.ts' />


namespace QnutCommittees {
    import selectListObservable = Peanut.selectListObservable;
    import INameValuePair = Peanut.INameValuePair;


    interface ICommitteeListItem extends Peanut.INameValuePair {
        active: any;
    }
    interface IGetCommitteeListResponse {
        list: ICommitteeListItem[],
        canEdit: boolean;
        helpUrl: string;
        translations: string[];
    }

    interface IMemberReportItem {
        statusId : any;
        memberName : string;
        email : string;
        phone : string;
        role : string;
        nominationStatus : any;
    }
    interface ICommitteeReportItem extends IMemberReportItem{
        committeeId : any;
        committeeName : string;
    }

    interface ICommitteeReportDisplayItem {
        committeeName: string;
        members: IMemberReportItem[];
    }

    export class CommitteesViewModel extends Peanut.ViewModelBase {
        // observables
        canEdit = ko.observable(false);
        pageView = ko.observable('forms');
        reportDate = ko.observable('');
        // personsUrl = ko.observable('');
        helpUrl = ko.observable('');
        activeFilter = true;
        currentMemberFilter = 'current';

        userIsAuthorized = ko.observable(false);
        // committeeName = ko.observable(null); // not used?
        committeeForm: committeeObservable;
        termOfServiceForm: termOfServiceObservable;
        committeeList: ICommitteeListItem[];
        committeeSelector: selectListObservable;
        personSelector : QnutDirectory.PersonSelector;
        memberList: ITermOfServiceListItem[];
        members: KnockoutObservableArray<ITermOfServiceListItem> = ko.observableArray([]);
        committeeMemberFilter: selectListObservable;
        textViewContent = ko.observable('');
        textViewTitle = ko.observable('');

        datePickerInitialized = false;

        reportResponse: ICommitteeReportItem[] = [];

        reportOptionsColumnClass = ko.observable('col-md-12');

        reportOptions = {
            currentMembers: ko.observable(true),
            nominations: ko.observable(true),
            emails: ko.observable(true),
            phones: ko.observable(true),
            committeeFilter: ko.observable('all')
        };

        report = {
            current: ko.observableArray<ICommitteeReportDisplayItem>([]),
            nominated: ko.observableArray<ICommitteeReportDisplayItem>([])
        };

        init(successFunction?: () => void) {
            let me = this;
            console.log('Committees Init');

            me.application.loadStyleSheets([
                '@pkg:qnut-committees'
            ]);

            me.application.loadResources([
                '@lib:jqueryui-css',
                '@lib:jqueryui-js',
                '@lib:lodash',
                '@lib:tinymce',
                '@pnut/ViewModelHelpers',
                '@pnut/editPanel',
                // '@pnut/searchListObservable',
                '@pnut/selectListObservable',
                '@pkg/qnut-directory/PersonSelector'
            ], () => {
                me.application.loadResources([
                    '@pkg/qnut-committees/CommitteeEntities',
                ], () => {
                    me.memberList = [];
                    me.members([]);

                    // initialize date popups
                    jQuery(function () {
                        jQuery(".datepicker").datepicker();
                    });
                    me.termOfServiceForm = new termOfServiceObservable(me);
                    me.committeeForm = new committeeObservable(me);
                    me.committeeSelector = new Peanut.selectListObservable(me.selectCommittee, []);
                    me.personSelector = new QnutDirectory.PersonSelector(me);
                    me.committeeMemberFilter = new Peanut.selectListObservable(me.onMemberFilterChange,[
                        {Name:'Current members', Value: 'current' },
                        {Name:'Nominations', Value: 'nominated' },
                        {Name:'Current and Former members', Value: 'former' }],'current');

                    me.committeeForm.initialize(function () {
                        me.getInitializations(() => {
                            me.bindDefaultSection();
                            // late bind personSelector due to dependencies
                            me.personSelector.attach(successFunction);
                        });
                    });
                });
            });
        }

        getInitializations(doneFunction?: () => void) {
            let me = this;
            me.services.executeService('peanut.qnut-committees::GetCommitteeList', null,
                function (serviceResponse: Peanut.IServiceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        let response = <IGetCommitteeListResponse>serviceResponse.Value;
                        me.addTranslations(response.translations);
                        me.committeeList = response.list;
                        me.helpUrl(response.helpUrl);
                        me.canEdit(response.canEdit);
                        let filtered = me.filterCommitteeList(true);
                        me.committeeSelector.setOptions(filtered);
                        // me.committeeSelector = new selectListObservable(me.selectCommittee, filtered);
                        me.committeeSelector.subscribe();
                        let cid = Peanut.Helper.getRequestParam('cid');
                        if (cid) {
                            me.committeeSelector.setValue(cid);
                        }
                    }
                    else {
                        me.pageView('none');
                    }
                })
                .fail(function () {
                    let trace = me.services.getErrorInformation();
                })
                .always(function () {
                    me.application.hideWaiter();
                    if (doneFunction) {
                        doneFunction();
                    }
                });
        }

        private filterCommitteeList(active: boolean) {
            let me = this;
            if (!active) {
                return me.committeeList;
            }
            else {
                return _.filter(me.committeeList,function (item: ICommitteeListItem) {
                    return item.active == 1 || item.active == true;
                });
            }
        }

        selectMember = (selected: ITermOfServiceListItem) => {
            let me = this;
            if (selected) {
                // alert("Selected: " + selected.name + ' ' + selected.termOfService);
                me.termOfServiceForm.assign(selected,me.committeeForm.name());
                me.termOfServiceForm.view();
                // let state = me.termOfServiceForm.viewState();
                me.showTermDetail();
            }
        };

        private showTermDetail() {
            let me = this;
            if (!me.datePickerInitialized) {
                jQuery(function() {
                    jQuery( ".datepicker" ).datepicker({
                        changeYear: true
                    });
                });
                me.datePickerInitialized = true;
            }
            jQuery("#term-detail-modal").modal('show');
        }

        private selectCommittee = (selected: INameValuePair) => {
            let me = this;
            if (selected) {
                let request = selected.Value;
                me.committeeForm.view();
                me.application.hideServiceMessages();
                me.showActionWaiter('loading','committee-entity');
                me.services.executeService('peanut.qnut-committees::GetCommitteeAndMembers',request,
                    function(serviceResponse: Peanut.IServiceResponse) {
                        if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                            let response = <IGetCommitteeResponse>serviceResponse.Value;
                            me.committeeForm.assign(response.committee);
                            me.reportOptionsColumnClass('col-md-6');
                            me.committeeMemberFilter.unsubscribe();
                            me.memberList = response.members;
                            jQuery("#all-members-checkbox").attr("checked",<any>false);
                            me.committeeMemberFilter.unsubscribe();
                            me.committeeMemberFilter.setValue('current');
                            me.filterMemberList('current');
                            me.committeeMemberFilter.subscribe();
                        }
                        else {
                            // errors or warnings
                        }
                    })
                    .fail(function () {
                        let trace = me.services.getErrorInformation();
                    })
                    .always(function () {
                        me.application.hideWaiter();
                    });
            }
            else {
                me.reportOptionsColumnClass('col-md-12');
                me.committeeForm.clear();
            }
        };

        filterMemberList = (filter: string) => {
            let me = this;
            let filtered =  _.filter(me.memberList,function (item: ITermOfServiceListItem) {
                if (filter == 'nominated') {
                    return item.statusId < 3;
                }
                if (item.statusId != 3) {
                    return false;
                }
                let today = me.getTodayString('iso');
                    // Dates.getCurrentDateString('isodate');
                if (filter == 'current' && item.dateRelieved) {
                    return item.dateRelieved >= today;
                }
                return true;
            });

            me.currentMemberFilter = filter;
            me.members(filtered);
        };

        onMemberFilterChange = (selected: INameValuePair) => {
            let me = this;
            me.filterMemberList(selected.Value);
        };

        resetCommitteeList = () => {
            let me = this;
            me.activeFilter = !me.activeFilter;
            me.committeeSelector.unsubscribe();
            me.committeeSelector.setOptions(me.filterCommitteeList(me.activeFilter));
            me.committeeSelector.subscribe();
            return true;
        };

        private closeCommittee() {
            let me = this;
            me.committeeSelector.setValue(null);
            me.committeeForm.clear();
            me.memberList = [];
            me.members([]);
        }

        newCommittee = () => {
            let me=this;
            me.closeCommittee();
            me.editCommittee();
        };

        editCommittee = () => {
            let me = this;
            // me.descriptionEditor.show();
            me.committeeForm.editMode();
        };

        saveCommittee = () => {
            let me = this;
            if (!me.committeeForm.validate()) {
                return;
            }
            let request = me.committeeForm.getValues();
            let isNew = request.id == 0;
            me.application.hideServiceMessages();

            me.showActionWaiter('update', 'committee-entity');
            me.services.executeService('peanut.qnut-committees::UpdateCommittee', request,
                function (serviceResponse: Peanut.IServiceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        let response = <any>serviceResponse.Value;
                        if (isNew) {
                            let lookupItem: ICommitteeListItem = {
                                Name: request.name,
                                Value: response.id,
                                active: request.active
                            };

                            me.committeeList.push(lookupItem);
                            me.committeeList = _.sortBy(me.committeeList, "Name");
                            me.committeeSelector.unsubscribe();
                            if ((!request.active) && me.activeFilter == true) {
                                me.activeFilter = false;
                                jQuery("filter-committees-checkbox").attr("checked", <any>false);
                            }
                            me.committeeSelector.setOptions(me.filterCommitteeList(me.activeFilter));
                            me.committeeSelector.setValue(response.id);
                            me.committeeSelector.subscribe();
                        }
                        me.committeeForm.assign(response);
                        me.committeeForm.view();
                    }
                    else {
                        // errors or warnings
                    }
                })
                .fail(function () {
                    let trace = me.services.getErrorInformation();
                })
                .always(function () {
                    me.application.hideWaiter();
                });

        };

        cancelCommitteeChanges = () => {
            let me = this;
            me.committeeForm.view();
        };

        showPersonSearch = () => {
            this.personSelector.show();
        };

        updateTerm = () => {
            let me = this;
            if (!me.termOfServiceForm.validate()) {
                return;
            }
            let request = me.termOfServiceForm.getValues();

            if (!me.termOfServiceForm.validate()) {
                return;
            }
            // me.showActionWaiter('action','entity');
            jQuery("#term-detail-modal").modal('hide');
            let isNew = request.id == 0;
            me.application.hideServiceMessages();
            me.showLoadWaiter('committee-update-term');
            me.services.executeService('peanut.qnut-committees::UpdateCommitteeTerm',request,
                function(serviceResponse: Peanut.IServiceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        me.memberList = <ITermOfServiceListItem[]>serviceResponse.Value;
                        me.filterMemberList(me.currentMemberFilter);
                    }
                    else {
                        // errors or warnings
                    }
                })
                .fail(function () {
                    let trace = me.services.getErrorInformation();
                })
                .always(function () {
                    me.application.hideWaiter();
                });
        };

        editTerm = () => {
            let me = this;
            me.termOfServiceForm.edit();
        };

        cancelTermEdit = () => {
            let me = this;
            me.termOfServiceForm.rollback();
            me.termOfServiceForm.view();
            if (me.termOfServiceForm.personId() == 0) {
                jQuery("#term-detail-modal").modal('hide');
            }
        };


        newTerm = (person : INameValuePair) => {
            let me = this;
            let committee = me.committeeSelector.selected();
            me.termOfServiceForm.clear();
            me.termOfServiceForm.personId(Number(person.Value));
            me.termOfServiceForm.name(person.Name);
            me.termOfServiceForm.committeeId = committee.Value;
            me.termOfServiceForm.committeeName(committee.Name);

            me.termOfServiceForm.edit();
            me.showTermDetail();
        };

        private setPageView(view : string) {
            let me = this;
            me.pageView(view);
            if (view == 'forms') {
                me.setPageHeading('committee-entity-plural')
            }
            else {
                me.setPageHeading('committee-members-page-heading');
                me.reportDate(
                    me.getTodayString('iso')
                    );
            }
        }

        runReport = () => {
            let me = this;

            me.application.hideServiceMessages();
            me.showLoadWaiter('committee-running-report');
            me.services.executeService('peanut.qnut-committees::GetCommitteeReport',null,
                function(serviceResponse: Peanut.IServiceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        me.reportResponse = <ICommitteeReportItem[]>serviceResponse.Value;
                        me.showReportOptions();
                    }
                    else {
                        // errors or warnings
                    }
                })
                .fail(function () {
                    let trace = me.services.getErrorInformation();
                })
                .always(function () {
                    me.application.hideWaiter();
                });

        };

        closeReport = () => {
            let me = this;
            me.setPageView('forms');
        };

        showReportOptions = () => {
            let me = this;
            jQuery('#report-options-modal').modal('show');
        };

        applyReportOptions = () => {
            let me = this;
            me.report.current([]);
            me.report.nominated([]);
            let list = me.reportResponse;

            if (me.reportOptions.committeeFilter() != 'all') {
                let id = me.committeeForm.committeeId();
                list = _.filter(list,function (item: ICommitteeReportItem) {
                    return item.committeeId == id;
                });
            }

            if (me.reportOptions.currentMembers()) {
                let filtered : ICommitteeReportItem[] = _.filter(list,function (item: ICommitteeReportItem) {
                    return item.statusId == 3;
                });
                let current = me.buildReportObservable(filtered);
                me.report.current(current);
            }

            if (me.reportOptions.nominations()) {
                let filtered : ICommitteeReportItem[] =  _.filter(list,function (item: ICommitteeReportItem) {
                    return item.statusId != 3;
                });
                let nominations = me.buildReportObservable(filtered);
                me.report.nominated(nominations);
            }

            me.setPageView('reports');
            jQuery('#report-options-modal').modal('hide');
        };

        private buildReportObservable(selected: ICommitteeReportItem[]) : ICommitteeReportDisplayItem[] {
            let result : ICommitteeReportDisplayItem[] = [];
            let committeeId = 0;
            let len = selected.length;
            let observableItem : ICommitteeReportDisplayItem = null;
            for (let i = 0;i< len; i++) {
                let item:ICommitteeReportItem = selected[i];
                if (item.committeeId != committeeId) {
                    if (observableItem !== null) {
                        result.push(observableItem);
                    }
                    observableItem = {
                        committeeName: item.committeeName,
                        members: []
                    };
                    committeeId = item.committeeId;
                }
                observableItem.members.push(item);
            }
            if (observableItem !== null) {
                result.push(observableItem);
            }
            return result;
        }

        // called from personSelector component
        handleEvent = (eventName:string, data?:any)=> {
            let me = this;
            switch (eventName) {
                case 'person-selected' :
                    me.newTerm(<INameValuePair>data.person);
                    break;
                case 'person-search-cancelled' :
                    // alert('Search cancelled.');
                    break;
                case 'test' :
                    alert('event test');
                    break;
            }
        };

        showText = (title: string, content:string) => {
            this.textViewTitle(this.translate(title));
            this.textViewContent(content);
            jQuery("#text-view-modal").modal('show');
        };

        showFullDescriptionText = () => {
            this.showText('label-full-description',this.committeeForm.fulldescription());
        };

        showNotesText = () => {
            this.showText('label-notes',this.committeeForm.notes());
        };

    } // end CommitteesViewModel

} // end namespace