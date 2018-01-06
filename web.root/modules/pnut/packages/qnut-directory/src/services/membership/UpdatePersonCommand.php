<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 11/22/2017
 * Time: 8:39 AM
 */

namespace Peanut\QnutDirectory\services\membership;


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
 *      Response: DirectoryPerson (updated)
 */
class UpdatePersonCommand extends TServiceCommand
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
            $id = $this->manager->createPersonFromDto($request);
        }
        else {
            $id = $this->manager->updatePersonFromDto($request);
        }

        if (!empty($id)) {
            $person = $this->manager->getPerson($id);
            if ($person !== false) {
                $this->setReturnValue($person);
            }
        }
    }
}