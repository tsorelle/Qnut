<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 2/2/2018
 * Time: 11:40 AM
 */

namespace Peanut\QnutCalendar\db\model;

use Peanut\QnutCalendar\db\model\entity\CalendarEvent;
use Peanut\QnutCalendar\db\model\entity\FullCalendarEvent;
use Peanut\QnutCalendar\db\model\repository\CalendarEventsRepository;
use Tops\db\model\repository\LookupTableRepository;
use Tops\sys\TCalendarPage;
use Tops\sys\TDateRepeater;
use Tops\sys\TDates;

class CalendarEventManager
{
    const ManageCalendarPermissionName = 'Manage calendar';
    /**
     * @var CalendarEventsRepository
     */
    private $eventsRepository;
    private function getEventsRepository() {
        if (!isset($this->eventsRepository)) {
            $this->eventsRepository = new CalendarEventsRepository();
        }
        return $this->eventsRepository;
    }

    private static $instance;
    public static function GetInstance() {
        if (!isset(self::$instance)) {
            self::$instance = new CalendarEventManager();
        }
    }

    /**
     * @param $request
     * @return \stdClass
     */
    public function getCalendarEvents($request)
    {
        $year = empty($request->year) ? date('Y') : $request->year;
        $month = empty($request->month) ? date('n') : $request->month;
        $filter= empty($request->filter) ? '' : $request->filter;
        $code=empty($request->code) ? '' : $request->code; 
        $pageDirection=empty($request->pageDirection) ? '' : $request->pageDirection;
        $publicOnly = (!empty($request->public));

        $calendarPage = TCalendarPage::Create($year, $month, $pageDirection);
        $startDate = $calendarPage->start->format('Y-m-d');
        $endDate = $calendarPage->end->format('Y-m-d');
        $eventsRepository = $this->getEventsRepository();
        $events = $eventsRepository->getFilteredEvents($startDate,$endDate,$filter,$code,$publicOnly);

        /**
         * @var $repeats FullCalendarEvent[]
         */
        $results = [];
        /**
         * @var $repeats FullCalendarEvent[]
         */
        $repeats = [];

        // divide repeat event templates from event instances
        foreach ($events as $event) {
            if ($event->repeatPattern == null) {
                $results[] = $event;
            } else {
                $repeats[] = $event;
            }
        }

        // get repeating dates
        $repeater = new TDateRepeater();
        foreach ($repeats as $event) {
            $dates = $repeater->getRepeatingDates($calendarPage,$event->repeatPattern);
            foreach ($dates as $date) {
                // Check if a replacement event found for this instance
                if ($this->findRepeatInstance($events,$event->id,$date)) {
                    continue;
                }

                // clone the event and update start and end dates
                $repeat = clone $event;
                $repeat->start = $date;
                @list($datePart,$timePart) = explode('T',$event->start);
                if ($timePart !== null) {
                    $repeat->start .= 'T'.$timePart;
                }
                if ($event->end !== null) {
                    $start = new \DateTime($event->start);
                    $end = new \DateTime($event->end);
                    $interval = $end->diff($start);
                    $end = new \DateTime($repeat->start);
                    $end->add($interval);
                    $repeat->end = $end->format(TDates::IsoDateTimeFormat);
                }
                $results[] = $repeat;
            }
        }

        // sort by start time
        uasort($results,function ($eventA,$eventB) {
            $a = new \DateTime($eventA->start);
            $b = new \DateTime($eventB->start);
            if ($a == $b) {
                return 0;
            }
            return ($a < $b) ? -1 : 1;
        });

        $response = new \stdClass();
        $response->events = $results;
        $response->startDate = $calendarPage->start->format('Y-m-d');
        $response->endDate = $calendarPage->end->format('Y-m-d');
        return $response;
    }

    /**
     * Return true if a replacement event was posted for a repeating instance
     *
     * @param $events
     * @param $id
     * @param $date
     * @return bool
     */
    private function findRepeatInstance($events,$id,$date) {
        $repeatInstance = $id.','.$date;
        foreach ($events as $event) {
            if ($event->repeatInstance == $repeatInstance) {
                return true;
            }
        }
        return false;
    }

    public function getEventTypesList()
    {
        $repository = new LookupTableRepository('qnut_calendar_event_types');
        $repository->setLookupInfoColumns(['backgroundColor as `color`']);
        return $repository->getLookupList();
    }

    public function getResourcesList()
    {
        $repository = new LookupTableRepository('qnut_resources');
        return $repository->getLookupList();
    }

    public function getCommitteeList()
    {
        $repository = new LookupTableRepository('qnut_committees');
        return $repository->getLookupList();
    }

}