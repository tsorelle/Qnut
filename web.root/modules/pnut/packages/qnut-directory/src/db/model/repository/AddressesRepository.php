<?php 
/** 
 * Created by /tools/create-model.php 
 * Time:  2017-11-15 13:11:28
 */ 
namespace Peanut\QnutDirectory\db\model\repository;


use \PDO;
use PDOStatement;
use Tops\db\TDatabase;
use \Tops\db\TEntityRepository;

class AddressesRepository extends \Tops\db\TEntityRepository
{

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
            "addressname LIKE :search OR sortkey LIKE :search  ORDER BY addressname,sortkey");

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
        'addresstype'=>PDO::PARAM_INT,
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