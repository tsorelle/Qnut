/// <reference path="../../../../pnut/core/ViewModelBase.ts" />
/// <reference path='../../../../typings/knockout/knockout.d.ts' />
/// <reference path='../../../../pnut/core/peanut.d.ts' />
/// <reference path='../../../../pnut/js/ViewModelHelpers.ts' />
/// <reference path='../../../../typings/lodash/filter/index.d.ts' />

namespace PeanutTasks {
    import INameValuePair = Peanut.INameValuePair;

    export interface ITaskLogEntry {
        id: any;
        taskname: string;
        time: string;
        type: string;
        message: string;
    }

    export interface ITaskQueueItem {
        id: any;
        frequency: string;
        taskname: string;
        namespace: string;
        startdate: string;
        enddate: string;
        inputs: string;
        comments: string;
        active: any;
    }

    export interface IGetTaskScheduleResponse {
        schedule: ITaskQueueItem[],
        translations: string[];
    }

    interface IUpdateTaskResponse {
        error: string;
        schedule: ITaskQueueItem[];
    }

    export class SchedulerViewModel extends Peanut.ViewModelBase {
        logRequest = {
            limit: 15,
            offset: 0
        };
        tab = ko.observable('schedule');
        taskEditForm = {
            id: ko.observable(0),
            taskNameError: ko.observable(''),
            namespaceError: ko.observable(''),
            frequencyError: ko.observable(''),
            active: ko.observable(true),
            taskname: ko.observable(''),
            namespace:ko.observable(''),
            inputs:ko.observable(''),
            startdate: ko.observable(''),
            enddate: ko.observable(''),
            frequency: ko.observable(''),
            comments: ko.observable(''),
            selectedFrequencyUnit : ko.observable<Peanut.INameValuePair>(null),
            frequencyUnitLookup : ko.observableArray<Peanut.INameValuePair>([
                {Name:'Minutes',Value:'minutes'},
                {Name:'Hours',Value:'hours'},
                {Name:'Days',Value:'days'},
                {Name:'Months',Value:'months'}
            ]),
            updating: ko.observable(false)
        };

        taskQueue = ko.observableArray<ITaskQueueItem>([]);
        taskLog = ko.observableArray<ITaskLogEntry>([]);
        prevEntries = ko.observable(false);
        moreEntries = ko.observable(false);

        init(successFunction?: () => void) {
            let me = this;
            console.log('Scheduler Init');
            me.application.loadResources([
                '@lib:jqueryui-css',
                '@lib:jqueryui-js',
                '@lib:lodash'
                // ,'@pnut/ViewModelHelpers'
            ], () => {
                // initialize date popups in mysql format
                jQuery(function () {
                    jQuery(".datepicker").datepicker().datepicker( "option", "dateFormat", 'yy-mm-dd' );
                });

                me.services.executeService('peanut.peanut-tasks::GetTaskSchedule', null,
                    function (serviceResponse: Peanut.IServiceResponse) {
                        if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                            if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                                let response = <IGetTaskScheduleResponse>serviceResponse.Value;
                                me.taskQueue(response.schedule);
                                me.addTranslations(response.translations);
                            }
                        }
                    }).fail(() => {
                        let trace = me.services.getErrorInformation();
                    }).always(() => {
                        me.bindDefaultSection();
                        successFunction();
                    });
            });

        }

        showLogsTab() {
            let me = this;
            if (me.taskLog().length == 0) {
                me.getLogs();
            }
            else {
                me.tab('log');
            }
        }

        showScheduleTab = () => {
            let me = this;
            me.tab('schedule');
        };


        clearErrors() {
            let me = this;
            me.taskEditForm.namespaceError('');
            me.taskEditForm.frequencyError('');
            me.taskEditForm.taskNameError('');
        }

        clearTaskEditForm() {
            let me = this;
            me.taskEditForm.frequency('');
            me.taskEditForm.selectedFrequencyUnit(null);
        }

        assignSelectedFrequencyUnit(unit: string) {
            let me = this;
            let list = me.taskEditForm.frequencyUnitLookup();
            let selected = _.find(list,(item: INameValuePair) => {
                return  item.Value == unit;
            });
            me.taskEditForm.selectedFrequencyUnit(selected);
            me.taskEditForm.frequencyUnitLookup(list);
        }

        editTask = (item: ITaskQueueItem ) => {
            let me = this;
            me.clearErrors();
            me.taskEditForm.id(item.id);
            me.taskEditForm.active(item.active);
            me.taskEditForm.namespace(item.namespace);
            me.taskEditForm.comments(item.comments);
            me.taskEditForm.enddate(item.enddate);
            let unit = 'hours';
            item.frequency = '1';
            if (item.frequency) {
                let parts = item.frequency.split(' ');
                me.taskEditForm.frequency(parts.shift());
                let unit = parts.pop();
                unit = unit || 'hours';
            }
            me.assignSelectedFrequencyUnit(unit);
            me.taskEditForm.inputs(item.inputs);
            me.taskEditForm.startdate(item.startdate);
            me.taskEditForm.enddate(item.enddate);
            me.taskEditForm.taskname(item.taskname);

            jQuery('#edit-task-modal').modal('show');
        };


        refreshLogs = () => {
            let me = this;
            me.logRequest.offset = 0;
            me.getLogs();
        };

        getLogs = () => {
            let me = this;
            me.application.showBannerWaiter(me.translate('tasks-get-log'));
            me.services.executeService('peanut.peanut-tasks::GetTaskLog', me.logRequest,
                function (serviceResponse: Peanut.IServiceResponse) {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        let log = <ITaskLogEntry[]>serviceResponse.Value;
                        me.taskLog(log);
                        me.moreEntries(log.length == me.logRequest.limit);
                        me.prevEntries(me.logRequest.offset > 0);
                        me.tab('log');
                    }
                }).fail(() => {
                    let trace = me.services.getErrorInformation();
                }).always(() => {
                    me.application.hideWaiter();
                });
        };

        getNextLog = () => {
            let me = this;
            me.logRequest.offset += me.logRequest.limit;
            me.getLogs();
        };

        getPrevLog = () => {
            let me = this;
            if(me.logRequest.offset >= me.logRequest.limit)  {
                me.logRequest.offset -= me.logRequest.limit;
            }
            me.getLogs();
        };

        validateTask(task: ITaskQueueItem) {
            let me = this;
            let valid = true;
            me.clearErrors();
            if (!task.namespace) {
                valid = false;
                me.taskEditForm.namespaceError('Namespace is required');
            }
            if (!task.frequency) {
                valid = false;
                me.taskEditForm.frequencyError('Frequency is required');
            }
            if (!task.taskname) {
                valid = false;
                me.taskEditForm.taskNameError('Task name is required');
            }
            return valid;
        }

        newTask = () => {
            let me = this;
            me.clearErrors();
            me.taskEditForm.id(0);
            me.taskEditForm.active(true);
            me.taskEditForm.namespace('');
            me.taskEditForm.comments('');
            me.taskEditForm.enddate('');
            me.taskEditForm.frequency('1');
            me.assignSelectedFrequencyUnit('hours');
            me.taskEditForm.inputs('');
            me.taskEditForm.startdate('');
            me.taskEditForm.enddate('');
            me.taskEditForm.taskname('');

            jQuery('#edit-task-modal').modal('show');
        };


        updateTask = () => {
            let me = this;
            let request = <ITaskQueueItem> {
                inputs : me.taskEditForm.inputs(),
                frequency: me.taskEditForm.frequency(),
                active : me.taskEditForm.active(),
                taskname: me.taskEditForm.taskname(),
                startdate : me.taskEditForm.startdate(),
                comments : me.taskEditForm.comments(),
                namespace : me.taskEditForm.namespace(),
                enddate: me.taskEditForm.enddate(),
                id: me.taskEditForm.id()
            };
            if (me.validateTask(request)) {
                request.frequency = request.frequency + ' ' + me.taskEditForm.selectedFrequencyUnit().Name;
                request.namespace=request.namespace.replace('\\','::');
                me.taskEditForm.updating(true);
                me.services.executeService( 'peanut.peanut-tasks::UpdateScheduledTask', request,
                    function (serviceResponse: Peanut.IServiceResponse) {
                        if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                            let response = <IUpdateTaskResponse>serviceResponse.Value;
                            if (response.error == 'class') {
                                me.taskEditForm.taskNameError('Cannot create task class');
                                me.taskEditForm.namespaceError('Namespace may be incorrect');
                            }
                            else {
                                me.taskQueue(response.schedule);
                                jQuery('#edit-task-modal').modal('hide');
                            }
                        }
                    }).fail(() => {
                        jQuery('#edit-task-modal').modal('hide');
                        let trace = me.services.getErrorInformation();
                    }).always(() => {
                        me.taskEditForm.updating(false);
                    });

            }
        };


    }
}