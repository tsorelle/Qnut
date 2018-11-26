<?php 
/** 
 * Created by /tools/create-model.php 
 * Time:  2018-11-19 12:04:22
 */ 

namespace Peanut\QnutCommittees\db\model\entity;

class Committee  extends \Tops\db\NamedEntity
{ 
    public $organizationId;
    public $fulldescription;
    public $mailbox;
    public $isStanding;
    public $isLiaison;
    public $membershipRequired;
    public $notes;

    public function getDtoDataTypes()
    {
        $types = parent::getDtoDataTypes();
        $types['isStanding'] = \Tops\sys\TDataTransfer::dataTypeFlag;
        $types['isLiaison'] = \Tops\sys\TDataTransfer::dataTypeFlag;
        $types['membershipRequired'] = \Tops\sys\TDataTransfer::dataTypeFlag;
        return $types;
    }
}
