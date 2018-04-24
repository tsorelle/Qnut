<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 4/24/2018
 * Time: 5:46 AM
 */

namespace Peanut\QnutCalendar\services;


use Peanut\QnutCalendar\db\model\CalendarEventManager;
use Tops\services\TServiceCommand;
use Tops\sys\TDates;

/**
 * Class DeleteEventCommand
 * @package Peanut\QnutCalendar\services
 *
 * Request:
 *   interface ICalendarDeleteRequest {
 *     eventId: any;
 *     startDate: any;
 *     repeatUpdateMode: string;  // 'all' | 'instance' | 'none'
 *     filter: string;
 *     code: string;
 *   }
 */
class DeleteEventCommand extends TServiceCommand
{
    public function __construct()
    {
        $this->addAuthorization(CalendarEventManager::ManageCalendarPermissionName);
    }


    protected function run()
    {
        $request = $this->getRequest();
        if ($request == null) {
            $this->addErrorMessage('service-no-request');
            return;
        }

        if (empty($request->eventId)) {
            $this->addErrorMessage('calendar-error-no-event');
            return;
        }

        $manager = new CalendarEventManager();
        $eventId = $request->event->id;
        $event = $manager->getEvent($request->event->id);
        if (!$event) {
            $this->addErrorMessage('calendar-info-no-delete'); //todo: translate
            return;
        }

        $startTime = TDates::stringToTimestamp($request->startDate, TDates::IsoDateTimeFormat);
        if ($startTime === false) {
            $this->addErrorMessage('calendar-error-invalid-start');
            return;
        }

        $repeatMode = 'none';
        if (!empty($event->recurPattern)) {
            $repeatMode = empty($request->repeatUpdateMode) ? 'all' : $request->repeatUpdateMode;
        }

        switch ($repeatMode) {
            case 'none' :
                $manager->deleteEvent($eventId);
                break;
            case 'all' :
                $manager->deleteRepeatingEvent($eventId);
                break;
            case 'instance' :
                // todo: deal with substitute repeat instances
                break;
        }

        // return events list
        $getEventsRequest = new \stdClass();
        $getEventsRequest->year = date('Y', $startTime);
        $getEventsRequest->month = date('m', $startTime);
        $getEventsRequest->filter = $request->filter;
        $getEventsRequest->code = $request->code;
        if (!isset($request->public)) {
            $getEventsRequest->public = !$this->getUser()->isAuthenticated();
        }

        $manager = new CalendarEventManager();
        $response = $manager->getCalendarEvents($getEventsRequest);
        $this->setReturnValue($response);
    }
}