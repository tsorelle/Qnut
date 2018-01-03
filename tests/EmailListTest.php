<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 1/2/2018
 * Time: 6:44 AM
 */

use Peanut\QnutDirectory\db\model\entity\EmailList;
use PHPUnit\Framework\TestCase;

class EmailListTest extends TestCase
{

    public function testAssignFromObject()
    {
        $dto = new stdClass();
        $dto->id = 13;
        $dto->code = 'testlist';
        $dto->name ='Test List';
        $dto->description='a description';
        $dto->mailBox = 'two-quakers-support';
        $dto->createdon = 'invalid';// '2017-02-01';
        $dto->createdby = 'someone';

        $instance = new EmailList();
        $instance->assignFromObject($dto,'terry');

        $this->assertEquals($instance->id,$dto->id);
        $this->assertEquals($instance->code,$dto->code);
        $this->assertEquals($instance->name,$dto->name);
        $this->assertEquals($instance->description,$dto->description);
        $this->assertEquals($instance->mailBox,$dto->mailBox);

    }

/*
    public function testAssignAll()
    {
        $dto = new stdClass();
        $dto->id = 13;
        $dto->code = 'testlist';
        $dto->name ='Test List';
        $dto->description='a description';
        $dto->mailBox = 'two-quakers-support';

        $instance1 = new EmailList();
        $instance2 = new EmailList();

        $instance1->assignAll($dto);
        $instance2->assignFromObject($dto);

        $this->assertEquals($instance1->id,$instance2->id);
        $this->assertEquals($instance1->code,$instance2->code);
        $this->assertEquals($instance1->name,$instance2->name);
        $this->assertEquals($instance1->description,$instance2->description);
        $this->assertEquals($instance1->mailBox,$instance2->mailBox);

    }*/
}
