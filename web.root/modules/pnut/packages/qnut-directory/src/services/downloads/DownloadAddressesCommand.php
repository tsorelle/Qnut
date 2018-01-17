<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 1/16/2018
 * Time: 2:31 PM
 */

namespace Peanut\QnutDirectory\services\downloads;


use Peanut\QnutDirectory\db\model\repository\AddressesRepository;
use Tops\services\TServiceCommand;
use Tops\sys\TCsvFormatter;
use Tops\sys\TDates;
use Tops\sys\TPermissionsManager;

class DownloadAddressesCommand  extends TServiceCommand
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
        $residenceonly = !empty($request->residenceonly);

        $repository = new AddressesRepository();
        $addresses = $repository->getAddressesForDownload($residenceonly,$directoryonly);
        $csv = TCsvFormatter::ToCsv($addresses);
        $response = new \stdClass();
        $response->data = $csv;

        $response->filename = 'addresses-';
        if ($directoryonly) {
            $response->filename .= 'directory-';
        }
        if ($residenceonly) {
            $response->filename .= 'residences-';
        }
        $response->filename .= TDates::now(TDates::FilenameTimeFormat);

        $this->setReturnValue($response);
    }
}