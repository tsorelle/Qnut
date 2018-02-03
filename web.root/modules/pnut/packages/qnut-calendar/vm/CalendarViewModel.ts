/// <reference path="../../../../pnut/core/ViewModelBase.ts" />
/// <reference path='../../../../typings/knockout/knockout.d.ts' />
/// <reference path='../../../../pnut/core/peanut.d.ts' />

namespace QnutCalendar {

    export class CalendarViewModel extends Peanut.ViewModelBase {
        // observables

        test = ko.observable();

        monthStartDate = null;
        monthEndDate = null;

        init(successFunction?: () => void) {
            let me = this;
            console.log('calendar Init');
            me.application.loadResources([
                '@lib:moment-js'
            ], () => {
                me.application.loadResources([
                    '@lib:fullcalendar-js',
                    '@lib:fullcalendar-css'
                    , '@lib:fullcalendar-print-css'
                ], () => {
                    me.services.executeService('peanut.qnut-calendar::GetEvents', null,
                        (serviceResponse: Peanut.IServiceResponse) => {
                            if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                                let response = serviceResponse.Value;
                                me.showCalendar(response);
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

        showCalendar(events) {
            let me = this;
            me.monthStartDate = null;
            me.monthEndDate = null;
            jQuery('#calendar')
                .fullCalendar({
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
                    events: events
                });

            // for reasons unknown, calendar is incorrectly sized on load. This fixes the problem (for reasons unknown)
            let t = window.setInterval(() => {
                jQuery('#calendar').fullCalendar('render');
                clearInterval(t);
            }, 100);
        }

        onEventClick = (calEvent, jsEvent, view) => {
            let me = this;
            // alert('Event: ' + calEvent.title);
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
    }
}
