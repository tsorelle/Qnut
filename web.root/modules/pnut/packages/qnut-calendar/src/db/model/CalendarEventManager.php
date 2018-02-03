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
use Tops\sys\TCalendarPage;
use Tops\sys\TDateRepeater;
use Tops\sys\TDates;

class CalendarEventManager
{
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

    public function getCalendarEvents($request,$year,$month,$filter='',$code='', $pageDirection='')
    {
        $calendarPage = TCalendarPage::Create($year, $month, $pageDirection);
        $startDate = $calendarPage->start->format('Y-m-d');
        $endDate = $calendarPage->end->format('Y-m-d');
        $eventsRepository = $this->getEventsRepository();
        $events = $eventsRepository->getFilteredEvents($filter, $code, $startDate, $endDate);

        /**
         * @var $repeats FullCalendarEvent[]
         */
        $results = [];
        /**
         * @var $repeats FullCalendarEvent[]
         */
        $repeats = [];

        foreach ($events as $event) {
            if ($event->repeatPattern == null) {
                $results[] = $event;
            } else {
                $repeats[] = $event;
            }
        }
        $repeater = new TDateRepeater();
        foreach ($repeats as $event) {
            $dates = $repeater->getRepeatingDates($calendarPage,$event->repeatPattern);
            foreach ($dates as $date) {
                if ($this->findRepeatInstance($events,$event->id,$date)) {
                    continue;
                }
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
        uasort($results,function ($eventA,$eventB) {
            $a = new \DateTime($eventA->start);
            $b = new \DateTime($eventB->start);
            if ($a == $b) {
                return 0;
            }
            return ($a < $b) ? -1 : 1;
        });
        return $results;
    }

    /**
     * @param $events FullCalendarEvent[]
     * @param $repeatInstance
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



}