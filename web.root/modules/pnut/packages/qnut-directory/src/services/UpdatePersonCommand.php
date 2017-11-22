<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 11/22/2017
 * Time: 8:39 AM
 */

namespace Peanut\QnutDirectory\services;


use Tops\services\TServiceCommand;
use Tops\sys\TPermissionsManager;

class UpdatePersonCommand extends TServiceCommand
{
    public function __construct() {
        $this->addAuthorization(TPermissionsManager::updateDirectoryPermissionName);
    }


    protected function run()
    {
        $request = $this->getRequest();

        $this->addErrorMessage('Not implemented yet');
    }
}