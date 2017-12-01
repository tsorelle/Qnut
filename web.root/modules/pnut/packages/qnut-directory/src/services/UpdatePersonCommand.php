<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 11/22/2017
 * Time: 8:39 AM
 */

namespace Peanut\QnutDirectory\services;


use Peanut\QnutDirectory\db\DirectoryManager;
use Peanut\QnutDirectory\db\model\entity\Person;
use Tops\services\TEditState;
use Tops\services\TServiceCommand;
use Tops\sys\TLanguage;
use Tops\sys\TPermissionsManager;

/**
 * Class UpdatePersonCommand
 * @package Peanut\QnutDirectory\services
 *
 * Service contract:
 *      Request:  DirectoryPerson, See GetFamilyService.php
 *
 *
 */
class UpdatePersonCommand extends TServiceCommand
{
    /**
     * @var DirectoryManager
     */
    private $manager;

    public function __construct() {
        $this->addAuthorization(TPermissionsManager::updateDirectoryPermissionName);
        $this->manager = new DirectoryManager($this->getUser()->getUserName());
    }

    private function validatePerson(Person $person)
    {
        $valid = true;
        if (empty($person->fullname)) {
            $this->addErrorMessage('valid-person-name');
            $valid = false;
        }
        return $valid;
    }

    private function getPerson($id) {
        $person = $this->manager->getPersonById($id,
            [   Person::affiliationsProperty,
                Person::emailSubscriptionsProperty]);
        if (empty($person)) {
            $this->addErrorMessage('err-no-person', [$id]);
            return false;
        }
        return $person;
    }

    protected function run()
    {
        $request = $this->getRequest();
        $id = $request->id;
        $person = null;
        if ($request->editState == TEditState::Created) {
            $person = new Person();
        }
        else {
            $person = $this->getPerson($id);
            if ($person === false) {
                return;
            }
        }

        $person->assignFromObject($request);
        if (!$this->validatePerson($person)) {
            return;
        }

        $entityName = TLanguage::text('dir-person-entity','person');

        if ($request->editState == TEditState::Created) {
            $id = $this->manager->addPerson($person);
            if (empty($id)) {
                $this->addErrorMessage('error-insert-failed',[$entityName]);
                return;
            }
        }
        else {
            $updateResult = $this->manager->updatePerson($person);
            if (empty($updateResult)) {
                $this->addErrorMessage('error-update-failed', [$entityName]);
                return;
            }
        }

        $person = $this->getPerson($id);
        if ($person === false) {
            return;
        }
        $this->setReturnValue($person);
    }
}