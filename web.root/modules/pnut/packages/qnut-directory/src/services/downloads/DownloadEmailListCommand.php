<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 1/16/2018
 * Time: 2:33 PM
 */

namespace Peanut\QnutDirectory\services\downloads;


use Tops\services\TServiceCommand;
use Tops\sys\TLanguage;
use Tops\sys\TPermissionsManager;

class DownloadEmailListCommand extends TServiceCommand
{

    public function __construct() {
        $this->addAuthorization(TPermissionsManager::viewDirectoryPermissionName);
    }

    protected function run()
    {
        $request = $this->getRequest();
        $listEntity = TLanguage::text('list-code'); // todo: translation
        if (empty($request)) {
            $this->addErrorMessage('service-no-request');
            return;
        }
        if (empty($request->list)) {
            $this->addErrorMessage('service-no-request-value',[$listEntity]);
            return;
        }

        $listCode = $request->list;

        // todo:: implement download
        $response = new \stdClass();

    }
}