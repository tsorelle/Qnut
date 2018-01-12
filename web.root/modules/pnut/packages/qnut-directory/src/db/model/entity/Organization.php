<?php 
/** 
 * Created by /tools/create-model.php 
 * Time:  2017-11-15 13:11:28
 */ 

namespace Peanut\QnutDirectory\db\model\entity;

use Tops\db\NamedEntity;
use Tops\db\TimeStampedEntity;

class Organization  extends NamedEntity
{
    public $addressId;
    public $organizationType;
    public $email;
    public $phone;
    public $fax;
    public $notes;

}