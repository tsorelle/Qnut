<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 11/15/2017
 * Time: 5:06 AM
 */

namespace Peanut\QnutDirectory\services\membership;


use Peanut\QnutDirectory\db\DirectoryManager;
use Tops\services\TServiceCommand;
use Tops\sys\TPermissionsManager;

/**
 * Class DirectorySearchCommand
 * @package Peanut\QnutDirectory\services
 *
 * Service Contract:
 *  Request:
 *	    interface ISearchRequest {
 *		    Name: any;	"Persons"|"Addresses"
 *		    Value: any; search value entered by user
 *          Exclude: any;  addressId to exclude from search (optional)
 *      }
 *  Response:
 *	    Array of
 *		    interface INameValuePair {
 *			    Name: string;
 *			    Value: any;
 *		    }
 */
class DirectorySearchCommand extends TServiceCommand
{
    public function __construct() {
        $this->addAuthorization(TPermissionsManager::viewDirectoryPermissionName);
    }

    protected function run()
    {
        $searchRequest = $this->getRequest();
        if (empty($searchRequest)) {
            $this->addErrorMessage('service-no-request');
            return;
        }

        $requestValidation = new DirectoryServiceRequests($this->getMessages());
        $searchType = $requestValidation->getNameRequest($searchRequest,'service-type-search');
        if ($searchType !== false) {
            $value = $requestValidation->getValueRequest($searchRequest,'service-type-search');
            if ($value !== false) {
                $manager = new DirectoryManager($this->getMessages(),$this->getUser()->getUserName());
                if ($searchType == 'Persons') {
                    $result = $manager->getPersonList($value,
                        isset($searchRequest->Exclude) ? $searchRequest->Exclude : 0);
                }
                else if ($searchType == 'Addresses') {
                    $result = $manager->getAddressList($value);
                }
                else {
                    $this->addErrorMessage("Invalid search type '$searchType'");
                    return;
                }
                $this->setReturnValue($result);
                if (empty($result)) {
                    $this->addErrorMessage('No '.strtolower($searchRequest->Name).' found.');
                }
            }
        }
    }
}