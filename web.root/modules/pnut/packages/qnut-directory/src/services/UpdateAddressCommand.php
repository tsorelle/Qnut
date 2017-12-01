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
 */
class UpdateAddressCommand extends TServiceCommand
{
    /**
     * @var DirectoryManager
     */
    private $manager;

    public function __construct() {
        $this->addAuthorization(TPermissionsManager::updateDirectoryPermissionName);
        $this->manager = new DirectoryManager($this->getUser()->getUserName());
    }

    protected function run()
    {
        $request = $this->getRequest();
        $id = $request->id;
        if ($request->editState == TEditState::Created) {
            $address = new Address();
        }
        else {
            $address = $this->getAddress($id);
            if ($address === false) {
                return;
            }
        }

        $address->assignFromObject($request);
        if (!$this->validateAddress($address)) {
            return;
        }

        $entityName = TLanguage::text('dir-address-entity','address');

        if ($request->editState == TEditState::Created) {
            $id = $this->manager->addAddress($address);
            if (empty($id)) {
                $this->addErrorMessage('error-insert-failed',[$entityName]);
                return;
            }
        }
        else {
            $updateResult = $this->manager->updateAddress($address);
            if (empty($updateResult)) {
                $this->addErrorMessage('error-update-failed', [$entityName]);
                return;
            }
        }

        $address = $this->getAddress($id);
        if ($address === false) {
            return;
        }
        $this->setReturnValue($address);

    }

    private function getAddress($addressId)
    {
        $address = $this->manager->getAddressById($addressId, [Address::postalSubscriptionsProperty]);
        if (empty($address)) {
            $this->addErrorMessage('err-no-address', [$addressId]);
            return false;
        }
        return $address;
    }

    private function validateAddress(Address $address)
    {
        $valid = true;
        if (empty($address->addressname)) {
            $this->addErrorMessage('valid-address-name');
            $valid = false;
        }
        return $valid;
    }
}