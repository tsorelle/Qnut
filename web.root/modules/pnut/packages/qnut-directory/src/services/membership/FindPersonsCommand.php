<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 11/29/2018
 * Time: 11:45 AM
 */

namespace Peanut\QnutDirectory\services\membership;


use Peanut\QnutDirectory\db\DirectoryManager;
use Tops\services\TServiceCommand;

class FindPersonsCommand  extends TServiceCommand
{
    protected function run()
    {
        $request = $this->GetRequest();
        $manager = new DirectoryManager();
        $results = $manager->findPersons($request);
        foreach ($results as $item) {
            // Clean respose for ajax. Name field may have non utf8 characters.
            $item->Name = trim(utf8_encode($item->Name));
        }
        $this->SetReturnValue($results);
    }
}