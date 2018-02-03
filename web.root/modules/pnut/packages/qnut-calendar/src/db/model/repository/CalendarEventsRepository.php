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
        'id'=>PDO::PARAM_INT,
        'title'=>PDO::PARAM_STR,
        'start'=>PDO::PARAM_STR,
        'end'=>PDO::PARAM_STR,
        'url'=>PDO::PARAM_STR,
        'eventTypeId'=>PDO::PARAM_INT,
        'notes'=>PDO::PARAM_STR,
        'recurPattern'=>PDO::PARAM_STR,
        'recurStart'=>PDO::PARAM_STR,
        'recurEnd'=>PDO::PARAM_STR,
        'recurId'=>PDO::PARAM_INT,
        'recurInstance'=>PDO::PARAM_STR,
        'createdby'=>PDO::PARAM_STR,
        'createdon'=>PDO::PARAM_STR,
        'changedby'=>PDO::PARAM_STR,
        'changedon'=>PDO::PARAM_STR,
        'active'=>PDO::PARAM_STR);
    }

    /**
     * @param $filter
     * @param $code
     * @param $startDate
     * @param $endDate
     * @return FullCalendarEvent[]
     */
    public function getFilteredEvents($filter, $code, $startDate, $endDate)
    {
        switch ($filter) {
            case 'resource' :
                $joins = 'JOIN qnut_calendar_event_resources er on er.eventId = e.id JOIN qnut_resources r on r.id = er.resourceId';
                $filters = "AND r.code = '?'";
                break;
            case 'committee' :
                $joins = 'JOIN qnut_calendar_event_committees ec ON ec.eventId = e.id JOIN qnut_committees c ON c.id = ec.committeeId';
                $filters = "AND r.code = '?'";
                break;
            default :
                break;
        }

        $params = [$startDate, $endDate, $startDate, $endDate];
        if ($code) {
            $params[] = $code;
        }

        $sql =
            "SELECT e.id,title ,  " .
            "IF(`end` IS NULL,DATE_FORMAT(`start`,'%Y-%m-%d'),DATE_FORMAT(`start`,'%Y-%m-%dT%H:%i')) AS `start`," .
            "IFNULL(`end`,IF (`end` = `start`,NULL,DATE_FORMAT(`end`,'%Y-%m-%dT%H:%i'))) AS `end`," .
            "IF(`end` IS NULL,1,0) AS allDay ,e.url,t.code AS eventType,t.backgroundColor,t.borderColor,t.textColor," .
            "CONCAT(e.recurId,',',e.recurInstance) AS repeatInstance,".
            "CONCAT(e.recurPattern,';',e.recurStart,IF (e.recurEnd IS NULL,'',CONCAT(',',e.recurEnd))) AS repeatPattern" .
            "FROM qnut_calendar_events e JOIN qnut_calendar_event_types t ON e.eventTypeId = t.id " .
            $joins .
            "WHERE((e.recurPattern IS NULL AND DATE(e.`start`) >= @startDate  AND  (DATE(e.`end`) < @endDate OR e.`end` IS NULL))" .
            "OR (e.recurPattern IS NOT NULL  AND (e.recurStart <= @startDate AND (e.recurEnd IS NULL OR e.recurEnd > @endDate)))" .
            "$filters);";

        $stmt = $this->executeStatement($sql,$params);
        $events = $stmt->fetchAll(PDO::FETCH_CLASS,'Peanut\QnutCalendar\db\model\entity\FullCalendarEvent');
        return $events;
    }

}