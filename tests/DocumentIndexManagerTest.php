<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 6/30/2018
 * Time: 6:04 AM
 */

use Peanut\QnutDocuments\DocumentManager;
use PHPUnit\Framework\TestCase;

class DocumentIndexManagerTest extends TestCase
{

    public function testGetDocument()
    {
        $this->assertTrue(true);
    }

    public function testGetMetaData()
    {
        $manager = new DocumentManager();
        $actual = $manager->getMetaData();
        $this->assertNotNull($actual);
    }
}
