<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 11/30/2017
 * Time: 6:21 PM
 */

namespace Peanut\QnutDirectory\services;


use Peanut\QnutDirectory\db\DirectoryManager;
use Peanut\QnutDirectory\db\model\entity\Person;
use Tops\services\TServiceCommand;
use Tops\sys\TLanguage;
use Tops\sys\TPermissionsManager;

/**
 * Class AddPersonToAddressCommand
 * @package Peanut\QnutDirectory\services
 *
 * Service contract
 *	Request:
 *		    interface IAddressPersonServiceRequest {
 *		        personId: any;
 *		        addressId: any;
 *		    }
 *
 *	 Response: DirectoryPerson, see GetFamilyService.php
 */
class AddPersonToAddressCommand extends TServiceCommand
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
            $addressId = $requestValidation->getAddressIdRequest($request);
            if ($addressId !== false) {
                $this->manager->assignPersonAddress($personId,$addressId);
                $person = $this->manager->getPerson($personId);
                if (!empty($person)) {
                    $this->addInfoMessage('add-person-address-success',[$person->fullname]);
                    $this->setReturnValue($person);
                }
            }
        }
    }
}