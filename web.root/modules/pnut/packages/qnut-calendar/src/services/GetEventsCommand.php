<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 1/19/2018
 * Time: 10:50 AM
 */

namespace Peanut\QnutCalendar\services;


use Peanut\QnutCalendar\db\model\CalendarEventManager;
use Tops\services\TServiceCommand;
use Tops\sys\TLanguage;

/**
 * Class GetEventsCommand
 * @package Peanut\QnutCalendar\services
 *
 * Service contract
 * Request may optionally contain:
 * 		year 			year of calendar page - default current year
 * 		month			month of calendar page - default current month
 * 		filter			'resource' or 'committee'
 * 		code			code value for resource or committee filter
 * 		pageDirection
 * 			'left' - includes dates on before current month
 * 			'right' - includes dates on after current month
 * 			otherwise include full calendar page
 * 		public			Return only public events.  Defaults to true if user authenticated
 *      initialize
 *
 *  Response:
 *
 *     interface IGetCalendarResponse {
 *         year: any;
 *         month: any;
 *         events: ICalendarEvent[];  (FullCalendarEvent[])
 *          Optional if request->initialize
 *              userPermission: string;
 *              types: Peanut.ILookupItem[];
 *              optional if userPermission -- edit
 *                  committees: Peanut.ILookupItem[];
 *                  resources: Peanut.ILookupItem[];
 *      }
 */
class GetEventsCommand extends TServiceCommand
{
    protected function run()
    {
        $request = $this->getRequest();
        if ($request == null) {
            $request = new \stdClass();
        }
        $user =$this->getUser();
        if (!isset($request->public)) {
            $request->public = !$user->isAuthenticated();
        }

        $manager = new CalendarEventManager();
        $response = $manager->getCalendarEvents($request);
        // $response->events = $this->getTestData();
        // $response->eventCount = sizeof($response->events);
        if (!empty($request->initialize)) {
            $response->userPermission = $user->isAuthorized(CalendarEventManager::ManageCalendarPermissionName) ? 'edit' : 'view';
            $response->types = $manager->getEventTypesList();
            if ($response->userPermission == 'edit') {
                $response->committees = $manager->getCommitteeList();
                $response->resources = $manager->getResourcesList();
            }
            $response->translations = TLanguage::getTranslations([
                'calendar-days-of-week',
                'calendar-days-of-week-plural',
                'calendar-get-details',
                'calendar-label-event-type',
                'calendar-label-location',
                'calendar-label-new-event',
                'calendar-months-of-year',
                'calendar-repeat-message',
                'calendar-weekly-ordinals',
                'calendar-word-each',
                'calendar-word-repeating',
                'calendar-word-very',
                'committee-entity-plural',
                'conjunction-in',
                'conjunction-of',
                'conjunction-through',
                'conjunction-to',
                'label-close',
                'label-edit',
                'label-filter',
                'label-show-all',
                'nav-more',
                'resource-entity-plural',
                ]);

            $response->vocabulary = new \stdClass();
            $response->vocabulary->daysOfWeek =       explode(',',TLanguage::text('calendar-days-of-week'));
            $response->vocabulary->daysOfWeekPlural = explode(',',TLanguage::text('calendar-days-of-week-plural'));
            $response->vocabulary->monthNames     =   explode(',',TLanguage::text('calendar-months-of-year'));
            $response->vocabulary->ordinals =         explode(',',TLanguage::text('calendar-weekly-ordinals'));
            $response->vocabulary->each =             TLanguage::text('calendar-word-each');
            $response->vocabulary->every =            TLanguage::text('calendar-word-every');
            $response->vocabulary->in =               TLanguage::text('conjunction-in');
            $response->vocabulary->from =             TLanguage::text('conjunction-from');
            $response->vocabulary->until =             TLanguage::text('conjunction-until');
            $response->vocabulary->starting =         TLanguage::text('conjunction-starting');
            $response->vocabulary->of =               TLanguage::text('conjunction-of');
            $response->vocabulary->since =            TLanguage::text('conjunction-since');
            $response->vocabulary->repeating =        TLanguage::text('calendar-word-repeating');
            $response->vocabulary->through =          TLanguage::text('conjunction-through');
            $response->vocabulary->to =               TLanguage::text('conjunction-to');
            $response->vocabulary->the =               TLanguage::text('conjunction-the');
            $response->vocabulary->on =               TLanguage::text('conjunction-on');
            $response->vocabulary->month =            TLanguage::text('calendar-word-month');
            $response->vocabulary->months =           TLanguage::text('calendar-word-month-plural');
            $response->vocabulary->day =              TLanguage::text('calendar-word-day');
            $response->vocabulary->days =             TLanguage::text('calendar-word-day-plural');
            $response->vocabulary->week =             TLanguage::text('calendar-word-week');
            $response->vocabulary->weeks =            TLanguage::text('calendar-word-week-plural');
            $response->vocabulary->weekday =          TLanguage::text('calendar-word-weekday');
            $response->vocabulary->weekdays =         TLanguage::text('calendar-word-weekday-plural');
            $response->vocabulary->year =             TLanguage::text('calendar-word-year');
            $response->vocabulary->years =            TLanguage::text('calendar-word-year-plural');
            $response->vocabulary->ordinalSuffix =    explode(',',TLanguage::text('calendar-ordinals-suffix'));

        }
        $this->setReturnValue($response);
    }

    private function getTestData()
    {
        $ym = '2018-02';
        $result = [];
        $event = new \stdClass();
        $event->title = 'All Day Event';
        $event->start = $ym . '-01';
        $result[] = $event;
        $event = new \stdClass();
        $event->title = 'Long Event';
        $event->start = $ym . '-07';
        $event->end = $ym . '-10';
        $event->id = 999;
        $result[] = $event;
        $event = new \stdClass();
        $event->title = 'Repeating Event';
        $event->start = $ym . '-09T16:00:00';
        $event->id = 999;
        $result[] = $event;
        $event = new \stdClass();
        $event->title = 'Repeating Event';
        $event->start = $ym . '-16T16:00:00';
        $result[] = $event;
        $event = new \stdClass();
        $event->title = 'Conference';
        $event->start = $ym . '-11';
        $event->end = $ym . '-13';
        $result[] = $event;
        $event = new \stdClass();
        $event->title = 'Meeting';
        $event->start = $ym . '-12T10:30:00';
        $event->end = $ym . '-12T12:30:00';
        $result[] = $event;
        $event = new \stdClass();
        $event->title = 'Lunch';
        $event->start = $ym . '-12T12:00:00';
        $result[] = $event;
        $event = new \stdClass();
        $event->title = 'Meeting';
        $event->start = $ym . '-12T14:30:00';
        $result[] = $event;
        $event = new \stdClass();
        $event->title = 'Happy Hour';
        $event->start = $ym . '-12T17:30:00';
        $result[] = $event;
        $event = new \stdClass();
        $event->title = 'Dinner';
        $event->start = $ym . '-12T20:00:00';
        $result[] = $event;
        $event = new \stdClass();
        $event->title = 'Birthday Party';
        $event->start = $ym . '-13T07:00:00';
        $result[] = $event;
        $event = new \stdClass();
        $event->title = 'Click for Google';
        $event->url = 'http = //google.com/';
        $event->start = $ym . '-28';
        $result[] = $event;
        return $result;
    }
}
