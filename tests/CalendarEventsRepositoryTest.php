<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 3/8/2018
 * Time: 7:12 AM
 */
use Peanut\QnutCalendar\db\model\repository\CalendarEventsRepository;
use PHPUnit\Framework\TestCase;

class CalendarEventsRepositoryTest extends TestCase
{

    public function testGetEventNotificationDays()
    {
        $repository = new CalendarEventsRepository();
        $expected = 5;
        $actual = $repository->getEventNotificationDays(15,173);
        $this->assertEquals($expected,$actual);
    }
}
