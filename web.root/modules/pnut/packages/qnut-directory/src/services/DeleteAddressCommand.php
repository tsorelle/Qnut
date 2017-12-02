<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 11/30/2017
 * Time: 6:23 PM
 */

namespace Peanut\QnutDirectory\services;


use Peanut\QnutDirectory\db\DirectoryManager;
use Tops\services\TServiceCommand;
use Tops\sys\TPermissionsManager;

/**
 * Class DeleteAddressCommand
 * @package Peanut\QnutDirectory\services
 *
 * Service contract
 *      Request: addressId int
 *      Response:  none
 */
class DeleteAddressCommand extends TServiceCommand
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
        $id = $this->getRequest();
        if (empty($id)) {
            $this->addErrorMessage('error-no-id');
            return;
        }
        $address = $this->manager->getAddressById($id);
        if (empty($address)) {
            $this->addWarningMessage('service-warning-no-deletion',[$id]);
            return;
        }
        $this->manager->removeAddress($id);
        $this->addInfoMessage('service-dropped',[$address->addressname]);
    }
}