<?php 
/** 
 * Created by /tools/create-model.php 
 * Time:  2017-10-18 15:31:41
 */ 
namespace Peanut\qnut\cms;


use \PDO;
use PDOStatement;
use Tops\db\TDatabase;
use Tops\db\TEntityRepository;
use Tops\sys\TStrings;

class RolesRepository extends TEntityRepository 
{
    protected function getClassName() {
        return 'Peanut\qnut\cms\CmsRole';
    }

    protected function getTableName() {
        return 'qcms_roles';
    }

    protected function getDatabaseId() {
        return null;
    }
    protected function getLookupField() {
        return 'rolename';
    }

    /**
     * @param $rolename
     * @return bool|CmsRole
     */
    public function getRole($rolename) {
        $rolename = TStrings::ConvertNameFormat($rolename,TStrings::dashedFormat);
        /**
         * @var $role CmsRole
         */
        $role = $this->getEntity($rolename);
        return empty($role) ? false : $role;
    }

    protected function getFieldDefinitionList()
    {
        return array(
        'id'=>PDO::PARAM_INT,
        'rolename'=>PDO::PARAM_STR);
    }
}