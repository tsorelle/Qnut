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

class PersonsRepository extends \Tops\db\TEntityRepository
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
            "SELECT fullname AS `Name`, id AS `Value`,CONCAT(fullname,IF (email IS NULL OR email = '','',".
            "CONCAT(' (',email,')')))  AS Description FROM ".$this->getTableName(),
            $includeInactive,
            "fullname LIKE :search OR email LIKE :search  OR sortkey LIKE :search ORDER BY fullname,sortkey");

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
        return 'qnut_persons';
    }

    protected function getDatabaseId() {
        return null;
    }

    protected function getClassName() {
        return 'Peanut\QnutDirectory\db\model\entity\Person';
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
        'junior'=>PDO::PARAM_STR,
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