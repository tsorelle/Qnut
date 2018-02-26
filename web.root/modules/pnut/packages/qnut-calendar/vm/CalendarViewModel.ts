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

    import ILookupItem = Peanut.ILookupItem;

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
        description: string;
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
        userPermission: any;
        types: Peanut.ILookupItem[];
        committees: Peanut.ILookupItem[];
        resources: Peanut.ILookupItem[];
        translations : string[];
        vocabulary: ICalendarTranslations;
    }
    
    interface IDateTime {
        date: Moment;
        time: number;
    }

    export class Momentito {
        public static dateOnly(m: Moment) {
            return moment(m.format('YYYY-MM-DD[T]00:00:00'));
        }
        public static clone(m: Moment, useCurrentLocale = true) {
            return useCurrentLocale ? m.clone() : moment(m.format());
        }
        public static normalize(m: Moment) {
             return moment(m.format('YYYY-MM-DD[T]HH:mm:00'));
        }
        public static toIsoString(m: Moment) {
            return m.format('YYYY-MM-DD[T]HH:mm:00');
        }
        
        public static parse(m: Moment = null, normalize = true) {
            if (!m) {
                m = moment(); // today
            }
            let t = normalize ? moment(m.format('YYYY-MM-DD[T]HH:mm:00')) : m.clone();
            return <IDateTime> {
                date: moment(t.format('YYYY-MM-DD[T]00:00:00')),
                time: (t.hours() * 60) + t.minutes()
            };
        }

        public static formatTime(value: number, format = 12) {

        }
        
        public static getTimeValue(m: Moment, normalize = true) {
            let t = normalize ? moment(m.format('YYYY-MM-DD[T]HH:mm:00')) : m;
            let h = t.hour();
            let min = t.minute();
            return (h*60) + min;
        }

        public static getStringValue(n: number) {
            let s = n.toString();
            return s.length == 1 ? '0' + s : s;
        }

        public static momentFromString(s: string) {
            let date = new Date(s);
            let d = this.getStringValue(date.getDate());
            let m = this.getStringValue(date.getMonth() + 1);
            let iso = date.getFullYear().toString()+'-'+m+ '-' + d + 'T00:00:00';
            return moment(iso);
            // return moment(date.toISOString());
        }
    }

    export class timeHelper {
        static timeStringToValue(time: string) {
            if (time === null) {
                return '';
            }
            time = time.replace(/\s/g, '').toLowerCase().trim();
            if (time === '') {
                return null;
            }
            // console.log('time: ' + time);
            let am = time.indexOf('a');
            let p = am;
            let pm = -1;
            if (am === -1) {
                pm = time.indexOf('p');
                p = pm
            }

            if (p > -1) {
                let a = time.substring(p);
                if (a !== 'a' && a !== 'am' && a !== 'p' && a !== 'pm') {
                    return -1;
                }
                time = time.substring(0, p).trim();
                if (time === '') {
                    // console.log('no time');
                    return -1;
                }
            }
            let parts = time.split(':');
            if (parts.length === 0)  {
                return null;
            }
            let h = parts.shift().trim();
            if (h === '' && parts.length === 0) {
                return null;
            }

            let hours = Number(h);
            if (isNaN(hours) || Math.floor(hours) !== hours || hours < 0) {
                // console.log('Bad hour: ' + hours + '(' + h);
                return -1;
            }

            if (am > -1) {
                if (hours === 12) {
                    hours = 0;
                }
                else if (hours > 12) {
                    return -1;
                }
            }
            else if (pm > -1) {
                if (hours > 12) {
                    return -1;
                }
                if (hours !== 12) {
                    hours += 12;
                }
            }

            if (hours > 23) {
                // console.log('too many hours: ' + hours);
                return -1;
            }
            let minutes = 0;
            if (parts.length > 0) {
                let m = parts.shift().trim();
                if (m ==='' && h ==='') {
                    return null;
                }
                minutes = (!m) ? 0 : Number(m);
                if (isNaN(minutes) || Math.floor(minutes) !== minutes || minutes > 59 || minutes < 0) {
                    return -1;
                }
            }
            // console.log('h:' + hours + ' m:' + minutes);
            return (hours * 60) + minutes;
        }

        static timeValueToString = (value: any, hourFormat = 12) => {
            if (value === null) {
                return '';
            }
            if (isNaN(value) || value < 0 || value > 1439) {
                return 'invalid'
            }
            if (value === null) {
                return '';
            }
            let hour = Math.floor(value / 60);
            let hourString = hour.toString();
            let minString = (value % 60).toString();
            if (minString.length === 1) {
                minString = '0' + minString;
            }
            if (hourFormat === 12) {
                minString += hour > 11 ? ' PM' : ' AM';
                hour %= 12;
                hourString = hour === 0 ? '12' : hour.toString();
            }
            else {
                if (hourString.length === 1) {
                    hourString = '0' + hourString;
                }
            }
            return hourString + ':' + minString;
        };


    }
    export class eventTimeEditor {
        // varibles
        startDate: Moment;
        endDate: Moment = null;
        startTimeValue : any;
        endTimeValue : any;
        dayCount = 1;

        // observables
        allDay = ko.observable(false);
        startDateText = ko.observable('');
        startTimeText = ko.observable('');
        endDateText = ko.observable('');
        endTimeText = ko.observable('');

        firstRowColumns = ko.observable(3);
        showSecondRow = ko.observable(false);
        conjunction = ko.observable('');
        isCustom = ko.observable(false);
        startTimeList = ko.observableArray([]);
        endTimeList = ko.observableArray([]);
        daylist : KnockoutObservableArray<Peanut.INameValuePair> = ko.observableArray([]);
        selectedDays : KnockoutObservable<Peanut.ILookupItem> = ko.observable();
        endTimeMode = ko.observable(1);
        timeError = ko.observable('');
        timeErrorField = ko.observable('');
        invalidTimeErrorMsg = '';
        invaildTimeOrderErrorMsg = '';
        conjunctionThrough = '';
        conjunctionUntil = '';


        startDateSubscription : any;
        endDateSubscription : any;
        startTimeSubscription : any;
        endTimeSubscription : any;
        dayListSubscription: any;
        allDaySubscription: any;
        subscriptionsActive = false;

        hoursName : string;
        hoursNamePlural : string;
        dateFormat: string;
        timeFormat: string;
        custom: string;
        hourFormat = 12;

        initialize(translator: Peanut.ITranslator) {
            let me = this;

            me.dateFormat = translator.translate('calendar-date-format');
            me.timeFormat = translator.translate('calendar-time-format');
            me.hourFormat = me.timeFormat.toLowerCase().indexOf('a') < 0 ? 24 : 12;
            me.hoursName = translator.translate('calander-hour');
            me.hoursNamePlural = translator.translate('calander-hour-plural');
            me.custom = translator.translate('calendar-set-custorm');
            me.invaildTimeOrderErrorMsg = translator.translate('calender-time-order-error');
            me.invalidTimeErrorMsg = translator.translate('calendar-time-error');
            me.conjunctionThrough = translator.translate('conjunction-through');
            me.conjunctionUntil = translator.translate('conjunction-until');

            if (me.daylist().length == 0) {
                let days = [];
                let daysName = translator.translate('calendar-word-day-plural');
                days.push({Name: '1 ' + translator.translate('calendar-word-day'), Value: 1});
                for (let i = 2; i < 6; i++) {
                    days.push({Name: i + ' ' + daysName, Value: i});
                }
                days.push({Name: me.custom, Value: 6});
                me.daylist(days);
            }
        }

        setTimes(start: Moment = null, end: Moment = null, allDay: boolean = true) {
            let me = this;
            me.suspendSubscriptions();
            me.allDay(allDay);
            me.isCustom(false);

            let startDt = Momentito.parse(start);
            me.startDate = startDt.date;
            me.startDateText(startDt.date.format(me.dateFormat));
            me.startTimeValue = allDay ? null : startDt.time;
            let startList = me.buildTimeList();
            me.startTimeList(me.buildTimeList());
            me.fillEndList();

            me.endDate = null;
            me.endTimeValue = null;
            me.timeError(''); me.timeErrorField('');
            let sameDay = true;
            if (end) {
                let endDt = Momentito.parse(end);
                // if (allDay) {
                //     end.subtract(1,'days');
                // }
                sameDay = me.startDate.isSame(endDt.date);
                if (allDay) {
                    if (sameDay && endDt.date.isAfter(startDt.date.add(5,'days'))) {
                        me.isCustom(true);
                    }
                }
                else {
                    me.endTimeValue = endDt.time;
                }
                if (sameDay) {
                    me.endDate = null;
                }
                else {
                    me.endDate = endDt.date;
                    me.endDateText(me.endDate.format(this.dateFormat));
                }
            }

            let custom = me.isCustom();
            let test = allDay ?  '' : timeHelper.timeValueToString(me.endTimeValue,me.hourFormat);
            me.endTimeText(allDay ?  '' : timeHelper.timeValueToString(me.endTimeValue,me.hourFormat));
            me.startTimeText(allDay ? '' : timeHelper.timeValueToString(startDt.time,me.hourFormat));
            
            me.setLayoutObservables();
            me.activateSubscriptions();
        }

        fillEndList = () => {
            let endList = this.buildTimeList(this.startTimeValue + 30,true);
/*
            if (this.isSameDay() && (!this.isCustom())) {
                endList.push({Name: this.custom, Value: 'custom'});
            }
*/
            this.endTimeList(endList);
        };

        buildTimeList = (start: number=0,showDuration: boolean = false) => {
            let result = [];
            let meridian = '';
            let duration = '';
            let hour = 0;
            let min = 0;
            let format = this.timeFormat.toLowerCase().indexOf('a') < 0 ? 0 : 12;
            if (!showDuration) {
                start = 0;
            }
            for (let value = start; value < 1440; value += 30) {
                let label = timeHelper.timeValueToString(value,this.hourFormat);
                let duration = '';
                if (showDuration) {
                    let hrs = (value - start + 30) / 60;
                    if (hrs > 0) {
                        duration += ' (' + hrs + ' '+ (hrs > 1.0 ? this.hoursNamePlural : this.hoursName) + ')';
                    }
                }
                result.push(
                    {
                        Name: label + duration,
                        Value: value
                    });
            }
            return result;
        };

        suspendSubscriptions = () => {
            if (this.subscriptionsActive) {
                this.endDateSubscription.dispose();
                this.startDateSubscription.dispose();
                this.startTimeSubscription.dispose();
                this.endTimeSubscription.dispose();
                this.dayListSubscription.dispose();
                this.allDaySubscription.dispose();
                this.subscriptionsActive = false;
            }
        };

        activateSubscriptions = () => {
            if (!this.subscriptionsActive) {
                this.startDateSubscription  = this.startDateText.subscribe(this.onStartDateChanged);
                this.endTimeSubscription = this.endTimeText.subscribe(this.onEndTimeChanged);
                this.startTimeSubscription = this.startTimeText.subscribe(this.onStartTimeChanged);
                this.endDateSubscription = this.endDateText.subscribe(this.onEndDateChanged);
                this.dayListSubscription = this.selectedDays.subscribe(this.onDaysChange);
                this.allDaySubscription = this.allDay.subscribe(this.onAllDayChecked);
                this.subscriptionsActive = true;
            }
        };

        onSetCustomClick = () => {
            this.suspendSubscriptions();
            this.setCustomState(true);
            this.setLayoutObservables();
            this.activateSubscriptions();
        };

        setCustomState = (state : boolean = true) => {
            // todo: review this
            if (this.isCustom() !== state) {
                if (state) {
                    if (this.endDate == null || (this.endDate && this.endDate.isBefore(this.startDate))) {
                        this.endDate = this.startDate.clone();
                        this.endDateText(this.startDateText())
                        // this.endDate.add(1,'days');
                        // this.endDateText(this.endDate.format(this.dateFormat));
                    }
                }
                else  {
                    this.endDate = null;
                }
                this.isCustom(state);
            }
        };

        timeValueToString = (value: any) => {
            if (value === null) {
                return '';
            }
            let hour = Math.floor(value / 60);
            let hourString = hour.toString();
            let minString = (value % 60).toString();
            if (this.hourFormat == 12) {
                minString += hour > 11 ? ' PM' : ' AM';
                hour %= 12;
                hourString = hour == 0 ? '12' : hour.toString();
            }
            else {
                if (hourString.length == 1) {
                    hourString = '0' + hourString;
                }
            }
            return hourString + ':' + minString;
        };

        setStartDate = (value: string) => {
            let newDate = Momentito.momentFromString(value);
            if (this.endDate && (this.endDate.isAfter(newDate))) {
                this.timeError(this.invaildTimeOrderErrorMsg);
                this.timeErrorField('startdate');
                return false;
            }
            this.startDate = newDate;
            return true;
        };

        setEndToStart = () => {
            this.endDate = this.startDate.clone();
            this.endDateText(this.startDateText());
        };

        newEndDate = (m: Moment) => {
            this.endDate = m;
            this.endDateText(m.format(this.dateFormat));
        };

        setEndDate = (value: string) => {
            if (value) {
                let newDate = Momentito.momentFromString(value);
                if (newDate.isBefore(this.startDate)) {
                    this.timeError(this.invaildTimeOrderErrorMsg);
                    this.timeErrorField('enddate');
                    return false;
                }
                // this.showSecondRow(true);
                this.endDate = newDate;
            }
            else {
                this.endDate = null;
                //  this.showSecondRow(false);
            }
            return true;
        };

        setEndTime = (value:any) => { // called from dropdown binding
            if (this.startTimeValue > value) { // && !this.endDateText()) { what was i thinking?
                this.timeError(this.invalidTimeErrorMsg);
                this.timeErrorField('endtime');
                return false;
            }
            this.endTimeText(timeHelper.timeValueToString(value, this.hourFormat));
            this.timeError('');
            this.timeErrorField('');
            this.endTimeValue = value;
            return true;
        };

        isSameDay = () => {
            if (this.endDate == null) {
                return true;
            }
            return this.startDate.isSame(this.endDate);
        };

        setStartTime = (value:any) => { // called from dropdown binding
            if  (this.isSameDay() && this.endTimeValue < this.startTimeValue) {
                this.endTimeValue = this.startTimeValue;
                this.endTimeText(timeHelper.timeValueToString(this.endTimeValue, this.hourFormat));
            }
            this.timeError('');
            this.timeErrorField('');
            this.startTimeValue = value;
            this.startTimeText(timeHelper.timeValueToString(value, this.hourFormat));
            return true;
        };

        onStartTimeSelected = (item: any) => { // called from dropdown binding
            if (item) {
                this.suspendSubscriptions();
                this.setStartTime(item.Value);
                this.fillEndList();
                this.setLayoutObservables();
                this.activateSubscriptions();
            }
        };

        onEndTimeSelected = (item:any) => {
            if (item) {
                this.suspendSubscriptions();
                this.setCustomState(item.Value === 'custom');
                if (item.Value !== 'custom') {
                    this.setEndTime(item.Value);
                }
                this.setLayoutObservables();
                this.activateSubscriptions();
            }
        };

        onAllDayChecked = (checked: any) => {
            this.suspendSubscriptions();
            if ( this.isSameDay() ) {
                this.selectedDays(<any>this.daylist()[0]);
                this.isCustom(false);

            }
            this.setLayoutObservables();
            this.activateSubscriptions();
        };

        onStartDateChanged = (value: any) => {
            this.suspendSubscriptions();
            this.setStartDate(value);
            this.activateSubscriptions();
        };

        onEndDateChanged = (value: any) => {
            this.suspendSubscriptions();
            this.setEndDate(value);
            this.activateSubscriptions();
        };

        onEndTimeChanged = (value: any) => {
            this.suspendSubscriptions();
            let time = timeHelper.timeStringToValue(value);
            if (time < 0) {
                this.timeError(this.invalidTimeErrorMsg);
                this.timeErrorField('endtime');
            }
            else {
                this.endTimeValue = time;
                this.endTimeText(value);
            }
            this.activateSubscriptions();
        };

        onStartTimeChanged = (value: any) => {
            this.suspendSubscriptions();
            let time = timeHelper.timeStringToValue(value);
            if (time < 0) {
                this.timeError(this.invalidTimeErrorMsg);
                this.timeErrorField('starttime');
            }
            else {
                this.startTimeValue = time;
                if (this.isSameDay() && this.endTimeValue < this.startTimeValue) {
                    this.setEndTime(this.startTimeValue);
                }
                this.startTimeText(value);
                this.fillEndList();
            }
            this.activateSubscriptions();
        };

        getLayout = () => {
            if (this.allDay()) {
                if (this.isSameDay() && !this.isCustom()) { // single day
                    return 5; // AFC | AFD
                }
                else { // multiple days
                    return (this.endDate.isSame(this.startDate) && this.isCustom()) ?
                        3 : 4;
                    //return 4;
                    // return (this.isCustom()) ?
                    //     4 : // AEC
                    //     3; // AED
                }
            }
            else { // part of day
                if (this.isSameDay()) {
                    if (!this.isCustom()) {
                        return 1; // BFD
                    }
                }
                return 2; // BEC | BED | BFC
            }
        };


        setDefaultTimes = () => {
            let value = Momentito.parse();
            if (this.startTimeValue === null) {
                this.startTimeValue = value.time;
                this.startTimeText(timeHelper.timeValueToString(this.startTimeValue, this.hourFormat));
            }
            if (this.endDate == null) {
                this.setEndToStart();
            }
            if (this.endTimeValue === null || this.endTimeValue < this.startTimeValue) {
                this.setEndTime(this.startTimeValue);
                this.fillEndList();
            }
        };

        setLayoutObservables = () => {
            let layout = this.getLayout();
            let columns = 2;
            switch(layout) {
                case 1: // BFD
                    if (this.startTimeValue === null) {
                        this.setDefaultTimes();
                    }
                    columns =  3; // this.startTimeValue === null ? 2 : 3;
                    this.endTimeMode(1);
                    this.conjunction('');
                    break;
                case 2: // // BEC | BED | BFC
                    this.endTimeMode(1);
                    this.conjunction(this.conjunctionUntil);
                    break;
                case 3: // AED
                    this.endTimeMode(this.isCustom() ? 0 : 2);
                    this.conjunction(this.conjunctionThrough);
                    break;
                case 4: // AEC
                    this.endTimeMode(0);
                    this.conjunction(this.conjunctionThrough);
                    break;
                case 5 : // 5: AFC | AFD
                    this.endTimeMode(2);
                    this.conjunction('');
                    break;
                default:
                    console.log('ERROR invalid layout code ' + layout);
                    break;
            }
            if (this.endTimeMode() === 1 && this.endTimeValue === null) {
                this.setDefaultTimes();
            }
            this.firstRowColumns(columns);
            this.showSecondRow(this.isCustom() || (!this.isSameDay()));

        };

        onDaysChange = (item: any) => {
            this.suspendSubscriptions();
            this.setCustomState(item.Value > 5);
            if (item.Value> 1) {
                if (this.endDate === null) {
                    this.setEndToStart();
                }
                this.endDate.add(item.Value - 1,'days');
                let text = moment(this.endDate).format(this.dateFormat);
                this.endDateText(text);
            }
            this.setLayoutObservables();
            this.activateSubscriptions();
        };

    }
    
    export class calendarEventObservable {
        id = ko.observable<any>(null);

        lo: any;

        repeatPattern: string = '';
        repeatInstance: any = null;

        times = new eventTimeEditor();

        title = ko.observable('');
        start: Moment;
        end: Moment;
        allDay = false;

        eventType = ko.observable('');
        addCaption = ko.observable('');
        repeating = ko.observable(false);
        location = ko.observable('');
        url = ko.observable('');
        eventTime = ko.observable('');
        repeatText = ko.observable('');
        committeesText = ko.observable('');
        resourcesText = ko.observable('');
        notesLines = ko.observableArray([]);
        description = ko.observable('');
        titleError = ko.observable('');
        eventTypes = ko.observableArray([]);
        selectedEventType = ko.observable<Peanut.ILookupItem>();

        availableResources = ko.observableArray([]);
        selectedResources = ko.observableArray([]);
        selectedResource = ko.observable();
        resourceSubscription : any = null;

        availableCommittees = ko.observableArray([]);
        selectedCommittees = ko.observableArray([]);
        selectedCommittee = ko.observable();
        committeeSubscription : any = null;

        // edit
        eventTypeId: any;
        notes = ko.observable('');
        createdBy = ko.observable('');
        createdOn = ko.observable('');
        changedBy = ko.observable('');
        changedOn = ko.observable('');

        vocabulary: ICalendarTranslations = null;

        formatDateRange(startMoment: Moment, endMoment: Moment, allDay) {
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
            let endTime = '';
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
                dows.push(this.vocabulary.daysOfWeek[n - 1]);
            }
            return dows.join(', ');

        }

        ordinalDow(n, d) {
            return this.vocabulary.ordinals[Number(n) - 1] + ' ' +
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
            let start: moment.Moment = null;
            let end: moment.Moment = null;
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
            let interval = patternParts.length == 0 ? 0 : Number(patternParts[0]);

            switch (repeatPattern.substring(0, 2)) {
                case 'dd' :
                    return interval > 1 ?
                        this.vocabulary.every + ' ' + interval + ' ' + this.vocabulary.days + ' ' + this.formatRepeatDates(start, end) :
                        this.vocabulary.every + ' ' + this.vocabulary.day + ' ' + this.formatRepeatDates(start, end);

                case 'dw' :
                    return interval > 1 ?
                        this.vocabulary.every + ' ' + interval + ' ' + this.vocabulary.weekdays + ' ' + this.formatRepeatDates(start, end) :
                        this.vocabulary.every + ' ' + this.vocabulary.weekday + ' ' + this.formatRepeatDates(start, end);

                case 'wk' :
                    return interval > 1 ?
                        this.vocabulary.every + ' ' + interval + ' ' + this.vocabulary.weeks + this.vocabulary.on + this.translateDows(patternParts[1]) + this.formatRepeatDates(start, end) :
                        this.vocabulary.every + ' ' + this.vocabulary.week + this.vocabulary.on + this.translateDows(patternParts[1]) + this.formatRepeatDates(start, end);

                case 'md' :
                    return interval > 1 ?
                        this.vocabulary.every + ' ' + interval + ' ' + this.vocabulary.months + this.vocabulary.on + this.vocabulary.the + this.asOrdinal(patternParts[1]) + ' ' + this.formatRepeatDates(start, end) :
                        this.vocabulary.every + ' ' + this.vocabulary.month + this.vocabulary.on + this.vocabulary.the + this.asOrdinal(patternParts[1]) + ' ' + this.formatRepeatDates(start, end);

                case 'mo' :
                    return interval > 1 ?
                        this.vocabulary.every + ' ' + interval + ' ' + this.vocabulary.months + this.vocabulary.on + this.vocabulary.the
                        + this.ordinalDow(patternParts[1], patternParts[2]) + ' '
                        + this.formatRepeatDates(start, end) :
                        this.vocabulary.every + ' ' + this.vocabulary.month + this.vocabulary.on + this.vocabulary.the +
                        +this.ordinalDow(patternParts[1], patternParts[2]) + ' '
                        + this.formatRepeatDates(start, end);

                case 'yd' :
                    return interval > 1 ?
                        this.vocabulary.every + ' ' + interval + ' ' + this.vocabulary.years + this.vocabulary.on +
                        this.getMonthName(patternParts[1]) + ' ' + patternParts[2] :
                        this.vocabulary.every + ' ' + this.vocabulary.year + this.vocabulary.on +
                        this.getMonthName(patternParts[1]) + ' ' + patternParts[2];

                case 'yo' :
                    return interval > 1 ?
                        this.vocabulary.every + ' ' + interval + ' ' + this.vocabulary.years + this.vocabulary.on + this.vocabulary.the
                        + this.ordinalDow(patternParts[1], patternParts[2]) + ' '
                        + this.formatRepeatDates(start, end) :
                        this.vocabulary.every + ' ' + this.vocabulary.month + this.vocabulary.on + this.vocabulary.the +
                        +this.ordinalDow(patternParts[1], patternParts[2]) + ' '
                        + this.formatRepeatDates(start, end);

                default:
                    return '(error: invalid pattern)';
            }
        }

        clear = () => {
            let me = this;
            me.suspendSubscriptions();
            me.id(0);
            me.start = moment();
            me.end = null;
            me.title('');
            me.location('');
            me.repeating(false);
            me.url('');
            me.setEventType();
            me.eventTypeId = 0;
            me.notes('');
            me.selectedResources([]);
            me.selectedCommittees([]);
            me.selectedEventType(null);
            me.createdBy('');
            me.createdOn('');
            me.changedBy('');
            me.changedOn('');
            me.repeatPattern = '';
            me.repeatText('');
            me.repeatInstance = 0;
            me.committeesText('');
            me.resourcesText('');
            me.notes('');
            me.description('');
        };

        setEventType = (code? : any) => {
            let me = this;
            if (!code) {
                code = 'public';
            }
            let type = me.lo.find(me.eventTypes(),(item: Peanut.ILookupItem) => {
                return item.code == code;
            });
            me.selectedEventType(type);
        };

        assignFromCalendarObject = (event: ICalendarEventObject) => {
            let me = this;
            me.id(event.id);
            me.start = event.start;
            me.end = event.end;
            let range = me.formatDateRange(event.start, event.end, event.allDay);
            me.eventTime(range);

            me.repeatInstance = event.repeatInstance;
            me.repeatPattern = event.repeatPattern;
            me.title(event.title);
            me.allDay = event.allDay;
            me.location(event.location);
            me.url(event.url);
            me.eventType(event.eventType);
            me.repeating(!!event.repeatPattern);
            me.repeatText(me.repeating() ? me.getRepeatText(event.repeatPattern) : '');
            me.committeesText('');
            me.resourcesText('');
            me.notes('');
            me.notesLines([]);
            me.changedBy('');
            me.description('');

        };

        assign = (event: ICalendarEvent) => {
            let me = this;

            // todo assign dates and times
            me.repeatInstance = event.repeatInstance;
            me.repeatPattern = event.repeatPattern;
            me.title(event.title);
            me.allDay = (event.allDay == '1');
            me.url(event.url);
            me.eventType(event.eventType);
            me.committeesText('');
            me.resourcesText('');
            me.notesLines([]);

        };

        assignDetails = (event: ICalendarEventDetails) => {
            let me = this;
            me.eventTypeId = event.eventTypeId;
            me.notes(event.notes ? event.notes : '');
            if (event.notes) {
                me.notesLines(event.notes.split('\n'));
            }
            else {
                me.notesLines([]);
            }
            me.selectedResources(event.resources);
            me.assignText(event.resources, me.resourcesText);
            me.description(event.description ? event.description : '');
            me.selectedCommittees(event.committees);
            me.assignText(event.committees, me.committeesText);
            me.createdBy(event.createdBy);
            me.createdOn(event.createdOn);
            me.changedBy(event.changedBy);
            me.changedOn(event.changedOn);
        };

        assignText(items: Peanut.ILookupItem[], observable: KnockoutObservable<string>) {
            let me = this;
            let text = [];
            me.lo.forEach(items, (item: Peanut.ILookupItem) => {
                text.push(item.name);
            });
            observable(text.join(', '));
        }

        filterAvailable(items: Peanut.ILookupItem[], selected: Peanut.ILookupItem[], available: KnockoutObservableArray<Peanut.ILookupItem>) {
            let me = this;
            let result = me.lo.filter(items, (item: Peanut.ILookupItem) => {
                let existing = me.lo.find(selected, (selectItem: Peanut.ILookupItem) => {
                    return selectItem.id == item.id;
                });
                return (!existing);
            });
            available(result);
        }

        activateSubscriptions = () => {
            let me = this;
            me.selectedResource(null);
            me.selectedCommittee(null);
            me.resourceSubscription = me.selectedResource.subscribe(me.addResource);
            me.committeeSubscription = me.selectedCommittee.subscribe(me.addCommittee);
            me.times.activateSubscriptions();
        };

        suspendSubscriptions = () => {
            let me = this;
            if (me.resourceSubscription !== null) {
                me.resourceSubscription.dispose();
                me.resourceSubscription = null;
            }
            if (me.committeeSubscription !== null) {
                me.committeeSubscription.dispose();
                me.committeeSubscription = null;
            }
            me.times.suspendSubscriptions();
        };

        edit = (committees: KnockoutObservableArray<Peanut.ILookupItem>,
                resources: KnockoutObservableArray<Peanut.ILookupItem>,
                eventTypes: KnockoutObservableArray<Peanut.ILookupItem>) => {
            let me = this;
            me.suspendSubscriptions();
            me.filterAvailable(committees(), me.selectedCommittees(), me.availableCommittees);
            me.filterAvailable(resources(), me.selectedResources(), me.availableResources);
            let type = me.lo.find(eventTypes(), (type: Peanut.ILookupItem) => {
                return type.id === me.eventTypeId;
            });

            me.selectedCommittee(null);
            me.selectedResource(null);
            me.selectedEventType(type);
            me.times.setTimes(me.start,me.end,me.allDay);
            tinymce.get('event-description').setContent(me.description());
            me.activateSubscriptions();
        };

        moveSelectedItem = (item: Peanut.ILookupItem, 
                           source: KnockoutObservableArray<Peanut.ILookupItem>,
                           target: KnockoutObservableArray<Peanut.ILookupItem>) => {

            let me = this;

            me.suspendSubscriptions();
            let remaining = me.lo.filter(source(),(sourceItem: Peanut.ILookupItem) => {
                return sourceItem.id != item.id;
            });
            remaining = me.lo.sortBy(remaining,'name');
            target.push(item);
            let targetItems = me.lo.sortBy(target(),'name');
            source(remaining);
            target(targetItems);
            me.activateSubscriptions();
        };
        addCommittee = (item: Peanut.ILookupItem) => {
            this.moveSelectedItem(item,this.availableCommittees,this.selectedCommittees);
        };
        
        removeCommittee = (item: Peanut.ILookupItem) => {
            this.moveSelectedItem(item,this.selectedCommittees,this.availableCommittees);

        };
        addResource = (item: Peanut.ILookupItem) => {
            this.moveSelectedItem(item,this.availableResources,this.selectedResources);
        };

        removeResource = (item: Peanut.ILookupItem) => {
            this.moveSelectedItem(item,this.selectedResources,this.availableResources);

        };
    }

    export class calendarPage {
        month: number;
        year: number;
        startDate: Moment;
        endDate: Moment;

        constructor(year: any, month: any, startDate: string, endDate: string)  {
            this.month = month;
            this.year = year;
            this.startDate = moment(startDate);// + 'T00:00:00');
            this.endDate =  moment(endDate);//  + 'T00:00:00');
            this.startDate.startOf('day');
            this.endDate.startOf('day');
            let test = this.startDate.format() + ' to ' + this.endDate.format();
            console.log(test);

        }

        static compareDate(compareDate: Moment, calendarDate: Moment) {
            let f = compareDate.format('YYYY-MM-DD[T]HH:mm:00');
            let yourDate = moment(f); // ignore locale;
            let t = yourDate.format();
            if (yourDate.isAfter(calendarDate)) {
                return 1;
            }
            if (yourDate.isBefore(calendarDate)) {
                return -1;
            }
            return 0;
        }

        compareStart = (m : Moment) => {
            return calendarPage.compareDate(m, this.startDate)
        };

        compareEnd = (m : Moment) => {
            return calendarPage.compareDate(m, this.endDate)
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

        tab = ko.observable('calendar');
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
                    '@lib:jqueryui-css',
                    '@lib:jqueryui-js',
                    '@lib:fullcalendar-js',
                    '@lib:lodash',
                    '@lib:tinymce'
                ], () => {
                    // initialize date popups
                    jQuery(function () {
                        jQuery(".datepicker").datepicker();
                    });

                    me.lo = _.noConflict(); // avoid conflict with underscore.js
                    me.eventForm.lo = me.lo;
                    let request = {
                        initialize: 1
                    };

                    me.getNewCalendar(request,(response: ICalendarInitResponse) => {
                        // me.addAllTypesItem(response.types);
                        me.eventTypes(response.types);
                        me.userPermission(response.userPermission);
                        me.addTranslations(response.translations);
                        me.eventForm.times.initialize(me);
                        me.eventForm.vocabulary = response.vocabulary;

                        if (response.userPermission == 'edit') {
                            me.initEditor('#event-description');
                            me.resources(response.resources);
                            me.committees(response.committees);
                            me.eventForm.addCaption(me.translate('label-add') + '...');
                            me.menuVisible(true);
                        }
                        me.showCalendar(response.events);
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
                branding: false,
                height: 200
            });
        };

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
            // if (page.compareStart(startDate) == -1) {
            if (page.compareStart(start) == -1) {
                console.log('Page prev');
                movePage = -1;
            }
            // else if (page.compareEnd(endDate) > 0) {
            else if (page.compareEnd(end) > 0) {
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
            this.eventForm.clear();
            this.tab('edit');
        };

        onEditEvent = () => {
            let me = this;
            me.eventInfoModal.modal('hide');
            if (!me.eventForm.createdBy()) {
                me.getEventDetails(() => {
                    me.showEditPage();

                });
            }
            else {
                me.showEditPage();
            }
        };

        showEditPage = () => {
            let me = this;
            me.eventForm.edit(me.committees,me.resources,me.eventTypes);
            this.tab('edit');
        };

        onCancelEdit = () => {
            this.tab('calendar');
        };

        onUpdateEvent  = () => {
            this.tab('calendar');
        };

        showEventDetails = () => {
            let me = this;
            me.getEventDetails(() => {
                me.eventInfoModal.modal('hide');
                me.tab('view');
            });
        };

        getEventDetails = (successFunction? : ()=> void) => {
            let me = this;
            me.services.executeService('peanut.qnut-calendar::GetEventDetails', me.eventForm.id(),
                (serviceResponse: Peanut.IServiceResponse) => {
                    if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                        let response = <ICalendarEventDetails>serviceResponse.Value;
                        me.eventForm.assignDetails(response);
                        if (successFunction) {
                            successFunction();
                        }
                    }
                })
                .fail(() => {
                    let trace = me.services.getErrorInformation();
                })

        }


    }
}
