<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 9/9/2017
 * Time: 7:23 AM
 */

use PHPUnit\Framework\TestCase;
use Tops\mail\TDbMailboxManager;

class MailboxRepositoryTest extends TestCase
{
    public function testGetMailbox() {
        $manager = new TDBMailboxManager();
        $this->assertNotNull($manager);
        $expected = 'clerk';
        $actual = $manager->findByCode($expected);
        $this->assertNotNull($actual);
        $this->assertEquals($expected,$actual->getMailboxCode());
        $actualCode = $actual->getMailboxCode();
        $displayText = $actual->getName();
        $address = $actual->getEmail();
        $id = $actual->getMailboxId();
        $description = $actual->getDescription();
        $this->assertEquals($expected,$actualCode);
    }

}
