<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 5/9/2018
 * Time: 6:16 AM
 */

namespace Peanut\QnutCalendar\db\model\entity;


use Tops\sys\TDates;
use Tops\sys\TLanguage;

class CalendarNotification extends CalendarSearchEvent
{
    public $description;

    public function formatDateRange($dateFormat = 'F j, Y', $timeFormat='g:i a') {
        $startDate = new \DateTime($this->start);
        $startDateString = $startDate->format($dateFormat);
        $result = $startDateString;
        if (!$this->allDay) {
            $result .= ' '.$startDate->format($timeFormat);
        }
        if (!empty($end)) {
            $result .= ' '.
                ($this->allDay ? TLanguage::text('conjunction-through') : TLanguage::text('conjunction-until')).
                ' ';
            $endDate = new \DateTime($this->end);
            $endDateString = $endDate->format($dateFormat);
            if ($endDateString != $startDateString) {
                $result .= $endDateString;
                if (!$this->allDay) {
                    $result .= ' '.$endDate->format($timeFormat);
                }
            }
        }
    }
}