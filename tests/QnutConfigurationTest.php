<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 9/9/2017
 * Time: 5:40 AM
 */

use Qnut\sys\QnutConfiguration;
use PHPUnit\Framework\TestCase;

class QnutConfigurationTest extends TestCase
{
    public function testGetSetting() {
        $expected = 'test';
        $actual = QnutConfiguration::GetSetting('testvalue');
        $this->assertEquals($expected,$actual);

    }

    public function testGetDatabaseId() {
        $expected = 'default';
        $actual = QnutConfiguration::GetDatabaseId();
        $this->assertEquals($expected,$actual);
    }
}
