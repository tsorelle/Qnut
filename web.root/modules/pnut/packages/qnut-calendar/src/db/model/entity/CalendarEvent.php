<?php
/**
 * Created by /tools/create-model.php
 * Time:  2018-02-03 12:35:01
 */

namespace Peanut\QnutCalendar\db\model\entity;

class CalendarEvent  extends \Tops\db\TimeStampedEntity
{
    public $id;
    public $title;
    public $start;
    public $end;
    public $url;
    public $eventTypeId;
    public $notes;
    public $description;
    public $recurPattern;
    public $recurStart;
    public $recurEnd;
    public $recurId;
    public $recurInstance;
    public $active;

    public function getDtoDataTypes()
    {
        $types = parent::getDtoDataTypes();
        $types['start'] = \Tops\sys\TDataTransfer::dataTypeDateTime;
        $types['end'] = \Tops\sys\TDataTransfer::dataTypeDateTime;
        $types['recurStart'] = \Tops\sys\TDataTransfer::dataTypeDate;
        $types['recurEnd'] = \Tops\sys\TDataTransfer::dataTypeDate;
        $types['recurInstance'] = \Tops\sys\TDataTransfer::dataTypeDate;
        return $types;
    }
}
