<?php 
/** 
 * Created by /tools/create-model.php 
 * Time:  2018-11-19 12:04:22
 */ 

namespace Peanut\QnutCommittees\db\model\entity;

class CommitteeMember  extends \Tops\db\TimeStampedEntity
{ 
    public $id;
    public $committeeId;
    public $personId;
    public $roleId;
    public $notes;
    public $statusId;
    public $startOfService;
    public $endOfService;
    public $dateRelieved;
    public $active;

    public function getDtoDataTypes()
    {
        $types = parent::getDtoDataTypes();
        $types['startOfService'] = \Tops\sys\TDataTransfer::dataTypeDate;
        $types['endOfService'] = \Tops\sys\TDataTransfer::dataTypeDate;
        $types['dateRelieved'] = \Tops\sys\TDataTransfer::dataTypeDate;
        return $types;
    }
}
