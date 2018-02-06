<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 2/3/2018
 * Time: 10:15 AM
 */

namespace Peanut\QnutCalendar\db\model\entity;

/**
 * Class FullCalendarEvent
 * @package Peanut\QnutCalendar\db\model\entity
 *
 * Matches FullCalendar event object
 *  See:   https://fullcalendar.io/docs/event_data/Event_Object/
 *
 * Additional Properties to handle repeating events. Ignored by FullCalendar:
 *    $repeatPattern
 *     Semicolon seperated list = pattern;start-date{;end-date}
 *     See: Tops\sys\TDateRepeater for descriptoin of pattern format
 *
 *    $repeatInstance
 *       For events posted as replacement for a repeated event. Takes the form: id,date
 *       Where id is the id of the repeating event template and date is the date of the generated repeat date
 *
 * Data retrieval example in Peanut\QnutCalendar\db\model\repository::getFilteredEvents
 */
class FullCalendarEvent
{
    public $id;
    public $title;
    public $start;
    public $end;
    public $allDay;
    public $url;
    public $eventType;
    public $backgroundColor;
    public $borderColor;
    public $textColor;
    public $repeatPattern;
    public $repeatInstance;

}