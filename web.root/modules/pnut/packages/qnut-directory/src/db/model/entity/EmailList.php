<?php 
/** 
 * Created by /tools/create-model.php 
 * Time:  2017-11-15 13:11:28
 */ 

namespace Peanut\QnutDirectory\db\model\entity;

class EmailList  extends \Tops\db\NamedEntity
{
    public $mailBox;

    public function assignFromObject($dto)
    {
        parent::assignFromObject($dto);
        if (isset($dto->mailBox)) {
            $this->mailBox = $dto->mailBox;
        }
    }
}