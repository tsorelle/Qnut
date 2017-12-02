<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 11/30/2017
 * Time: 5:31 PM
 */

namespace Peanut\QnutDirectory\services;


use Peanut\QnutDirectory\db\DirectoryManager;
use Peanut\QnutDirectory\db\model\entity\Address;
use Tops\services\TEditState;
use Tops\services\TServiceCommand;
use Tops\sys\TLanguage;
use Tops\sys\TPermissionsManager;

/**
 * Class UpdateAddressCommand
 * @package Peanut\QnutDirectory\services
 *
 * Service contract:
 *     Request:  DirectoryAddress, See GetFamilyService.php
 *     Response: DirectoryAddress (updated)
 */
class UpdateAddressCommand extends TServiceCommand
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
        $editState = isset($request->editState) ? $request->editState : TEditState::Updated;
        if ($editState == TEditState::Created) {
            $id = $this->manager->createAddressFromDto($request);
        }
        else {
            $id = $this->manager->updateAddressFromDto($request);
        }

        if (!empty($id)) {
            $address = $this->manager->getAddress($id);
            if ($address !== false) {
                $this->setReturnValue($address);
            }
        }
    }
 }