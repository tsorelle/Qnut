<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 10/18/2017
 * Time: 8:08 AM
 */

use PHPUnit\Framework\TestCase;

class DatabaseTest extends TestCase
{
    private function ClearCaches() {
        \Tops\sys\TObjectContainer::ClearCache();
        \Tops\db\TDatabase::ClearCache();
    }


    public function testConnection() {
        $this->ClearCaches();
        $dbh = \Tops\db\TDatabase::getConnection();
        $this->assertNotNull($dbh);
        $q = $dbh->prepare("SHOW TABLES");
        $q->execute();
        $tables = $q->fetchAll(PDO::FETCH_COLUMN);
        $this->assertNotEmpty($tables);
    }
}
