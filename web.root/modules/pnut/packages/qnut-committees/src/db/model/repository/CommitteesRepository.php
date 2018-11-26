<?php 
/** 
 * Created by /tools/create-model.php 
 * Time:  2018-11-19 12:04:22
 */ 
namespace Peanut\QnutCommittees\db\model\repository;


use \PDO;

class CommitteesRepository extends \Tops\db\TNamedEntitiesRepository
{
    protected function getTableName() {
        return 'qnut_committees';
    }

    public function getReport()
    {
        $sql =
            'SELECT c.id AS committeeId, '.
            'c.name AS committeeName,  '.
            'cm.statusId AS statusId,  '.
            "CONCAT(TRIM(firstname),IF(middlename IS NULL OR middlename = '','',CONCAT(' ',TRIM(middlename))),' ', lastname) AS memberName, ".
            'p.email AS email, '.
            "IF((ISNULL(p.phone) OR (p.phone = '')),a.phone,p.phone) AS phone, ".
            "IF((cm.roleId > 1),CONCAT('(',cr.name,')'),'') AS role, ".
            "(CASE cm.statusId WHEN 1 THEN 'First reading' WHEN 2 THEN 'Second reading' ELSE '' END) AS nominationStatus ".
            'FROM `qnut_committees` c '.
            'JOIN `qnut_committee_members` cm ON cm.committeeId = c.id '.
            'JOIN `qnut_persons` p ON p.id = cm.personId '.
            'LEFT JOIN `qnut_addresses` a ON a.id = p.addressID '.
            'JOIN `qnut_committee_roles` cr ON cm.roleId = cr.id '.
            'WHERE (ISNULL(cm.dateRelieved) AND (c.active = 1)) '.
            'ORDER BY c.name,cm.statusId,p.lastName,p.firstName ';

        $stmt = $this->executeStatement($sql);
        return $stmt->fetchAll(PDO::FETCH_OBJ);

    }

    protected function getDatabaseId() {
        return null;
    }

    protected function getClassName() {
        return 'Peanut\QnutCommittees\db\model\entity\Committee';
    }

    protected function getFieldDefinitionList()
    {
        return array(
        'id'=>PDO::PARAM_INT,
        'code'=>PDO::PARAM_STR,
        'name'=>PDO::PARAM_STR,
        'description'=>PDO::PARAM_STR,
        'organizationId'=>PDO::PARAM_INT,
        'fulldescription'=>PDO::PARAM_STR,
        'mailbox'=>PDO::PARAM_STR,
        'isStanding'=>PDO::PARAM_STR,
        'isLiaison'=>PDO::PARAM_STR,
        'membershipRequired'=>PDO::PARAM_STR,
        'notes'=>PDO::PARAM_STR,
        'createdby'=>PDO::PARAM_STR,
        'createdon'=>PDO::PARAM_STR,
        'changedby'=>PDO::PARAM_STR,
        'changedon'=>PDO::PARAM_STR,
        'active'=>PDO::PARAM_STR);
    }

    public function getCommitteeList() {
        $sql = 'SELECT `name` AS Name, id AS Value, IF (active = 1,1,0) AS active FROM '.$this->getTableName();
        $stmt = $this->executeStatement($sql);
        return $stmt->fetchAll(PDO::FETCH_OBJ);
    }

}