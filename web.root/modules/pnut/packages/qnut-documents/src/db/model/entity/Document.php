<?php 
/** 
 * Created by /tools/create-model.php 
 * Time:  2018-06-19 22:31:43
 */ 

namespace Peanut\QnutDocuments\db\model\entity;

class Document  extends \Tops\db\TimeStampedEntity
{
    public $id;
    public $title;
    public $filename;
    public $location;
    public $abstract;
    public $keywords;
    public $protected;
    public $publicationDate;
}
