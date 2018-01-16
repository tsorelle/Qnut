<?php 
/** 
 * Created by /tools/create-model.php 
 * Time:  2017-11-15 13:11:28
 */
namespace Peanut\QnutDirectory\db\model\repository;


use \PDO;
use PDOStatement;
use Peanut\QnutDirectory\db\model\entity\Person;
use Tops\db\TDatabase;
use \Tops\db\TEntityRepository;

class PersonsRepository extends \Tops\db\TEntityRepository
{
    private $subscriptionsAssociation;
    private function getSubscriptionsAssociation()
    {
        if (!isset($this->subscriptionsAssociation)) {
            $this->subscriptionsAssociation = new EmailSubscriptionAssociation();
        }
        return $this->subscriptionsAssociation;
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
    public function search($searchValue,$excludeAddress=0,
                           $includeInactive=false) {

        $searchValue = "%$searchValue%";
        $where = "fullname LIKE :search OR email LIKE :search  OR sortkey LIKE :search";
        if ($excludeAddress) {
            $where = sprintf('(%s) and (addressId is NULL OR addressId <> :addressId)',$where);
        }
        $sql = $this->addSqlConditionals(
            "SELECT fullname AS `Name`, id AS `Value`,CONCAT(fullname,IF (email IS NULL OR email = '','',".
            "CONCAT(' (',email,')')))  AS Description FROM ".$this->getTableName(),
            $includeInactive,
            $where, // "fullname LIKE :search OR email LIKE :search  OR sortkey LIKE :search",
            "ORDER BY fullname,sortkey");

        $dbh = $this->getConnection();
        /**
         * @var PDOStatement
         */
        $stmt = $dbh->prepare($sql);
        $stmt->bindParam(':search',$searchValue);
        if ($excludeAddress) {
            $stmt->bindParam(':addressId',$excludeAddress);
        }
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_OBJ);
        return $result;
    }

    public function getAddressResidents($addressId,$includeInactive=false)
    {
        return $this->getEntityCollection("addressId = ? AND deceased is null",[$addressId],$includeInactive);
    }

    protected function getTableName() {
        return 'qnut_persons';
    }

    protected function getDatabaseId() {
        return null;
    }

    protected function getClassName() {
        return 'Peanut\QnutDirectory\db\model\entity\Person';
    }

    public function getAffiliations($personId) {
        $sql = 'select organizationId,roleId from qnut_person_affiliations WHERE personId=?';
        $stmt = $this->executeStatement($sql,[$personId]);
        $result = $stmt->fetchAll(PDO::FETCH_OBJ);
        return $result;
    }

    /**
     * @param Person $person
     */
    public function setAffiliations(&$person) {
        $person->setAffilliations($this->getAffiliations($person->id));
    }

    public function getSubscriptionValues($personId) {
        return $this->getSubscriptionsAssociation()->getListValues($personId);
    }

    /**
     * @param Person $person
     */
    public function setSubscriptions(&$person) {

        $subscriptions = $this->getSubscriptionValues($person->id);
        if ($subscriptions === false) {
            return;
        }
        $person->setEmailSubscriptions($this->getSubscriptionValues($person->id));
    }




    /**
     * @param Person $person
     */
    public function setSubscriptionValues(&$person) {
        $person->setEmailSubscriptions($this->getSubscriptionValues($person->id));
    }



    /**
     * @param $affiliation
     * @param array $list
     *
     * Data structure:
     *   export interface IAffiliation {
     * 		organizationId: any;
     * 		roleId: any;
     * 	 }
     */
    private function hasAffiliation($affiliation,array $list) {
        foreach ($list as $item) {
            if ($item->organizationId == $affiliation->organizationId && $item->roleId == $affiliation->roleId) {
                return true;
            }
        }
        return false;
    }

    public function addAffiliations($personId,array $affiliations) {
        $dbh = $this->getConnection();
        $insertSql = 'INSERT INTO qnut_person_affiliations (personId,organizationId,roleId) VALUES (?,?,?)';
        $stmt = $dbh->prepare($insertSql);
        foreach ($affiliations as $affiliation) {
            $stmt->execute([$personId,$affiliation->organizationId,$affiliation->roleId]);
        }
    }

    public function addSubscriptions($personId,array $subscriptions) {
        $associations = $this->getSubscriptionsAssociation();
        foreach ($subscriptions as $listId) {
            $associations->subscribe($personId,$listId);
        }
    }

    /**
     * @param $person Person
     * @param array $newAffiliations
     */
    public function updateAffiliations(Person $person) {
        $existing = $this->getAffiliations($person->id);
        $affiliationsToAdd = array_filter($person->affiliations, function($a) use ($existing) {
            return $this->hasAffiliation($a,$existing) === false;
        });
        $affiliationsToDelete = array_filter($existing, function($a) use ($person) {
            return $this->hasAffiliation($a,$person->affiliations) === false;
        });
        $addCount = sizeof($affiliationsToAdd);
        $deleteCount = sizeof($affiliationsToDelete);
        if ($addCount + $deleteCount > 0) {
            $dbh = $this->getConnection();
            if ($deleteCount > 0) {
                $deleteSql = 'DELETE FROM qnut_person_affiliations WHERE personId=? AND organizationId = ? AND roleId=?';
                $stmt = $dbh->prepare($deleteSql);
                foreach ($affiliationsToDelete as $affiliation) {
                    $stmt->execute([$person->id,$affiliation->organizationId,$affiliation->roleId]);
                }
            }
            if ($addCount > 0) {
                $insertSql = 'INSERT INTO qnut_person_affiliations (personId,organizationId,roleId) VALUES (?,?,?)';
                $stmt = $dbh->prepare($insertSql);
                foreach ($affiliationsToAdd as $affiliation) {
                    $stmt->execute([$person->id,$affiliation->organizationId,$affiliation->roleId]);
                }
            }
        }
    }

    /**
     * @param $person Person
     * @param $newSubsctiption
     */
    public function updateEmailSubscriptions($person,$newSubsctiptions = null) {
        if ($newSubsctiptions === null && isset($person->emailSubscriptions)) {
            $newSubsctiptions = $person->emailSubscriptions;
        }
        if (is_array($newSubsctiptions)) {
            $this->getSubscriptionsAssociation()->updateSubscriptions($person->id,$newSubsctiptions);
        }
    }

    public function update($dto, $userName = 'admin')
    {
        $result = parent::update($dto, $userName);
        if ($result !== false) {
            if (isset($dto->affiliations)) {
                $this->updateAffiliations($dto);
            }
            if (isset($dto->emailSubscriptions)) {
                $this->updateEmailSubscriptions($dto);
            }
        }
        return $result;
    }

    public function assignPersonAddress($personId,$addressId) {
        $sql = 'UPDATE '.$this->getTableName().' SET addressId=? WHERE id=?';
        $this->executeStatement($sql,[$addressId,$personId]);
    }

    public function remove($id)
    {
        $this->getSubscriptionsAssociation()->removeSubscriber($id);
        return parent::remove($id);
    }

    public function insert($dto, $userName = 'admin')
    {
        $id = parent::insert($dto, $userName);
        if (empty($id)) {
            return false;
        }
        if (isset($dto->affiliations)) {
            $this->addAffiliations($id,$dto->affiliations);
        }
        if (isset($dto->emailSubscriptions)) {
            $this->addSubscriptions($id,$dto->emailSubscriptions);
        }
        return $id;

    }

    public function unlinkAddress($addressId) {
        $sql = 'UPDATE '.$this->getTableName().' SET addressId = null where addressId=?';
        $this->executeStatement($sql,[$addressId]);
    }

    public function linkAddress($personId,$addressId) {
        $sql = 'UPDATE '.$this->getTableName().' SET addressId = ? where personId=?';
        $this->executeStatement($sql,[$addressId,$personId]);
    }

    public function getAffiliationsList() {
        $sql = 'SELECT DISTINCT o.id, o.code,o.name,o.description '.
                'FROM qnut_person_affiliations a '.
                'JOIN qnut_organizations o ON a.organizationId = o.id '.
                'ORDER BY o.name';
        $stmt = $this->executeStatement($sql);
        return $stmt->fetchAll(PDO::FETCH_OBJ);
    }

    protected function getFieldDefinitionList()
    {
        return array(
        'id'=>PDO::PARAM_INT,
        'fullname'=>PDO::PARAM_STR,
        'addressId'=>PDO::PARAM_INT,
        'email'=>PDO::PARAM_STR,
        'username'=>PDO::PARAM_STR,
        'phone'=>PDO::PARAM_STR,
        'phone2'=>PDO::PARAM_STR,
        'dateofbirth'=>PDO::PARAM_STR,
        // 'junior'=>PDO::PARAM_STR,
        'deceased'=>PDO::PARAM_STR,
        'listingtypeId'=>PDO::PARAM_INT,
        'sortkey'=>PDO::PARAM_STR,
        'notes'=>PDO::PARAM_STR,
        'createdby'=>PDO::PARAM_STR,
        'createdon'=>PDO::PARAM_STR,
        'changedby'=>PDO::PARAM_STR,
        'changedon'=>PDO::PARAM_STR,
        'active'=>PDO::PARAM_STR);
    }
}