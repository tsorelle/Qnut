<?php 
/** 
 * Created by /tools/create-model.php 
 * Time:  2017-11-15 13:11:28
 */ 

namespace Peanut\QnutDirectory\db\model\entity;

class Organization  extends \Tops\db\NamedEntity
{
    public $addressId;
    public $organizationType;

    public function assignFromObject($dto)
    {
        parent::assignFromObject($dto);
        if (isset($dto->addressId)) {
            $this->addressId = $dto->addressId;
        }
        if (isset($dto->organizationType)) {
            $this->organizationType = $dto->organizationType;
        }

    }
}