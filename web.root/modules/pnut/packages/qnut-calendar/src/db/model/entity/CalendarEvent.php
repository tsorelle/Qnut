<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 1/19/2018
 * Time: 10:22 AM
 */

namespace Peanut\QnutDirectory\db\model\entity;


use Tops\sys\TDates;

class CalendarEvent
{
    public $title = '';
    public $start = '';

    public static function Create($title,$start)
    {
    }
}