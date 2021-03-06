<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 11/30/2017
 * Time: 6:22 PM
 */

namespace Peanut\QnutDirectory\services\membership;


use Peanut\QnutDirectory\db\DirectoryManager;
use Tops\services\TServiceCommand;
use Tops\sys\TPermissionsManager;

/**
 * Class ChangePersonAddressCommand
 * @package Peanut\QnutDirectory\services
 *
 *  Service contract
 *	Request:
 *		    interface IAddressPersonServiceRequest {
 *		        personId: any;
 *		        addressId: any;
 *		    }
 *
 *	 Response: IDirectoryFamily, see GetFamilyService.php
 */
class ChangePersonAddressCommand extends TServiceCommand
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
            $addressId = empty($request->addressId) ? null : $request->addressId;
            $this->manager->assignPersonAddress($personId, $addressId);
            $service = new GetFamilyService($this->getMessages(), $this->getUser()->getUserName());
            $service->getPerson($personId);
            $response = $service->getResponse();
            $this->setReturnValue($response);
        }

    }
}