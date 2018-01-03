<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 1/2/2018
 * Time: 1:37 PM
 */

use Peanut\PeanutTasks\TaskQueueEntry;
use PHPUnit\Framework\TestCase;

class TaskQueueEntryTest extends TestCase
{

    public function testAssignFromObject()
    {
        $instance = new TaskQueueEntry();
        $dto = new stdClass();

        $dto->inputs = 'inputs';
        $dto->comments = 'comments';
        $dto->frequency = 'NOT VALID!!!';
        $dto->enddate = 'not valid';

        $errors = $instance->assignFromObject($dto);
        $expected = 3;
        $actual = sizeof($errors);
        $this->assertEquals($expected,$actual);

        $dto->frequency = '1 day';
        $dto->taskname = 'task name';
        $dto->namespace = 'namespace';
        $dto->startdate = '2/12/2019';
        unset($dto->enddate);

        $errors = $instance->assignFromObject($dto);
        $this->assertEmpty($errors);

        $this->assertEquals($dto->frequency, $instance->frequency);
        $this->assertEquals($dto->taskname , $instance->taskname );
        $this->assertEquals($dto->namespace, $instance->namespace);
        $this->assertNotEmpty($instance->startdate);
        $this->assertEmpty($instance->enddate);
        $this->assertEquals($dto->inputs,    $instance->inputs  );
        $this->assertEquals($dto->comments,  $instance->comments );
        $this->assertEquals(1,$instance->active);
        $this->assertEquals(0,$instance->id);

        $dto->id = 3;
        $dto->active = 0;
        $instance = new TaskQueueEntry();
        $errors = $instance->assignFromObject($dto);
        $this->assertEmpty($errors);
        $this->assertEquals(0,$instance->active);
        $this->assertEquals(3,$instance->id);

    }
}
