/// <reference path="../../../../pnut/core/ViewModelBase.ts" />
/// <reference path='../../../../typings/knockout/knockout.d.ts' />
/// <reference path='../../../../pnut/core/peanut.d.ts' />
/// <reference path='../../../../typings/lodash/find/index.d.ts' />
/// <reference path='../../../../typings/lodash/findIndex/index.d.ts' />
/// <reference path='../../../../typings/lodash/each/index.d.ts' />
/// <reference path='../../../../typings/lodash/first/index.d.ts' />
/// <reference path='../../../../typings/lodash/reject/index.d.ts' />
/// <reference path='../../../../typings/lodash/filter/index.d.ts' />

namespace QnutCalendar {

    interface ICalendarEvent {
        id : any;
        title : string;
        start : string;
        end : string;
        allDay : string;
        url : string;
        eventType : string;
        backgroundColor : string;
        borderColor : string;
        textColor : string;
        repeatPattern : string;
        repeatInstance : string;
    }

    interface IGetCalendarResponse {
        events: ICalendarEvent[];
        eventCount: number;
        userPermission: string;
        types: Peanut.ILookupItem[];
        committees: Peanut.ILookupItem[];
        resources: Peanut.ILookupItem[];
    }

    export class CalendarViewModel extends Peanut.ViewModelBase {
        // observables

        test = ko.observable();

        monthStartDate = null;
        monthEndDate = null;

        eventCount = 0;
        events : ICalendarEvent[] = [];
        eventSource : ICalendarEvent[];

        lo: any; // alias for lodash _(), to prevent conflicts with underscore.js

        userPermission = ko.observable('view');
        menuVisible = ko.observable(false);

        eventTypes = ko.observableArray<Peanut.ILookupItem>();
        committees = ko.observableArray<Peanut.ILookupItem>();
        resources = ko.observableArray<Peanut.ILookupItem>();

        filtered = ko.observable('all');
        filterCode = ko.observable('');
        filterMessage = ko.observable('');

        private calendar : JQuery;


        init(successFunction?: () => void) {
            let me = this;
            // jQuery('head').append('<link rel="stylesheet" type="text/css" href="/application/assets/js/libraries/fullcalendar/fullcalendar.print.css media=print">');
            console.log('calendar Init');
            me.application.loadStyleSheets([
                '@lib:fullcalendar-css',
                '@lib:fullcalendar-print-css media=print'
            ]);
            me.application.loadResources([
                '@lib:moment-js'
            ], () => {
                me.application.loadResources([
                    '@lib:fullcalendar-js',
                    '@lib:lodash'
                ], () => {
                    me.lo = _.noConflict(); // avoid conflict with underscore.js
                    me.services.executeService('peanut.qnut-calendar::GetEvents', {initialize: 1},
                        (serviceResponse: Peanut.IServiceResponse) => {
                            if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                                let response = <IGetCalendarResponse>serviceResponse.Value;
                                let responseEvents = response.events;
                                me.lo.forEach(responseEvents,(value: any) => {
                                    me.events.push(value);
                                });
                                responseEvents = null;
                                me.monthStartDate = null;
                                me.monthEndDate = null;
                                me.addAllTypesItem(response.types);
                                me.eventTypes(response.types);
                                me.userPermission(response.userPermission);
                                if (response.userPermission=='edit') {
                                    me.addAllItem(response.resources,'resources');
                                    me.resources(response.resources);
                                    me.addAllItem(response.committees,'committees');
                                    me.committees(response.committees);
                                    me.menuVisible(true);
                                }
                                me.showCalendar(me.events);

                            }
                            me.bindDefaultSection();
                            successFunction();
                        })
                        .fail(() => {
                            let trace = me.services.getErrorInformation();
                        })
                });
            });
        }

        private addAllTypesItem(lookup : any[]) {
            let itemName = 'event types';
            lookup.unshift({
                id: 0,
                code: 'all',
                name: 'All ' + itemName,
                description: 'Show all ' + itemName,
                color: '#ffffff'
            });
        }

        private addAllItem(lookup : Peanut.ILookupItem[],itemName: string) {
            // todo: support translation
            lookup.unshift({
                id: 0,
                code: 'all',
                name: 'All ' + itemName,
                description: 'Show all ' + itemName
            });
        }

        showCalendar(events) {
            let me = this;
            me.eventSource = events;
            me.filtered('all');
            me.calendar = jQuery('#calendar');
            me.calendar.fullCalendar({
                    header: {
                        left: 'prev,next today',
                        center: 'title',
                        right: 'month,basicWeek,basicDay'
                    },
                    // defaultDate: '2017-12-12',
                    navLinks: true, // can click day/week names to navigate views
                    editable: true,
                    eventLimit: true, // allow "more" link when too many events
                    eventClick: me.onEventClick,
                    viewRender: me.onViewRender,
                    fixedWeekCount : false,
                    events: <any>me.eventSource
                });

            // for reasons unknown, calendar is incorrectly sized on load. This fixes the problem (for reasons unknown)
            let t = window.setInterval(() => {
                me.calendar.fullCalendar('render');
                //jQuery('#calendar').fullCalendar('render');
                clearInterval(t);
            }, 100);
        }

        switchEventSource = (newSource: any) => {
            let me = this;
            me.calendar.fullCalendar('removeEventSource',me.eventSource);
            me.eventSource = newSource;
            me.calendar.fullCalendar('addEventSource', newSource);

        };

        clearFilter() {
            let me = this;
            if (me.filtered() !== 'all') {
                me.switchEventSource(me.events);
                me.filtered('all');
                me.filterMessage('');
            }
        }

        filterEventType = (item: any) => {
            let me = this;
            let filter = 'type';
            if (item.code === 'all') {
                me.clearFilter();
            }
            else if (!(me.filtered() === filter &&  me.filterCode() === item.code)) {
                let events = me.lo.filter(me.events, (event: ICalendarEvent) => {
                    return event.eventType == item.code;
                });
                me.filtered(filter);
                me.filterCode(item.code);
                me.switchEventSource(events);
                let name = item.name;
                me.filterMessage(item.description);
            }
        }

        filterCommittee = (item: any) => {
            let me = this;
            let filter = 'committee';
            if (item.code === 'all') {
                me.clearFilter();
            }
            else if (!(me.filtered() === filter &&  me.filterCode() === item.code)) {
                alert('Filter ' + filter + ' ' + item.code);
                // todo: implement filer
                me.filtered(filter);
                me.filterCode(item.code);
                let name = item.name;
                if (name.indexOf('committee') === -1) {
                    name += ' Committee';
                }
                me.filterMessage(name);
            }

        };

        filterResource = (item: any) => {
            let me = this;
            let filter = 'resource';
            if (item.code === 'all') {
                me.clearFilter();
            }
            else if (!(me.filtered() === filter &&  me.filterCode() === item.code)) {
                alert('Filter ' + filter + ' ' + item.code);
                // todo: implement filer
                me.filtered(filter);
                me.filterCode(item.code);
                me.filterMessage('Reserved: ' + item.name);
            }
        };

        onEventClick = (calEvent, jsEvent, view) => {
            let me = this;
            alert('Event: ' + calEvent.title);
           //  alert('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);
//            alert('View: ' + view.name);


        };

        onViewRender = (view,element) => {
            let me = this;
            if (view.start) {
                let startDate = view.start.format('Y-M-D');
                if (view.end) {
                    let endDate = view.end.format('Y-M-D');
                    me.test(startDate + ' to ' + startDate);
                    if (me.monthStartDate == null) {
                        me.monthStartDate =startDate;
                        me.monthStartDate=endDate;
                    }
                    else if (startDate >= me.monthStartDate || endDate > me.monthEndDate ) {
                        console.log('refresing ' + me.test());
                    }
                }
            }
        };

        onNewEvent = () => {
            alert('new event');
        };


    }
}
