<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 6/30/2018
 * Time: 6:04 AM
 */

use Peanut\QnutDocuments\db\model\DocumentIndexManager;
use PHPUnit\Framework\TestCase;

class DocumentIndexManagerTest extends TestCase
{

    public function testGetDocument()
    {
        $this->assertTrue(true);
    }

    public function testGetMetaData()
    {
        $manager = new DocumentIndexManager();
        $actual = $manager->getMetaData();
        $this->assertNotNull($actual);

    }
}
