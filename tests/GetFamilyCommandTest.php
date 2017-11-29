<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 11/28/2017
 * Time: 7:36 AM
 */
use Peanut\QnutDirectory\services\GetFamilyCommand;
use PHPUnit\Framework\TestCase;
use Qnut\test\sys\TestUserFactory;
use Tops\sys\TUser;

class GetFamilyCommandTest extends TestCase
{
    public function testRun() {
        TestUserFactory::setAdmin();
        TUser::setUserFactory(new TestUserFactory());
        $service = new GetFamilyCommand();
        $request = new stdClass();
        $request->Name = 'Persons';
        $request->Value = 173;
        $actual = $service->execute($request);
        $this->assertNotNull($actual);
    }
}
