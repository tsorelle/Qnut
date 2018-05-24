<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 5/24/2018
 * Time: 11:05 AM
 */

use Peanut\QnutCalendar\services\SendEventNotificationsCommand;
use PHPUnit\Framework\TestCase;

class SendEventNotificationsCommandTest extends TestCase
{
    public function testSendNotifications() {
        $command = new SendEventNotificationsCommand();
        $this->assertNotNull($command);
        $actual = $command->runTest('2018-05-23');
        $this->assertNotNull($actual);
    }
}
