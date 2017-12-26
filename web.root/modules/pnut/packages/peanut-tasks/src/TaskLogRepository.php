<?php 
/** 
 * Created by /tools/create-model.php 
 * Time:  2017-10-30 16:13:23
 */ 
namespace Peanut\PeanutTasks;


use \PDO;
use PDOStatement;
use Tops\db\TDatabase;
use \Tops\db\TEntityRepository;

class TaskLogRepository extends \Tops\db\TEntityRepository
{
    /**
     * @param $logDate
     * @param int $maxentries
     * @return TaskLogEntry[]
     */
    public function getLatest($logDate,$maxentries=0) {
        return [];
    }

    /**
     * @param $taskname
     * @return TaskLogEntry
     */
    public function getLastEntry($taskname) {
        return $this->getSingleEntity('taskname = ? ORDER BY `time` DESC LIMIT 1',[$taskname]);
    }

    protected function getTableName() {
        return 'tops_tasklog';
    }

    protected function getDatabaseId() {
        return null;
    }

    protected function getClassName() {
        return 'Peanut\PeanutTasks\TaskLogEntry';
    }

    protected function getFieldDefinitionList()
    {
        return array(
        'id'=>PDO::PARAM_INT,
        'time'=>PDO::PARAM_STR,
        'type'=>PDO::PARAM_INT,
        'message'=>PDO::PARAM_STR,
        'taskname'=>PDO::PARAM_STR);
    }
}