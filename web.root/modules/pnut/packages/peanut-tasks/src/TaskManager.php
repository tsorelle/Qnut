<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 10/30/2017
 * Time: 6:22 AM
 */

namespace Peanut\PeanutTasks;


use Tops\db\EntityRepositoryFactory;
use Tops\services\TServiceCommand;
use Tops\services\TServiceResponse;
use Tops\sys\TConfiguration;
use Tops\sys\TDates;
use Tops\sys\TSession;
use Tops\sys\TStrings;

class TaskManager
{
    /**
     * @var TaskLogRepository
     */
    private $logRepository;
    /**
     * @var TaskQueueRepository
     */
    private $queueRepository;

    public function __construct($repositoryNamespace = 'Tops\\db\\model\\repository')
    {
        $this->logRepository = new TaskLogRepository();
        $this->queueRepository = new TaskQueueRepository();
    }

    private function initSession() {
        global $_SESSION;
        global $_COOKIE;
        if (!isset($_SESSION)) {
            $_SESSION = array();
        }
        if (!isset($_COOKIE)) {
            $_COOKIE = array();
        }
        TSession::Initialize();
        return $_SESSION['tops']['security-token'];
    }

    public function executeTasks() {
        $securityToken = $this->initSession();
        $runDate = new \DateTime();
        $queue = $this->queueRepository->getCurrent();
        $runlist = array();
        $this->addLogEntry('Start session','session',TaskLogEntryType::Info);
        foreach ($queue as $item) {
            $last = $this->logRepository->getLastEntry($item->taskname);
            if (empty($last)) {
                $runlist[] = $item;
            }
            else if ($last->type == TaskLogEntryType::EndSession) {
                if (TDates::CompareDates($last->time,$item->frequency) == TDates::Before) {
                    $runlist[] = $item;
                }
            }
        }

        foreach ($runlist as $item) {
            $this->runTask($item,$securityToken);
        }
        $this->addLogEntry('End session. '.sizeof($runlist).' tasks processed','session',TaskLogEntryType::Info);
    }

    private function addLogEntry($message,$taskname,$entryType=0) {
        $entry = TaskLogEntry::Create($message,$taskname,$entryType);
        $this->logRepository->insert($entry,'tasks');
    }

    /**
     * @param $taskname
     * @return bool|TServiceCommand
     * @throws \Exception
     */
    private function getServiceClass($taskname,$namespace=null)
    {
        $serviceId = TStrings::toCamelCase($taskname);
        if (empty($namespace)) {
            $namespace =  TConfiguration::getValue('applicationNamespace', 'services');
            if (empty($namespace)) {
                throw new \Exception('For default service, "applicationNamespace=" is required in settings.ini');
            }
            $namespace .= "\\". TConfiguration::getValue('servicesNamespace', 'services','services');
        } else {
            $namespace = TStrings::formatNamespace($namespace)."\\services";
        }

        // get subdirectories  e.g. where serviceId is 'subdirectory.serviceId'
        $serviceId = str_replace('.',"\\",$serviceId);
        $className = $namespace . "\\" . $serviceId . 'Command';

        if (!class_exists($className)) {
            $this->addLogEntry("No service command for '$taskname'",$taskname,TaskLogEntryType::Failure);
            return false;
        }
        /**
         * @var $cmd TServiceCommand
         */
        $cmd = new $className();
        return $cmd;

    }

    private function decodeInput($input)
    {
        if (is_string($input) && substr($input,0,5) == 'json=') {
            $input = substr($input,5);
            return json_encode($input);
        }
        return $input;
    }

    /**
     * @param $taskname
     * @param $input
     * @param $securityToken
     */
    private function runTask(TaskQueueEntry $entry,$securityToken)
    {
        try {
            $this->addLogEntry('Running task',$entry->taskname,TaskLogEntryType::StartSession);
            $cmd = $this->getServiceClass($entry->taskname,$entry->namespace);
            $input = $this->decodeInput($entry->inputs);
            $response = $cmd->execute($input,$securityToken);
            if ($response === null) {
                $this->addLogEntry('No service response',$entry->taskname,TaskLogEntryType::Failure);
                return;
            }
            foreach ($response->Messages as $item) {
                $this->addLogEntry($item->Text,$entry->taskname,$item->MessageType);
            }
        } catch (\Exception $ex) {
            $this->addLogEntry('Exception: '.$ex->getMessage(),$entry->taskname,TaskLogEntryType::Failure);
            return;
        }
        $this->addLogEntry('Completed task',$entry->taskname,TaskLogEntryType::EndSession);
    }

    public static function Run()
    {
        (new TaskManager())->executeTasks();
    }
}