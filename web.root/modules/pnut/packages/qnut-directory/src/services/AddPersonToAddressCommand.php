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

class AddPersonToAddressCommand extends TServiceCommand
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
        if (empty($request)) {
            $this->addErrorMessage('service-no-request');
            return;
        }
        $personEntityName = TLanguage::text('dir-person-entity');
        if (empty($request->personId)) {
            $this->addErrorMessage('service-no-request-value',$personEntityName.' id');
            return;
        }
        $addressEntityName = TLanguage::text('dir-address-entity');
        if (empty($request->addressId)) {
            $this->addErrorMessage('service-no-request-value',$addressEntityName.' id');
            return;
        }
        $this->manager->assignPersonAddress($request->personId,$request->addressId);

        $person = $this->manager->getPersonById($request->personId,
            [   Person::affiliationsProperty,
                Person::emailSubscriptionsProperty]);

        if (empty($person)) {
            $this->addErrorMessage('err-no-person',$request->personId);
            return;
        }
        $this->addInfoMessage('add-person-address-success',[$person->fullname]);
        $this->setReturnValue($person);
    }
}