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
    private function getUserPermissionLevel()
    {

    }
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
                'calander-hour',
                'calander-hour-plural',
                'calendar-confirm-removerepeat-header',
                'calendar-confirm-removerepeat-text',
                'calendar-date-format',
                'calendar-days-of-week',
                'calendar-days-of-week-plural',
                'calendar-event-entity',
                'calendar-get-details',
                'calendar-label-allday',
                'calendar-label-event-type',
                'calendar-label-new-event',
                'calendar-label-return',
                'calendar-months-of-year',
                'calendar-repeat-message',
                'calendar-set-custorm',
                'calendar-time-error',
                'calendar-time-format',
                'calendar-weekly-ordinals',
                'calendar-word-after',
                'calendar-word-daily',
                'calendar-word-day',
                'calendar-word-day-plural',
                'calendar-word-each',
                'calendar-word-every',
                'calendar-word-month',
                'calendar-word-month-plural',
                'calendar-word-monthly',
                'calendar-word-occurances',
                'calendar-word-repeat',
                'calendar-word-repeating',
                'calendar-word-very',
                'calendar-word-week',
                'calendar-word-week-plural',
                'calendar-word-weekday',
                'calendar-word-weekday-plural',
                'calendar-word-weekly',
                'calendar-word-year',
                'calendar-word-year-plural',
                'calendar-word-yearly',
                'calender-time-order-error',
                'committee-entity-plural',
                'conjunction-from',
                'conjunction-in',
                'conjunction-of',
                'conjunction-on',
                'conjunction-since',
                'conjunction-starting',
                'conjunction-the',
                'conjunction-through',
                'conjunction-to',
                'conjunction-until',
                'label-add',
                'label-cancel',
                'label-close',
                'label-continue',
                'label-custom',
                'label-description',
                'label-edit',
                'label-filter',
                'label-location',
                'label-new',
                'label-notes',
                'label-remove',
                'label-save',
                'label-show-all',
                'label-title',
                'label-to',
                'label-update',
                'nav-more',
                'resource-entity-plural',
                'calendar-pattern-header',
                'calendar-range-header',
                'calendar-phrase-end-by',
                'calendar-phrase-end-after',
                'calendar-phrase-no-end',
                'calendar-word-start',
                'calendar-word-last',
                'calendar-update-modal-title',
                'calendar-update-modal-question',
                'calendar-update-modal-all',
                'calendar-update-modal-instance',
                'calendar-notify-remind',
                'calendar-notify-when'
            ]);

            $response->translations['calendar-word-the'] = trim($response->translations['conjunction-the']);
            $response->translations['calendar-word-on'] = trim($response->translations['conjunction-on']);
            $response->vocabulary = new \stdClass();
            $response->vocabulary->daysOfWeek =       explode(',',TLanguage::text('calendar-days-of-week'));
            $response->vocabulary->daysOfWeekPlural = explode(',',TLanguage::text('calendar-days-of-week-plural'));
            $response->vocabulary->monthNames     =   explode(',',TLanguage::text('calendar-months-of-year'));
            $response->vocabulary->ordinals =         explode(',',TLanguage::text('calendar-weekly-ordinals'));
            array_push($response->vocabulary->ordinals,TLanguage::text('calendar-word-last'));
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
