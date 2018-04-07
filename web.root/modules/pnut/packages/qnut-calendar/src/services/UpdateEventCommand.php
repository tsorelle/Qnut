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
 *          dto: ICalendarDto;
 *          filter: string;
 *          code: string;
 *          repeatUpdateMode: string;
 *          notificationDays: any;
 *          resources: any[];
 *          committees: any[];
 *     }
 *
 *	   interface ICalendarDto {
 *			id : any;
 *	        title : string;
 *	        start : string;
 *	        end : string;
 *	        allDay : boolean;
 *	        location: string;
 *	        url : string;
 *	        eventType : string;
 *	        repeatPattern : string;
 *	        repeatInstance : any;
 *	        notes: string;
 *	        description: string;
 *	        recurId: any;
 *		}
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

        if (empty($request->dto)) {
            $this->addErrorMessage('calendar-error-no-event');
            return;
        }
        if (empty($request->dto->startTime)) {
            $this->addErrorMessage('calendar-error-no-start');
            return;
        }

        $startTime = TDates::stringToTimestamp($request->dto->start,TDates::IsoDateTimeFormat);
        if ($startTime === false) {
            $this->addErrorMessage('calendar-error-invalid-start');
            return;
        }

        if (!empty($request->recurPattern)) {
            // todo: extract start end dates
        }

        if ($request->dto->id === 0) {
            $dto = new CalendarEvent();
            $dto->assignFromObject($request->dto);
        }
        else {
            // todo: retrieve event
            // if previously recurring, drop modified instances ?
        }

        // todo: UpdateEventCommand - perform update on $request->dto


        $getEventsRequest = new \stdClass();
        $getEventsRequest->year = date('Y',$startTime);
        $getEventsRequest->month = date('m',$startTime);
        $getEventsRequest->filter = $request->filter;
        $getEventsRequest->code = $request->code;
        $user =$this->getUser();
        if (!isset($request->public)) {
            $request->public = !$user->isAuthenticated();
        }

        $manager = new CalendarEventManager();
        $response = $manager->getCalendarEvents($request);
        $this->setReturnValue($response);
    }
}