<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 1/16/2018
 * Time: 2:33 PM
 */

namespace Peanut\QnutDirectory\services\downloads;


use Peanut\QnutDirectory\db\model\repository\EmailListsRepository;
use Peanut\QnutDirectory\db\model\repository\PersonsRepository;
use Tops\services\TServiceCommand;
use Tops\sys\TCsvFormatter;
use Tops\sys\TDates;
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
        $listEntity = TLanguage::text('list-code');
        if (empty($request)) {
            $this->addErrorMessage('service-no-request');
            return;
        }
        if (empty($request->list)) {
            $this->addErrorMessage('service-no-request-value',[$listEntity]);
            return;
        }

        $repository = new PersonsRepository();
        $lists = $repository->getEmailSubscriptionsForDownload($request->list);
        $csv = TCsvFormatter::ToCsv($lists);
        $response = new \stdClass();
        $response->data = $csv;
        $response->filename = 'email-list-'.$request->list.'-'.TDates::now(TDates::FilenameTimeFormat);
        $this->setReturnValue($response);
    }
}