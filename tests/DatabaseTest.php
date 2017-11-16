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

    public function testPersonsSearch() {
        $repository = new \Peanut\QnutDirectory\db\model\repository\PersonsRepository();
        $searchVal = 'terry.sorelle@outlook.com';
        $actual = $repository->search($searchVal);
        $searchVal = 'sorelle';
        $actual = $repository->search($searchVal);
        $this->assertNotEmpty($actual);
        $searchVal = 'tom';
        $actual = $repository->search($searchVal);
        $this->assertNotEmpty($actual);

    }

    public function testAddressSearch() {
        $repository = new \Peanut\QnutDirectory\db\model\repository\AddressesRepository();
        $searchVal = 'sorelle';
        $actual = $repository->search($searchVal);
        $this->assertNotEmpty($actual);
        $searchVal = 'tom';
        $actual = $repository->search($searchVal);
        $this->assertNotEmpty($actual);

    }


}
