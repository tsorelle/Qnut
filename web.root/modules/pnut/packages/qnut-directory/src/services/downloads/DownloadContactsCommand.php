<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 1/16/2018
 * Time: 2:31 PM
 */

namespace Peanut\QnutDirectory\services\downloads;


use Peanut\QnutDirectory\db\model\repository\PersonsRepository;
use Tops\services\TServiceCommand;
use Tops\sys\TCsvFormatter;
use Tops\sys\TDates;
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

        $respository = new PersonsRepository();
        $contacts = $respository->getContactsForDownload($includekids,$directoryonly,$affiliation);
        $csv = TCsvFormatter::ToCsv($contacts);
        $response = new \stdClass();
        $response->data = $csv;

        $response->filename = 'contacts-';
        if ($directoryonly) {
            $response->filename .= 'directory-';
        }
        if ($affiliation) {
            $response->filename .= $affiliation.'-';
        }
        $response->filename .= TDates::now(TDates::FilenameTimeFormat);

        $this->setReturnValue($response);

    }
}