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


    public function testArr() {
        $this->ClearCaches();
        $dbh = \Tops\db\TDatabase::getConnection();
        $q = $dbh->prepare("SELECT id from qnut_persons");
        $s = $q->execute();
        $a = $q->fetchAll(PDO::FETCH_COLUMN);
        $this->assertNotEmpty($a);


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

    public function testEmailAsso() {
        $repository = new \Peanut\QnutDirectory\db\model\repository\EmailSubscriptionAssociation();
        $listId = 12;
        $personId = 173;
        $subscriptions = [9,10,11,12];

        $repository->removeSubscriber($personId);
        $repository->updateSubscriptions($personId,$subscriptions);

        $actual = $repository->getLists($personId);
        $this->assertNotEmpty($actual);

        $actual = $repository->getListValues($personId);
        $this->assertNotEmpty($actual);

        $actual = $repository->getSubscribers($listId);
        $this->assertNotEmpty($actual);

        $actual = $repository->getSubscriberValues($listId);
        $this->assertNotEmpty($actual);

        $repository->updateSubscriptions($personId,[9,10,12,100,101]);

        $repository->unsubscribe($personId,$listId);

        $repository->subscribe($personId,$listId);

        $repository->removeList($listId);

        $repository->updateSubscriptions($personId,$subscriptions);

    }

    public function testPostalAsso() {
        $repository = new \Peanut\QnutDirectory\db\model\repository\PostalSubscriptionAssociation();
        $actual = $repository->getLists(110);
        $this->assertNotEmpty($actual);

        $actual = $repository->getRightValues(110);
        $this->assertNotEmpty($actual);

        $actual = $repository->getAddresses(1);
        $this->assertNotEmpty($actual);

        $actual = $repository->getLeftValues(1);
        $this->assertNotEmpty($actual);


    }


}
