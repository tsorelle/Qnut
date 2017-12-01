<?php 
/** 
 * Created by /tools/create-model.php 
 * Time:  2017-11-15 13:11:28
 */ 
namespace Peanut\QnutDirectory\db\model\repository;


use \PDO;
use PDOStatement;
use Peanut\QnutDirectory\db\model\entity\Address;
use Tops\db\TDatabase;
use \Tops\db\TEntityRepository;

class AddressesRepository extends \Tops\db\TEntityRepository
{

    private $subscriptionsAssociation;
    private function getSubscriptionsAssociation()
    {
        if (!isset($this->subscriptionsAssociation)) {
            $this->subscriptionsAssociation = new PostalSubscriptionAssociation();
        }
        return $this->subscriptionsAssociation;
    }

    /**
     * @param $address Address
     * @param $newSubsctiptions
     */
    public function updateSubscriptions($address,$newSubsctiptions = null)
    {
        if ($newSubsctiptions === null && isset($address->postalSubscriptions)) {
            $newSubsctiptions = $address->postalSubscriptions;
        }
        if (is_array($newSubsctiptions)) {
            $this->getSubscriptionsAssociation()->updateSubscriptions($address->id, $newSubsctiptions);
        }
    }

    public function insert($dto, $userName = 'admin')
    {
        $id = parent::insert($dto, $userName);
        if ($id && isset($dto->postalSubscriptions)) {
            $this->addSubscriptions($id, $dto->postalSubscriptions);
        }
        return $id;
    }

    public function remove($id)
    {
        $this->getSubscriptionsAssociation()->removeSubscriber($id);
        return parent::remove($id);
    }

    private function addSubscriptions($personId, $postalSubscriptions)
    {
        $associations = $this->getSubscriptionsAssociation();
        foreach ($postalSubscriptions as $listId) {
            $associations->subscribe($personId,$listId);
        }
    }


    public function update($dto, $userName = 'admin')
    {
        $result = parent::update($dto, $userName);
        if ($result && isset($dto->postalSubscriptions)) {
            $this->updateSubscriptions($dto);
        }
        return $result;
    }


    /**
     * @param $name
     * @param bool $includeInactive
     * @return \stdClass[]  conforming to:
     *
     *   export interface IListItem {
     *       Text: string;
     *       Value: any;
     *       Description: string;
     *   }
     */
    public function search($searchValue,$includeInactive=false) {
        $searchValue = "%$searchValue%";
        $sql = $this->addSqlConditionals(
            "SELECT addressname AS `Name`, id AS `Value`, ".
            "CONCAT(addressname,  ".
            "    CONCAT ( ".
            "        IF((city IS NOT NULL AND city !='') OR (state IS NOT NULL AND state !='') OR (country IS NOT NULL AND country !=''),', ','') ".
            "        , IF(city IS NULL OR city='','',city) ".
            "        , IF(state IS NULL OR state='','',   CONCAT( IF(city IS NULL OR city='','',', '),state)), ".
            "             IF((state IS NULL OR state='') OR (city IS NULL OR city=''),'',' '), IFNULL(country,'')) ".
            "   ) AS Description FROM ".$this->getTableName(),
            $includeInactive,
            "addressname LIKE :search OR sortkey LIKE :search",
            "ORDER BY addressname,sortkey");

        $dbh = $this->getConnection();
        /**
         * @var PDOStatement
         */
        $stmt = $dbh->prepare($sql);
        $stmt->bindParam(':search',$searchValue);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_OBJ);
        return $result;
    }

    protected function getTableName() {
        return 'qnut_addresses';
    }

    public function getPostalSubscriptions($addressId)
    {
        $sql = 'SELECT listId FROM qnut_postal_subscriptions WHERE addressId=?';
        $stmt = $this->executeStatement($sql,[$addressId]);
        $result = $stmt->fetchAll(PDO::FETCH_COLUMN);
        return $result;
    }

    /**
     * @param Address $address
     */
    public function setPostalSubscriptions($address) {
        $address->setPostalSubscriptions($this->getPostalSubscriptions($address->id));
    }

    protected function getDatabaseId() {
        return null;
    }

    protected function getClassName() {
        return 'Peanut\QnutDirectory\db\model\entity\Address';
    }

    protected function getFieldDefinitionList()
    {
        return array(
        'id'=>PDO::PARAM_INT,
        'addressname'=>PDO::PARAM_STR,
        'address1'=>PDO::PARAM_STR,
        'address2'=>PDO::PARAM_STR,
        'city'=>PDO::PARAM_STR,
        'state'=>PDO::PARAM_STR,
        'postalcode'=>PDO::PARAM_STR,
        'country'=>PDO::PARAM_STR,
        'phone'=>PDO::PARAM_STR,
        'notes'=>PDO::PARAM_STR,
        'addresstypeId'=>PDO::PARAM_INT,
        'sortkey'=>PDO::PARAM_STR,
        'listingtypeId'=>PDO::PARAM_INT,
        'latitude'=>PDO::PARAM_STR,
        'longitude'=>PDO::PARAM_STR,
        'active'=>PDO::PARAM_STR,
        'createdby'=>PDO::PARAM_STR,
        'createdon'=>PDO::PARAM_STR,
        'changedby'=>PDO::PARAM_STR,
        'changedon'=>PDO::PARAM_STR);
    }

 }