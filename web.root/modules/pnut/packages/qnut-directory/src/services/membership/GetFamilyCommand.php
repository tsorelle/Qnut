<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 11/16/2017
 * Time: 8:57 AM
 */

namespace Peanut\QnutDirectory\services\membership;

use Tops\services\TServiceCommand;


/**
 * Class GetFamilyCommand
 * @package Peanut\QnutDirectory\services
 *
 * Service contract
 *   Request:
 *       export interface INameValuePair {
 *               Name: string;
 *               Value: any;
 *           }
 *        Where Name is 'Address' or 'Person' and Value is corresponding entity id (personId or addressId)
 *
 *   Response:
 *           interface IDirectoryFamily {
 *               address : DirectoryAddress;
 *               persons: DirectoryPerson[];
 *               selectedPersonId : any;
 *           }
 *          See GetFamilyService for details
 *
 */
class GetFamilyCommand extends TServiceCommand
{
    public function __construct()
    {
        $this->addAuthorization("view directory");
    }

    protected function run()
    {
        $request = $this->getRequest();
        if (empty($request)) {
            $this->addErrorMessage('service-no-request');
            return;
        }
        $requestValidation = new DirectoryServiceRequests($this->getMessages());
        $searchType = $requestValidation->getNameRequest($request,'service-type-search');
        if ($searchType !== false) {
            $value = $requestValidation->getValueRequest($request,'service-type-search');
            if ($value !== false) {
                $service = new GetFamilyService($this->getMessages());
                if ($searchType == 'Persons') {
                    $service->GetPerson($value);
                }
                else if ($searchType == 'Addresses') {
                    $service->GetAddress($value);
                }
                else {
                    $this->addErrorMessage('Invalid search type');
                    return;
                }
                $response = $service->getResponse();
                $this->setReturnValue($response);
            }
        }
    }
}