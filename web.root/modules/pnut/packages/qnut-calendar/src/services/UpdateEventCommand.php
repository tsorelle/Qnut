<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 3/15/2018
 * Time: 6:41 AM
 */

namespace Peanut\QnutCalendar\services;


use Peanut\QnutCalendar\db\model\CalendarEventManager;
use Peanut\QnutCalendar\db\model\entity\CalendarEvent;
use Tops\services\TServiceCommand;
use Tops\sys\TDates;
use Tops\sys\TPermissionsManager;

/**
 * Class UpdateEventCommand
 * @package Peanut\QnutCalendar\services
 *
 * Service Contract:
 *	Request:
 *     interface ICalendarUpdateRequest {
 *          event: ICalendarDto;
 *          year: any;
 *          month: any;
 *          filter: string;
 *          code: string;
 *          repeatUpdateMode: string;
 *          notificationDays: any;
 *          resources: any[];
 *          committees: any[];
 *    }
 *
 *    interface ICalendarDto {
 *        id : any;
 *        title : string;
 *        start : string;
 *        end : string;
 *        allDay : number;
 *        location: string;
 *        url : string;
 *        eventTypeId : any;
 *        recurPattern : string;
 *        recurEnd : any;
 *        recurId: any;
 *        recurInstance: any;
 *        notes: string;
 *        description: string;
 *    }
 *
 *	Response:
 *     interface IGetCalendarResponse {
 *         year: any;
 *         month: any;
 *         events: ICalendarEvent[];  (FullCalendarEvent[])
 *          (optional properties omitted)
 *      }
 */

class UpdateEventCommand extends TServiceCommand
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

        if (empty($request->event)) {
            $this->addErrorMessage('calendar-error-no-event');
            return;
        }
        if (empty($request->event->start)) {
            $this->addErrorMessage('calendar-error-no-start');
            return;
        }

        $startTime = TDates::stringToTimestamp($request->event->start,TDates::IsoDateTimeFormat);
        if ($startTime === false) {
            $this->addErrorMessage('calendar-error-invalid-start');
            return;
        }

        //todo: test case: New repeating event
        //todo: test case: Update repeating from first
        //todo: test case: Update from repeat instance
        //todo: test case: Update and remove recurrences
        //todo: test case: Update and change recurrences
        //todo: test case: Update post replacement for repeat instance

        if (!empty($request->event->repeatPattern)) {
            // todo: extract start end dates
        }

        $manager = new CalendarEventManager();
        $id = $request->event->id;
        $isNew = ($id === 0);
        if ($isNew) {
            $event = new CalendarEvent();
        }
        else {
            $event = $manager->getEvent($request->event->id);
        }

        // todo: test2 - assert assignment correct - revist for recurrence test cases.
        $event->assignFromObject($request->event);

        $user = $this->getUser();
        if ($isNew) {
            $id = $manager->addEvent($event,$user->getUserName());
        }
        else {
            $manager->updateEvent($event,$user->getUserName());
        }

        $manager->updateEventAssociations($id,
            isset($request->committees) ? $request->committees : null,
            isset($request->resources) ? $request->resources : null
        );

        if (isset($request->notificationDays)) {
            if ($request->notificationDays < 0) {
                if (!$isNew) {
                    $manager->clearEventNotification($id, $user->getId());
                }
            }
            else {
                $manager->addEventNotification($id,$user->getId(),$request->notificationDays,$user->getUserName());
            }
        }


        // todo: translate message
        $this->addInfoMessage('Event updated');


        // return events list
        $getEventsRequest = new \stdClass();
        $getEventsRequest->year = $request->year;
        $getEventsRequest->month = $request->month;
        $getEventsRequest->filter = $request->filter;
        $getEventsRequest->code = $request->code;
        if (!isset($request->public)) {
            $getEventsRequest->public = !$user->isAuthenticated();
        }

        $manager = new CalendarEventManager();
        $response = $manager->getCalendarEvents($getEventsRequest);
        $this->setReturnValue($response);
    }
}