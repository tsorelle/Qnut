<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 11/16/2017
 * Time: 8:57 AM
 */

namespace Peanut\QnutDirectory\services;


use Peanut\QnutDirectory\db\DirectoryManager;
use Peanut\QnutDirectory\db\model\entity\Address;
use Peanut\QnutDirectory\db\model\entity\Person;
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
        $service = new GetFamilyService($this->getMessages());
        if ($request->Name == 'Persons') {
            $service->GetPerson($request->Value);
        }
        else if ($request->Name == 'Addresses') {
            $service->GetAddress($request->Value);
        }
        else {
            $this->addErrorMessage('Invalid request name');
            return;
        }

        $response = $service->getResponse();
        $this->setReturnValue($response);
    }
}