<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 1/19/2018
 * Time: 10:50 AM
 */

namespace Peanut\QnutCalendar\services;


use Peanut\QnutDirectory\db\model\entity\CalendarEvent;
use Tops\services\TServiceCommand;

class GetEventsCommand extends TServiceCommand
{

    protected function run()
    {
        $ym = date('Y-m');
        $result = [];
        $event = new \stdClass();
        $event->title = 'All Day Event';
        $event->start = $ym.'-01';
        $result[] = $event;
        $event = new \stdClass();
        $event->title = 'Long Event';
        $event->start = $ym.'-07';
        $event->end = $ym.'-10';
        $event->id = 999;
        $result[] = $event;
        $event = new \stdClass();
        $event->title = 'Repeating Event';
        $event->start = $ym.'-09T16:00:00';
        $event->id = 999;
        $result[] = $event;
        $event = new \stdClass();
        $event->title = 'Repeating Event';
        $event->start = $ym.'-16T16:00:00';
        $result[] = $event;
        $event = new \stdClass();
        $event->title = 'Conference';
        $event->start = $ym.'-11';
        $event->end = $ym.'-13';
        $result[] = $event;
        $event = new \stdClass();
        $event->title = 'Meeting';
        $event->start = $ym.'-12T10:30:00';
        $event->end = $ym.'-12T12:30:00';
        $result[] = $event;
        $event = new \stdClass();
        $event->title = 'Lunch';
        $event->start = $ym.'-12T12:00:00';
        $result[] = $event;
        $event = new \stdClass();
        $event->title = 'Meeting';
        $event->start = $ym.'-12T14:30:00';
        $result[] = $event;
        $event = new \stdClass();
        $event->title = 'Happy Hour';
        $event->start = $ym.'-12T17:30:00';
        $result[] = $event;
        $event = new \stdClass();
        $event->title = 'Dinner';
        $event->start = $ym.'-12T20:00:00';
        $result[] = $event;
        $event = new \stdClass();
        $event->title = 'Birthday Party';
        $event->start = $ym.'-13T07:00:00';
        $result[] = $event;
        $event = new \stdClass();
        $event->title = 'Click for Google';
        $event->url = 'http = //google.com/';
        $event->start = $ym.'-28';
        $result[] = $event;

        $this->setReturnValue($result);

    }
}