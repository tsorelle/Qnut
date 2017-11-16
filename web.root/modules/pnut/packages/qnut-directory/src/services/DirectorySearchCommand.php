<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 11/15/2017
 * Time: 5:06 AM
 */

namespace Peanut\QnutDirectory\services;


use Peanut\QnutDirectory\db\DirectoryManager;
use Tops\services\TServiceCommand;
use Tops\sys\TPermissionsManager;

class DirectorySearchCommand extends TServiceCommand
{
    public function __construct() {
        $this->addAuthorization(TPermissionsManager::viewDirectoryPermissionName);
    }

    protected function run()
    {
        $searchRequest = $this->getRequest();
        $result = array();
        $manager = new DirectoryManager();
        if ($searchRequest->Name == 'Persons') {
            $result = $manager->getPersonList($searchRequest->Value);
        }
        else if ($searchRequest->Name == 'Addresses') {
            $result = $manager->getAddressList($searchRequest->Value);
        }

        $this->setReturnValue($result);
        if (empty($result)) {
            $this->addErrorMessage('No '.strtolower($searchRequest->Name).' found.');
        }

    }
}