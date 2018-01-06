<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 11/30/2017
 * Time: 6:26 PM
 */

namespace Peanut\QnutDirectory\services\membership;


use Peanut\QnutDirectory\db\DirectoryManager;
use Tops\services\TServiceCommand;
use Tops\sys\TPermissionsManager;

/**
 * Class NewPersonForAddressCommand
 * @package Peanut\QnutDirectory\services
 *
 * Service contract
 *  Request:
 *      interface INewPersonForAddressRequest {
 *          person: DirectoryPerson;
 *          addressId: any;
 *      }
 *
 *  Response:  DirectoryPerson
 */
class NewPersonForAddressCommand extends TServiceCommand
{
    /**
     * @var DirectoryManager
     */
    private $manager;

    public function __construct()
    {
        $this->addAuthorization(TPermissionsManager::updateDirectoryPermissionName);
        $this->manager = new DirectoryManager($this->getMessages(), $this->getUser()->getUserName());
    }

    protected function run()
    {
        $request = $this->getRequest();
        if (empty($request)) {
            $this->addErrorMessage('service-no-request');
            return;
        }
        $requestValidation = new DirectoryServiceRequests($this->getMessages());
        $addressId = $requestValidation->getAddressIdRequest($request);
        if ($addressId !== false) {
            $person = $requestValidation->getPersonRequest($request);
            if (!empty($person)) {
                $address = $this->manager->getAddress($addressId);
                if ($address === false) {
                    return;
                }
                $personId = $this->manager->createPersonFromDto($person);
                if (!empty($personId)) {
                    $this->manager->assignPersonAddress($personId, $addressId);
                    $newPerson = $this->manager->getPerson($personId);
                    if ($newPerson !== false) {
                        $this->setReturnValue($newPerson);
                    }
                }
            }
        }
    }
}