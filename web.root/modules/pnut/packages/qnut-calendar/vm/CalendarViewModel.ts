/// <reference path="../../../../pnut/core/ViewModelBase.ts" />
/// <reference path='../../../../typings/knockout/knockout.d.ts' />
/// <reference path='../../../../typings/moment/moment.d.ts' />
/// <reference path='../../../../pnut/core/peanut.d.ts' />
/// <reference path='../../../../typings/lodash/find/index.d.ts' />
/// <reference path='../../../../typings/lodash/findIndex/index.d.ts' />
/// <reference path='../../../../typings/lodash/each/index.d.ts' />
/// <reference path='../../../../typings/lodash/first/index.d.ts' />
/// <reference path='../../../../typings/lodash/reject/index.d.ts' />
/// <reference path='../../../../typings/lodash/filter/index.d.ts' />

namespace QnutCalendar {
    interface Moment extends moment.Moment {}  // for syntactical help

    interface ICalendarEvent {
        id : any;
        title : string;
        start : string;
        end : string;
        location: string;
        allDay : string;
        url : string;
        eventType : string;
        backgroundColor : string;
        borderColor : string;
        textColor : string;
        repeatPattern : string;
        repeatInstance : any;
    }

    interface ICalendarEventObject {
        id : any;
        title : string;
        start : Moment;
        end : Moment;
        allDay : boolean;
        location: string;
        url : string;
        eventType : string;
        repeatPattern : string;
        repeatInstance : any;
    }

    interface ICalendarEventDetails extends ICalendarEvent {
        eventTypeId: any;
        notes: string;
        recurId: any;
        resources: Peanut.ILookupItem[];
        committees: Peanut.ILookupItem[];
        createdBy: string;
        createdOn: string;
        changedBy: string;
        changedOn: string;
    }

    interface IGetCalendarResponse {
        events: ICalendarEvent[];
        startDate: string;
        endDate: string;
    }

    interface ICalendarTranslations {
        daysOfWeek: string[];
        daysOfWeekPlural: string[];
        monthNames: string[];
        month: string;
        months: string;
        day: string;
        days: string;
        week: string;
        weeks: string;
        weekday: string;
        weekdays: string;
        year: string;
        years: string;
        ordinals: string[];
        to: string;
        from: string;
        of: string;
        in: string;
        on: string;
        the: string;
        through: string;
        starting: string;
        each: string;
        every: string;
        since: string;
        until: string;
        repeating: string;
        ordinalSuffix: string[]
    }

    interface ICalendarInitResponse extends IGetCalendarResponse {
        events: ICalendarEvent[];
        userPermission: string;
        types: Peanut.ILookupItem[];
        committees: Peanut.ILookupItem[];
        resources: Peanut.ILookupItem[];
        translations : string[];
        vocabulary: ICalendarTranslations;
    }
    
    export class calendarEventObservable {
        id : any = 0;
        repeatPattern : string = '';
        repeatInstance : any = null;

        // view
        title = ko.observable('');
        startDate = ko.observable('');
        startTime = ko.observable('');
        endDate = ko.observable('');
        endTime = ko.observable('');
        repeating = ko.observable(false);
        allDay = ko.observable<Boolean>(false);
        location = ko.observable('');
        url = ko.observable('');
        eventType = ko.observable('');
        eventTime = ko.observable('');
        repeatText = ko.observable('');

        // edit
        eventTypeId: any;
        notes = ko.observable('');
        resources: any[];
        committees: any[];
        createdBy = ko.observable('');
        createdOn = ko.observable('');
        changedBy = ko.observable('');
        changedOn = ko.observable('');

        vocabulary : ICalendarTranslations = null;

        formatDateRange(startMoment : Moment, endMoment: Moment,allDay) {
            // moment formatting: http://momentjs.com/docs/#/displaying/
            let me = this;
            if (!startMoment) {
                return '';
            }
            let startDay = startMoment.format('ddd MMM D, YYYY');
            let startTime = allDay ? '' : startMoment.format(' h:mm a');
            if (!endMoment) {
                return startDay + startTime;
            }
            let endDay = endMoment.format('ddd MMM D, YYYY');
            let endTime  = '';
            if (startDay == endDay) {
                endTime = allDay ? '' : me.vocabulary.to + endMoment.format(' h:mm a');
                return startDay + startTime + endTime;
            }
            endTime = allDay ? '' : endMoment.format(' h:mm a');
            return startDay + startTime + me.vocabulary.to + endDay + endTime;
        }

        formatRepeatDates(start: Moment, end: Moment) {
            if (end == null) {
                return this.vocabulary.starting + start.format("MMM D, YYYY")
            }
            return this.vocabulary.from + start.format("MMM D, YYYY") + this.vocabulary.until + start.format("MMM D, YYYY");
        }
        translateDows(pattern: string) {
            let count = pattern.length;
            let dows = [];
            for (let i = 0; i < count; i++) {
                let n = Number(pattern.charAt(i));
                dows.push(this.vocabulary.daysOfWeek[n-1]);
            }
            return dows.join(', ');

        }

        ordinalDow(n,d) {
            return this.vocabulary.ordinals[Number(n) -1] + ' ' +
                this.vocabulary.daysOfWeek[Number[d] - 1];
        }

        asOrdinal(n: string) {
            let i = (Number(n) >= this.vocabulary.ordinalSuffix.length) ? n.toString().slice(-1) : Number(n);
            return n + this.vocabulary.ordinalSuffix[i];
        }

        getMonthName(n: string) {
            return this.vocabulary.monthNames[Number(n) - 1];
        }

        getRepeatText(repeatPattern: string) {
            let result = '';
            let start : moment.Moment = null;
            let end : moment.Moment = null;
            let parts = repeatPattern.split(';');
            if (parts.length > 0) {
                repeatPattern = parts[0];
                if (parts.length > 1) {
                    let dates = parts[1].split(',');
                    start = moment(dates[0]);
                    if (dates.length > 1) {
                        end = moment(dates[1])
                    }
                }
            }

            let patternParts = repeatPattern.substring(2).split(',');
            let interval = patternParts.length == 0 ? 0 :  Number(patternParts[0]);

            switch (repeatPattern.substring(0,2)) {
                case 'dd' :
                    return interval > 1 ?
                        this.vocabulary.every + ' ' + interval + ' ' + this.vocabulary.days + ' ' + this.formatRepeatDates(start,end):
                        this.vocabulary.every + ' ' + this.vocabulary.day + ' ' + this.formatRepeatDates(start,end);

                case 'dw' :
                    return interval > 1 ?
                        this.vocabulary.every + ' ' + interval + ' ' + this.vocabulary.weekdays + ' ' + this.formatRepeatDates(start,end):
                        this.vocabulary.every + ' ' + this.vocabulary.weekday + ' ' + this.formatRepeatDates(start,end);

                case 'wk' :
                    return interval > 1 ?
                        this.vocabulary.every + ' ' + interval + ' ' + this.vocabulary.weeks + this.vocabulary.on + this.translateDows(patternParts[1]) + this.formatRepeatDates(start,end):
                        this.vocabulary.every + ' ' + this.vocabulary.week + this.vocabulary.on + this.translateDows(patternParts[1]) + this.formatRepeatDates(start,end);

                case 'md' :
                    return interval > 1 ?
                        this.vocabulary.every + ' ' + interval + ' ' + this.vocabulary.months + this.vocabulary.on + this.vocabulary.the + this.asOrdinal(patternParts[1]) + ' ' + this.formatRepeatDates(start,end):
                        this.vocabulary.every + ' ' + this.vocabulary.month + this.vocabulary.on + this.vocabulary.the +  this.asOrdinal(patternParts[1]) + ' ' + this.formatRepeatDates(start,end);

                case 'mo' :
                    return interval > 1 ?
                        this.vocabulary.every + ' ' + interval + ' ' + this.vocabulary.months + this.vocabulary.on + this.vocabulary.the
                            + this.ordinalDow(patternParts[1],patternParts[2]) + ' '
                            + this.formatRepeatDates(start,end) :
                        this.vocabulary.every + ' ' + this.vocabulary.month + this.vocabulary.on + this.vocabulary.the +
                            + this.ordinalDow(patternParts[1],patternParts[2]) + ' '
                            + this.formatRepeatDates(start,end);

                case 'yd' :
                    return interval > 1 ?
                        this.vocabulary.every + ' ' + interval + ' ' + this.vocabulary.years + this.vocabulary.on +
                            this.getMonthName(patternParts[1]) + ' ' + patternParts[2] :
                        this.vocabulary.every + ' ' + this.vocabulary.year + this.vocabulary.on +
                            this.getMonthName(patternParts[1]) + ' ' + patternParts[2];

                case 'yo' :
                    return interval > 1 ?
                        this.vocabulary.every + ' ' + interval + ' ' + this.vocabulary.years + this.vocabulary.on + this.vocabulary.the
                            + this.ordinalDow(patternParts[1],patternParts[2]) + ' '
                            + this.formatRepeatDates(start,end) :
                        this.vocabulary.every + ' ' + this.vocabulary.month + this.vocabulary.on + this.vocabulary.the +
                            + this.ordinalDow(patternParts[1],patternParts[2]) + ' '
                            + this.formatRepeatDates(start,end);

                default:
                    return '(error: invalid pattern)';
            }
        }

        clear = () => {
            let me = this;
            me.title('');
            me.startDate('');
            me.endDate('');
            me.startTime('');
            me.endTime('');
            me.allDay(false);
            me.location('');
            me.repeating(false);
            me.url('');
            me.eventType('');
            me.eventTypeId = 0;
            me.notes('');
            me.resources = [];
            me.committees = [];
            me.createdBy('');
            me.createdOn('');
            me.changedBy('');
            me.changedOn('');
            me.repeatPattern = '';
            me.repeatText('');
            me.repeatInstance = 0;
        };

        assignFromCalendarObject = (event: ICalendarEventObject) => {
            let me = this;
            me.id = event.id;

            let range = me.formatDateRange(event.start,event.end,event.allDay);
            me.eventTime(range);

            let startDate = event.start ? event.start.format('YYYY-MM-DD'): '';
            let startTime = event.start ? event.start.format('HH:mm'): '';
            let endDate = event.start ? event.start.format('YYYY-MM-DD'): '';
            let endTime = event.start ? event.start.format('HH:mm'): '';

            me.startDate(startDate);
            me.startTime(startTime);
            me.endDate(endDate);
            me.endTime(endTime);
            me.repeatInstance = event.repeatInstance;
            me.repeatPattern = event.repeatPattern;
            me.title(event.title);
            me.allDay(event.allDay);
            me.location(event.location);
            me.url(event.url);
            me.eventType(event.eventType);
            me.repeating(!!event.repeatPattern);
            me.repeatText(me.repeating() ? me.getRepeatText(event.repeatPattern) : '');
        };

        assign = (event: ICalendarEvent) => {
            let me = this;

            // todo assign dates and times
            me.repeatInstance = event.repeatInstance;
            me.repeatPattern = event.repeatPattern;
            me.title(event.title);
            me.allDay(event.allDay == '1');
            me.url(event.url);
            me.eventType(event.eventType);
        };

        assignDetails = (event: ICalendarEventDetails) => {
            let me = this;
            me.eventTypeId = event.eventTypeId ;
            me.notes (event.notes );
            me.resources = event.resources ;
            me.committees = event.committees;
            me.createdBy(event.createdBy);
            me.createdOn(event.createdOn );
            me.changedBy(event.changedBy );
            me.changedOn(event.changedOn );
        };

    }

    export class calendarPage {
        month: number;
        year: number;
        startDate: Date;
        endDate: Date;

        constructor(year: any, month: any, startDate: string, endDate: string)  {
            this.month = month;
            this.year = year;
            this.startDate = new Date(startDate + 'T00:00:00');
            this.endDate = new Date(endDate  + 'T00:00:00');

        }

        static compareDate(yourDate: string, myDate: Date) {
            let compDate = new Date(yourDate);
            if (compDate > myDate) {
                return 1;
            }
            if (compDate < myDate) {
                return -1;
            }
            return 0;
        }
        compareStart = (isoDate: string) => {
            return calendarPage.compareDate(isoDate, this.startDate)
        };

        compareEnd = (isoDate: string) => {
            return calendarPage.compareDate(isoDate, this.endDate)
        };

        getNextMonth = () => {
            let response = {
                year: this.year,
                month: this.month + 1
            };
            if (response.month == 13) {
                response.year++;
                response.month = 1;
            }
            return response;
        };
        
        getPrevMonth = () => {
            let response = {
                year: this.year,
                month: this.month - 1
            };
            if (response.month == 0) {
                response.year--;
                response.month = 12;
            }
            return response;
        };
    }

    export class CalendarViewModel extends Peanut.ViewModelBase {
        // observables

        test = ko.observable();

        events : ICalendarEvent[] = [];
        eventSource : ICalendarEvent[];

        lo: any; // alias for lodash _(), to prevent conflicts with underscore.js

        userPermission = ko.observable('view');
        menuVisible = ko.observable(false);

        eventForm = new calendarEventObservable();
        eventTypes = ko.observableArray<Peanut.ILookupItem>();
        committees = ko.observableArray<Peanut.ILookupItem>();
        resources = ko.observableArray<Peanut.ILookupItem>();

        filtered = ko.observable('all');
        filterCode = ko.observable('');
        filterMessage = ko.observable('');

        pages: calendarPage[] = [];
        currentPage = -1;

        private calendar : JQuery;
        private eventInfoModal : JQuery;


        init(successFunction?: () => void) {
            let me = this;
            console.log('calendar Init');
            me.eventInfoModal = jQuery('#event-info-modal');
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
                    let request = {
                        initialize: 1
                    };

                    me.getNewCalendar(request,(response: ICalendarInitResponse) => {
                        // me.addAllTypesItem(response.types);
                        me.eventTypes(response.types);
                        me.userPermission(response.userPermission);
                        me.addTranslations(response.translations);
                        me.eventForm.vocabulary = response.vocabulary;
                        if (response.userPermission=='edit') {
                            me.resources(response.resources);
                            me.committees(response.committees);
                            me.menuVisible(true);
                        }
                        me.showCalendar(response.events);
                        me.bindDefaultSection();
                        successFunction();
                    });
                });
            });
        }

        getEvents = (request: any, successFunction? : (response: IGetCalendarResponse) => void) => {
            let me = this;
            me.services.executeService('peanut.qnut-calendar::GetEvents', request,
                (serviceResponse: Peanut.IServiceResponse) => {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        let response = <IGetCalendarResponse>serviceResponse.Value;
                        let responseEvents = response.events; 
                        response.events = [];
                        me.lo.forEach(responseEvents,(value: any) => {
                            value.allDay = value.allDay == '1';
                            response.events.push(value);
                        });
                        responseEvents = null;
                        if (successFunction) {
                            successFunction(response);
                        }
                    }
                })
                .fail(() => {
                    let trace = me.services.getErrorInformation();
                })
        };


        getNewCalendar = (request: any, successFunction? : (response: IGetCalendarResponse) => void) => {
            let me = this;
            let month = me.getCurrentMonth();
            if (!request) {
                request = month;
            }
            else {
                request.year = month.year;
                request.month = month.month;
            }
            me.getEvents(request, (response: IGetCalendarResponse) => {
                me.pages = [new calendarPage(request.year,request.month,response.startDate,response.endDate)];
                me.currentPage = 0;
                if (successFunction) {
                    successFunction(response);
                }
            })
        };


        showCalendar(events) {
            let me = this;
            me.events = me.lo.sortBy(events, ['start']);
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

        getCurrentMonth() {
            let me = this;
            if (me.currentPage < 0) {
                return {
                    year: new Date().getFullYear(),
                    month:  new Date().getMonth() + 1,
                };
            }
            else {
                let page = me.pages[me.currentPage];
                return {
                    year: page.year,
                    month: page.month
                }
            }

        }

        clearFilter = (successFunction? : () => void) => {
            let me = this;
            let currentFilter= me.filtered();
                if (currentFilter !== 'type' && currentFilter != 'all') {
                    me.getNewCalendar(me.getCurrentMonth(),(response: IGetCalendarResponse) => {
                        me.events = me.lo.sortBy(response.events, ['start']);
                        me.setFilter(me.events);
                        if (successFunction) {
                            successFunction();
                        }
                    });
            }
            else {
                me.setFilter(me.events);
                if (successFunction) {
                    successFunction();
                }
            }
        };

        setFilter = (events: any[], filter = 'all', message = '', code = '') => {
            let me = this;
            me.filtered(filter);
            me.filterCode(code);
            me.switchEventSource(events);
            me.filterMessage(message);
        };

        setTypeFilter(item: any) {
            let me = this;
            let events = me.lo.filter(me.events, (event: ICalendarEvent) => {
                return event.eventType == item.code;
            });
            me.setFilter(events,'type',item.description,item.code);
        }

        filterEventType = (item: any) => {
            let me = this;
            let filter = 'type';

            let currentFilter = me.filtered();
            let currentCode = me.filterCode();
            if (!(currentFilter == filter && currentCode == item.code)) {
                if (currentFilter == filter || currentFilter == 'all' ) {
                    me.setTypeFilter(item);
                }
                else {
                    // refetch events before filter
                    me.getNewCalendar(null,(response: IGetCalendarResponse) => {
                            me.events = response.events;
                            me.setTypeFilter(item);
                        });
                }
            }
        };

        getFilteredEvents = (filter: string, item: any) => {
            let me = this;
            if (me.filtered() != filter) {
                me.getNewCalendar(
                    {
                        filter: filter,
                        code: item.code
                    },(response: IGetCalendarResponse) => {
                        me.events = response.events;
                        me.setFilter(this.events,filter,item.description,item.code);
                    });
            }
        };

        filterCommittee = (item: any) => {
            this.getFilteredEvents('committee',item);
        };

        filterResource = (item: any) => {
            this.getFilteredEvents('resource',item);
        };

        onViewRender = (view,element) => {
            let me = this;
            if (me.currentPage >= 0) {
                me.pageCalendar(view.start,view.end);
            }
        };

        pageCalendar = (start: moment.Moment,end:moment.Moment) => {
            let me = this;
            let startDate = start.format('Y-M-D');
            let endDate = end.format('Y-M-D');
            // console.log('PAGING: start=' + startDate + '; end='+endDate);

            let page = me.pages[me.currentPage];
            let movePage = 0;
            if (page.compareStart(startDate) == -1) {
                console.log('Page prev');
                movePage = -1;
            }
            else if (page.compareEnd(endDate) > 0) {
                console.log('Page next');
                movePage = 1;
            }
            else {
                return;
            }
            let newPage = me.currentPage + movePage;
            if (newPage <0 || newPage >= me.pages.length) {
                me.getNextPage(movePage);
            }
            else {
                me.currentPage = newPage;
            }
        };

        getNextPage = (movePage: number) => {
            let me = this;
            let page =me.pages[me.currentPage];

            let request = null;
            if (movePage > 0) {
                request = page.getNextMonth();
                request.pageDirection = 'right';
                console.log('Get next page ' + request.pageDirection + ' ' + request.year + '-' + request.month);
            }
            else {
                request = page.getPrevMonth();
                request.pageDirection = 'left';

                console.log('Get prev page'+ request.pageDirection + ' ' + request.year + '-' + request.month);
            }

            if (me.filtered() != 'all' && me.filtered() != 'type') {
                request.filter = me.filtered();
                request.code = me.filterCode();

            }

            me.getEvents(request, (response: IGetCalendarResponse) => {
                let events = me.events.concat(response.events);
                me.events = me.lo.sortBy(events, ['start']);
                if (me.filtered() === 'type') {
                    let code = me.filterCode();
                    let events = me.lo.filter(me.events, (event: ICalendarEvent) => {
                        return event.eventType == code;
                    });
                }
                let newPage = new calendarPage(request.year,request.month,response.startDate,response.endDate);
                if (movePage > 0) {
                    me.currentPage = me.pages.length;
                    me.pages.push(newPage);
                }
                else {
                    me.currentPage = 0;
                    me.pages.unshift(newPage);
                }
                me.switchEventSource(events);
            })
        };

        onEventClick = (calEvent, jsEvent, view) => {
            let me = this;
            me.eventForm.assignFromCalendarObject(calEvent);
            me.eventInfoModal.modal('show');


            /*
              alert('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);
              alert('View: ' + view.name);
            let x = jsEvent.clientX;
            let y = jsEvent.clientY;


             */


        };

        onNewEvent = () => {
            alert('new event');
        };

        onEditEvent = () => {
            alert('edit');
        };

        getEventDetails = () => {
            let me = this;
            me.services.executeService('peanut.qnut-calendar::GetEventDetails', me.eventForm.id,
                (serviceResponse: Peanut.IServiceResponse) => {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        let response = <ICalendarEventDetails>serviceResponse.Value;
                        me.eventForm.assignDetails(response);
                    }
                })
                .fail(() => {
                    let trace = me.services.getErrorInformation();
                })

        }


    }
}
