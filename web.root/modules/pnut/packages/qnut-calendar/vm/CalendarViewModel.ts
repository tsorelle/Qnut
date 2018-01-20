/// <reference path="../../../../pnut/core/ViewModelBase.ts" />
/// <reference path='../../../../typings/knockout/knockout.d.ts' />
/// <reference path='../../../../pnut/core/peanut.d.ts' />

namespace QnutCalendar {

    export class CalendarViewModel extends Peanut.ViewModelBase {
        // observables

        init(successFunction?: () => void) {
            let me = this;
            console.log('calendar Init');
            me.application.loadResources([
                '@lib:moment-js'
            ],() => {
                me.application.loadResources([
                    '@lib:fullcalendar-js',
                    '@lib:fullcalendar-css'
                    ,'@lib:fullcalendar-print-css'
                ],() => {
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
            jQuery('#calendar')
                .fullCalendar({
                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'month,basicWeek,basicDay'
                },
                defaultDate: '2017-12-12',
                navLinks: true, // can click day/week names to navigate views
                editable: true,
                eventLimit: true, // allow "more" link when too many events
                events: events
            });

            // for reasons unknown, this fixes the problem (for reasons unknown)
            let t = window.setInterval(() => {
                jQuery('#calendar').fullCalendar( 'render' );
                clearInterval(t);
            }, 100);


            // jQuery('#calendar').fullCalendar( 'render' );
        }

        refreshCalendar() {

        }
    }
}
