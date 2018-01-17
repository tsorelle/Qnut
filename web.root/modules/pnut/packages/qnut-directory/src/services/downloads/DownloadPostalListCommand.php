<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 1/16/2018
 * Time: 2:32 PM
 */

namespace Peanut\QnutDirectory\services\downloads;


use Peanut\QnutDirectory\db\model\repository\AddressesRepository;
use Tops\services\TServiceCommand;
use Tops\sys\TCsvFormatter;
use Tops\sys\TDates;
use Tops\sys\TLanguage;
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
        if (empty($request->list)) {
            $listEntity = TLanguage::text('list-code');
            $this->addErrorMessage('service-no-request-value',[$listEntity]);
            return;
        }

        $repository = new AddressesRepository();
        $lists = $repository->getPostalSubscriptionsForDownload($request->list);
        $csv = TCsvFormatter::ToCsv($lists);
        $response = new \stdClass();
        $response->data = $csv;
        $response->filename = 'postal-list-'.$request->list.'-'.TDates::now(TDates::FilenameTimeFormat);
        $this->setReturnValue($response);

    }
}