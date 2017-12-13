<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 12/12/2017
 * Time: 1:04 PM
 */

use Peanut\QnutDirectory\sys\MailTemplateManager;
use PHPUnit\Framework\TestCase;

class MailTemplateManagerTest extends TestCase
{
    public function testGetTemplateList() {
        $actual = MailTemplateManager::GetTemplateList();
        $this->assertNotEmpty($actual);
    }
}
