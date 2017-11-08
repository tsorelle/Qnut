<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 10/30/2017
 * Time: 11:47 AM
 */

use Peanut\PeanutTasks\TaskManager;
use PHPUnit\Framework\TestCase;

class TaskManagerTest extends \Qnut\test\RepositoryTestFixture
{
    public function setUp() {
        $this->runSqlScript('tasks-test-setup');
    }

    public function tearDown()
    {
        $this->runSqlScript('tasks-test-cleanup');
    }

    public function testQueueProcess() {
        TaskManager::Run();
        $this->runSqlScript('task-test-cleanup');
    }
}
