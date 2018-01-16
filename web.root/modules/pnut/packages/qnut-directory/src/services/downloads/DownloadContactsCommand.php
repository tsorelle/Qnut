<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 1/16/2018
 * Time: 2:31 PM
 */

namespace Peanut\QnutDirectory\services\downloads;


use Tops\services\TServiceCommand;
use Tops\sys\TPermissionsManager;

class DownloadContactsCommand extends TServiceCommand
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

        $directoryonly = !empty($request->directoryonly);
        $includekids = !empty($request->includekids);
        $affiliation = empty($request->affiliation) ? false : $request->affiliation;

        // todo:: implement download
        $response = new \stdClass();

    }
}