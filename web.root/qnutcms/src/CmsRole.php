<?php 
/** 
 * Created by /tools/create-model.php 
 * Time:  2017-10-18 15:31:41
 */ 

namespace Peanut\qnut\cms;

class CmsRole
{ 
    public $id;
    public $rolename;

    public static function Create($name)
    {
        $result = new CmsRole();
        $result->id = 0;
        $result->rolename = $name;
        return $result;
    }
} 
