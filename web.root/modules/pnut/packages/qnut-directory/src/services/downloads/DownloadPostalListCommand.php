<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 1/16/2018
 * Time: 2:32 PM
 */

namespace Peanut\QnutDirectory\services\downloads;


use Tops\services\TServiceCommand;
use Tops\sys\TPermissionsManager;

class DownloadPostalListCommand extends TServiceCommand
{

    public function __construct() {
        $this->addAuthorization(TPermissionsManager::viewDirectoryPermissionName);
    }

    protected function run()
    {
        $request = $this->getRequest();
        if (empty($request)) {
            $this->addErrorMessage('service-no-request');
            return;
        }
        // todo:: implement download
        $response = new \stdClass();

    }
}