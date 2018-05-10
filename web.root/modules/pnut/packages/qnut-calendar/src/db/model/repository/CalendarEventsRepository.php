<?php 
/** 
 * Created by /tools/create-model.php 
 * Time:  2018-02-03 12:35:01
 */ 
namespace Peanut\QnutCalendar\db\model\repository;


use \PDO;
use PDOStatement;
use Peanut\QnutCalendar\db\model\entity\FullCalendarEvent;
use Tops\db\TDatabase;
use \Tops\db\TEntityRepository;

class CalendarEventsRepository extends \Tops\db\TEntityRepository
{
    protected function getTableName() {
        return 'qnut_calendar_events';
    }


    protected function getDatabaseId() {
        return null;
    }

    protected function getClassName() {
        return 'Peanut\QnutCalendar\db\model\entity\CalendarEvent';
    }

    protected function getFieldDefinitionList()
    {
        return array(
            'id' => PDO::PARAM_INT,
            'title' => PDO::PARAM_STR,
            'start' => PDO::PARAM_STR,
            'end' => PDO::PARAM_STR,
            'allDay' => PDO::PARAM_STR,
            'url' => PDO::PARAM_STR,
            'eventTypeId' => PDO::PARAM_INT,
            'notes' => PDO::PARAM_STR,
            'location' => PDO::PARAM_STR,
            'description' => PDO::PARAM_STR,
            'recurPattern' => PDO::PARAM_STR,
            // 'recurStart' => PDO::PARAM_STR,
            'recurEnd' => PDO::PARAM_STR,
            'recurId' => PDO::PARAM_INT,
            'recurInstance' => PDO::PARAM_STR,
            'createdby' => PDO::PARAM_STR,
            'createdon' => PDO::PARAM_STR,
            'changedby' => PDO::PARAM_STR,
            'changedon' => PDO::PARAM_STR,
            'active' => PDO::PARAM_STR);
    }

    /**
     * @param $filter
     * @param $code
     * @param $startDate
     * @param $endDate
     * @return \stdClass
     */
    public function getFilteredEvents($startDate, $endDate, $filter='', $code='',$publicOnly=false)
    {
        switch ($filter) {
            case 'resource' :
                $joins = 'JOIN qnut_calendar_event_resources er on er.eventId = e.id JOIN qnut_resources j on j.id = er.resourceId';
                $filters = "AND j.code = ?";
                break;
            case 'committee' :
                $joins = 'JOIN qnut_calendar_event_committees ec ON ec.eventId = e.id JOIN qnut_committees j ON j.id = ec.committeeId';
                $filters = "AND j.code = ?";
                break;
            default :
                $joins = '';
                $filters = '';
                break;
        }
        $eventParams = [$startDate,$endDate,$endDate];
        $repeatParams = [$endDate,$startDate];
        if ($code) {
            $eventParams[] = $code;
            $repeatParams[] = $code;
        }

        if ($publicOnly) {
            $filters .= ' AND t.public = 1';
        }

        $header =
            "SELECT e.id,title," .
            "IF(allDay = 1,DATE_FORMAT(`start`,'%Y-%m-%d'),DATE_FORMAT(`start`,'%Y-%m-%dT%H:%i')) AS `start`," .
            "IF(`end` IS NULL OR `end` = `start`,NULL,DATE_FORMAT(`end`,'%Y-%m-%dT%H:%i')) AS `end`, " .
            "allDay, location, e.url,t.code AS eventType,t.backgroundColor,t.borderColor,t.textColor, recurInstance," .
            "CONCAT(e.recurPattern,';',DATE(e.`start`),IF (e.recurEnd IS NULL,'',CONCAT(',',e.recurEnd))) AS repeatPattern, 0 AS occurance " .
            "FROM qnut_calendar_events e JOIN qnut_calendar_event_types t ON e.eventTypeId = t.id $joins " .
            "WHERE e.active = 1 AND ";

            $eventSelector = "(e.recurPattern IS NULL AND (DATE(e.`start`) >= ? AND  DATE(e.`start`) < ?)  AND  (DATE(e.`end`) < ?  OR e.`end` IS NULL)) "; // start,end, end

            $repeatSelector = "(e.recurPattern IS NOT NULL AND (DATE(e.`start`) <= ?) AND (e.recurEnd IS NULL OR e.recurEnd > ?)) "; // end, start



        $result = new \stdClass();
        $sql = $header.$eventSelector.$filters;
        $stmt = $this->executeStatement($sql ,$eventParams);
        $result->events = $stmt->fetchAll(PDO::FETCH_CLASS,'Peanut\QnutCalendar\db\model\entity\FullCalendarEvent');

        $sql = $header.$repeatSelector.$filters;
        $stmt = $this->executeStatement($sql,$repeatParams);
        $result->repeats = $stmt->fetchAll(PDO::FETCH_CLASS,'Peanut\QnutCalendar\db\model\entity\FullCalendarEvent');

        return $result;
    }

    public function getCalendarNotificationEvents($startDate, $endDate) {
        $eventParams = [$startDate,$endDate,$endDate];
        $repeatParams = [$endDate,$startDate];

        $header =
            "SELECT e.id,title,IFNULL(e.location,'') AS location, IFNULL(e.`description`,'') AS description, allDay, ".
            "IF(allDay = 1,DATE_FORMAT(`start`,'%Y-%m-%d'),DATE_FORMAT(`start`,'%Y-%m-%dT%H:%i')) AS `start`, ".
            "IF(`end` IS NULL OR `end` = `start`,NULL,DATE_FORMAT(`end`,'%Y-%m-%dT%H:%i')) AS `end`, ".
            "CONCAT(e.recurPattern,';',DATE(e.`start`),IF (e.recurEnd IS NULL,'',CONCAT(',',e.recurEnd))) AS repeatPattern ".
            "FROM qnut_calendar_events e ".
            'WHERE e.active = 1 AND ';

        $eventSelector = "(e.recurPattern IS NULL AND (DATE(e.`start`) >= ? AND  DATE(e.`start`) < ?)  AND  (DATE(e.`end`) < ?  OR e.`end` IS NULL)) "; // start,end, end

        $repeatSelector = "(e.recurPattern IS NOT NULL AND (DATE(e.`start`) <= ?) AND (e.recurEnd IS NULL OR e.recurEnd > ?)) "; // end, start

        $result = new \stdClass();
        $sql = $header.$eventSelector;
        $stmt = $this->executeStatement($sql ,$eventParams);
        $result->events = $stmt->fetchAll(PDO::FETCH_CLASS,'Peanut\QnutCalendar\db\model\entity\CalendarNotification');

        $sql = $header.$repeatSelector;
        $stmt = $this->executeStatement($sql,$repeatParams);
        $result->repeats = $stmt->fetchAll(PDO::FETCH_CLASS,'Peanut\QnutCalendar\db\model\entity\CalendarNotification');

        return $result;

    }

    public function getEventNotificationDays($eventId,$personId) {
        $sql = "SELECT COUNT(*) FROM qnut_notification_types WHERE code = 'calendar' AND active=1";
        $stmt = $this->executeStatement($sql,[$personId,$eventId]);
        $result = $stmt->fetch(PDO::FETCH_COLUMN);
        if ($result != 1) {
            // notifications not supported if notification type not active.
            return -1;
        }

        $sql=
            'SELECT leadDays FROM qnut_notification_subscriptions s '.
            'JOIN qnut_notification_types t ON s.notificationTypeId = t.id '.
            "WHERE personId = ? AND s.itemId = ? AND t.code = 'calendar'";

        $stmt = $this->executeStatement($sql,[$personId,$eventId]);
        $result = $stmt->fetch(PDO::FETCH_COLUMN);
        return ($result === false) ? 0 : $result;
    }

    public function getEventDetails($id)
    {
        $event = $this->get($id);
        if (empty($id)) {
            return false;
        }
        $event->committees = $this->getEventCommittees($id);
        $event->resources = $this->getEventResources($id);
        return $event;
    }

    public function getEventCommittees($eventId) {
        $sql =
            'SELECT c.id, c.code,c.name,c.description FROM qnut_committees c '.
            'JOIN qnut_calendar_event_committees e ON c.id = e.committeeId WHERE e.eventId = ?';
        $stmt = $this->executeStatement($sql,[$eventId]);
        $result = $stmt->fetchAll(PDO::FETCH_CLASS,'Tops\sys\TLookupItem');
        return $result;

    }

    public function getEventResources($eventId) {
        $sql =
            'SELECT r.id, r.code,r.name,r.description FROM qnut_resources r '.
            'JOIN qnut_calendar_event_resources e ON r.id = e.resourceId WHERE e.eventId = ?';
        $stmt = $this->executeStatement($sql,[$eventId]);
        $result = $stmt->fetchAll(PDO::FETCH_CLASS,'Tops\sys\TLookupItem');
        return $result;

    }

    public function getRepeatInstances($eventId)
    {
        $sql = 'SELECT id FROM qnut_calendar_events WHERE recurId = ?';
        $stmt = $this->executeStatement($sql,[$eventId]);
        $result = $stmt->fetchAll(PDO::FETCH_COLUMN);
        return $result;
    }

    public function deleteRepeatInstances($eventId)
    {
        $sql = 'DELETE FROM '.$this->getTableName().' WHERE recurId = ?';
        $this->executeStatement($sql,[$eventId]);
    }

    public function truncateRepeatInstances($eventId, $date)
    {
        $sql = 'DELETE FROM '.$this->getTableName().' WHERE recurId = ? and DATE(start) > ?';
        $this->executeStatement($sql,[$eventId,$date]);
    }


    public function getRepeatReplacementDates($recurId) {
        $sql = 'SELECT recurInstance FROM qnut_calendar_events WHERE recurId = ?';
        $stmt = $this->executeStatement($sql,[$recurId]);
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }



}