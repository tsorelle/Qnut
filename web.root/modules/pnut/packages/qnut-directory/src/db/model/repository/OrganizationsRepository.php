<?php 
/** 
 * Created by /tools/create-model.php 
 * Time:  2017-11-15 13:11:28
 */ 
namespace Peanut\QnutDirectory\db\model\repository;


use \PDO;
use PDOStatement;
use Tops\db\TDatabase;
use \Tops\db\TNamedEntitiesRepository;

class OrganizationsRepository extends \Tops\db\TNamedEntitiesRepository
{
    public function getOrganizationsList($pageNumber=1,$pageSize=0,$showInactive=false)
    {
        $sql = 'SELECT o.id, o.name, o.code, t.name AS typeName FROM  qnut_organizations o '.
                'JOIN qnut_organizationtypes t ON o.organizationType = t.id ';
        if (!$showInactive) {
            $sql .= 'WHERE o.active=1 ';
        }
        if ($pageSize>0) {
            $sql .= sprintf('LIMIT %d OFFSET %d',$pageSize,($pageNumber-1) * $pageSize);
        }
        $stmt = $this->executeStatement($sql);
        return $stmt->fetchAll(PDO::FETCH_OBJ);
    }

    protected function getTableName() {
        return 'qnut_organizations';
    }

    protected function getDatabaseId() {
        return null;
    }

    protected function getClassName() {
        return 'Peanut\QnutDirectory\db\model\entity\Organization';
    }

    protected function getFieldDefinitionList()
    {
        return array(
            'id'=>PDO::PARAM_INT,
            'addressId'=>PDO::PARAM_INT,
            'code'=>PDO::PARAM_STR,
            'name'=>PDO::PARAM_STR,
            'description'=>PDO::PARAM_STR,
            'organizationType'=>PDO::PARAM_INT,
            'email'=>PDO::PARAM_STR,
            'phone'=>PDO::PARAM_STR,
            'fax'=>PDO::PARAM_STR,
            'notes'=>PDO::PARAM_STR,
            'createdby'=>PDO::PARAM_STR,
            'createdon'=>PDO::PARAM_STR,
            'changedby'=>PDO::PARAM_STR,
            'changedon'=>PDO::PARAM_STR,
            'active'=>PDO::PARAM_STR);
    }
}