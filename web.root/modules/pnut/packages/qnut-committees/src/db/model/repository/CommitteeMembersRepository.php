<?php 
/** 
 * Created by /tools/create-model.php 
 * Time:  2018-11-19 12:04:22
 */ 
namespace Peanut\QnutCommittees\db\model\repository;


use \PDO;
use PDOStatement;
use Tops\db\TDatabase;
use \Tops\db\TEntityRepository;

class CommitteeMembersRepository extends \Tops\db\TEntityRepository
{
    /**
     * @param $committeeId
     *
     * Returns:
     *      []
     *      			{
     *      			    name: string;
     *      				email: string;
     *      				phone: string;
     *      				role: string;
     *      				termOfService: string;
     *      				dateAdded : string;
     *      				dateUpdated : string;
     */
    public function getMembersList($committeeId)
    {
        $sql =
            'SELECT  cm.id, '. // AS committeeMemberId, cm.committeeId, '.
            "CONCAT(TRIM(firstname),IF(middlename IS NULL OR middlename = '','',CONCAT(' ',TRIM(middlename))),' ', lastname) AS 'name',  ".
            "p.id AS personId, p.email, IF (p.phone IS NULL OR p.phone = '',a.phone,p.phone) AS phone,  ".
            "cm.roleId, IF(cm.roleId = 1,'', CONCAT('(', cr.name,')')) AS role, ".
            "cs.description AS 'status', cm.statusId,cm.startOfService, cm.endOfService, cm.dateRelieved, ".
            'cm.notes, cm.createdon AS dateAdded, cm.changedon AS dateUpdated '.
            'FROM `qnut_committee_members` cm '.
            'JOIN `qnut_persons` p ON p.id = cm.personId '.
            'LEFT OUTER JOIN `qnut_addresses` a ON a.id = p.addressId '.
            'JOIN `qnut_committee_roles` cr ON cr.id = cm.roleId '.
            'JOIN `qnut_committee_statuses` cs ON cs.id = cm.statusId '.
            'WHERE cm.committeeId = ? '.
            'ORDER BY p.lastName,p.firstName,cm.committeeId ';

        $statement = $this->executeStatement($sql,[$committeeId]);
        return $statement->fetchAll(\PDO::FETCH_OBJ);
    }

    protected function getTableName() {
        return 'qnut_committee_members';
    }

    protected function getDatabaseId() {
        return null;
    }

    protected function getClassName() {
        return 'Peanut\QnutCommittees\db\model\entity\CommitteeMember';
    }

    protected function getFieldDefinitionList()
    {
        return array(
        'id'=>PDO::PARAM_INT,
        'committeeId'=>PDO::PARAM_INT,
        'personId'=>PDO::PARAM_INT,
        'roleId'=>PDO::PARAM_INT,
        'notes'=>PDO::PARAM_STR,
        'statusId'=>PDO::PARAM_INT,
        'startOfService'=>PDO::PARAM_STR,
        'endOfService'=>PDO::PARAM_STR,
        'dateRelieved'=>PDO::PARAM_STR,
        'createdby'=>PDO::PARAM_STR,
        'createdon'=>PDO::PARAM_STR,
        'changedby'=>PDO::PARAM_STR,
        'changedon'=>PDO::PARAM_STR,
        'active'=>PDO::PARAM_STR);
    }

}