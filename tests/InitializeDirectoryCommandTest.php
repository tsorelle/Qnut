<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 11/29/2017
 * Time: 7:00 AM
 */

use Peanut\QnutDirectory\services\InitializeDirectoryCommand;
use PHPUnit\Framework\TestCase;
use Qnut\test\sys\TestUserFactory;
use Tops\sys\TUser;

class InitializeDirectoryCommandTest extends TestCase
{
    public function testGetLookupsOnly() {
        TestUserFactory::setAdmin();
        TUser::setUserFactory(new TestUserFactory());
        $service = new InitializeDirectoryCommand();
        $actual = $service->execute(null);
        $this->assertNotNull($actual);
    }

    public function testGetPersonAndLookups() {
        TestUserFactory::setAdmin();
        TUser::setUserFactory(new TestUserFactory());
        $service = new InitializeDirectoryCommand();
        $request = 173;
        $actual = $service->execute($request);
        $this->assertNotNull($actual);
    }
}
