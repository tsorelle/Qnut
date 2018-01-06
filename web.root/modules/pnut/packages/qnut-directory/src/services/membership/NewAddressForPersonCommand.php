<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 11/30/2017
 * Time: 6:19 PM
 */

namespace Peanut\QnutDirectory\services\membership;


use Peanut\QnutDirectory\db\DirectoryManager;
use Tops\services\TServiceCommand;
use Tops\sys\TPermissionsManager;

/**
 * Class NewAddressForPersonCommand
 * @package Peanut\QnutDirectory\services
 *
 * Service contract
 *  Request
 *     interface INewAddressForPersonRequest {
 *        personId: any;
 *        address: DirectoryAddress;
 *    }
 *  Response:
 *     interface IDirectoryFamily {
 *          address : DirectoryAddress;
 *          persons: DirectoryPerson[];
 *          selectedPersonId : any;
 *      }
 *
 */
class NewAddressForPersonCommand extends TServiceCommand
{
    /**
     * @var DirectoryManager
     */
    private $manager;

    public function __construct() {
        $this->addAuthorization(TPermissionsManager::updateDirectoryPermissionName);
        $this->manager = new DirectoryManager($this->getMessages(),$this->getUser()->getUserName());
    }


    protected function run()
    {
        $request = $this->getRequest();
        if (empty($request)) {
            $this->addErrorMessage('service-no-request');
            return;
        }

        $requestValidation = new DirectoryServiceRequests($this->getMessages());
        $personId = $requestValidation->getPersonIdRequest($request);
        if ($personId !== false) {
            $address = $requestValidation->getAddressRequest($request);
            if ($address !== false) {
                $person = $this->manager->getPerson($personId);
                if (!empty($person)) {
                    $addressId = $this->manager->createAddressFromDto($address);
                    if ($addressId !== false) {
                        $this->manager->assignPersonAddress($personId,$addressId);
                        $service = new GetFamilyService($this->getMessages(),$this->getUser()->getUserName());
                        $service->getPerson($personId);
                        $response = $service->getResponse();
                        $this->setReturnValue($response);
                    }
                }
            }
        }

    }
}