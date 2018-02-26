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
            'description' => PDO::PARAM_STR,
            'recurPattern' => PDO::PARAM_STR,
            'recurStart' => PDO::PARAM_STR,
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
     * @return FullCalendarEvent[]
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

        $params = [$startDate, $endDate, $startDate, $endDate];
        if ($code) {
            $params[] = $code;
        }

        $sql =
            "SELECT e.id,title ,  " .
            "IF(`end` IS NULL,DATE_FORMAT(`start`,'%Y-%m-%d'),DATE_FORMAT(`start`,'%Y-%m-%dT%H:%i')) AS `start`," .
            "IF(`end` IS NULL OR `end` = `start`,NULL,DATE_FORMAT(`end`,'%Y-%m-%dT%H:%i')) AS `end`, " .
            "allDay, location, e.url,t.code AS eventType,t.backgroundColor,t.borderColor,t.textColor," .
            "CONCAT(e.recurId,',',e.recurInstance) AS repeatInstance,".
            "CONCAT(e.recurPattern,';',e.recurStart,IF (e.recurEnd IS NULL,'',CONCAT(',',e.recurEnd))) AS repeatPattern " .
            "FROM qnut_calendar_events e JOIN qnut_calendar_event_types t ON e.eventTypeId = t.id $joins " .
            "WHERE((e.recurPattern IS NULL AND DATE(e.`start`) >= ?  AND  (DATE(e.`end`) < ? OR e.`end` IS NULL)) " .
            "OR (e.recurPattern IS NOT NULL  AND (e.recurStart <= ? AND (e.recurEnd IS NULL OR e.recurEnd > ?)))) " .
            $filters;

        if ($publicOnly) {
            $sql .= ' AND t.public = 1';
        }

        $stmt = $this->executeStatement($sql,$params);
        $events = $stmt->fetchAll(PDO::FETCH_CLASS,'Peanut\QnutCalendar\db\model\entity\FullCalendarEvent');
        // $events = $stmt->fetchAll(PDO::FETCH_OBJ);// ,'Peanut\QnutCalendar\db\model\entity\FullCalendarEvent');
        return $events;
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

}