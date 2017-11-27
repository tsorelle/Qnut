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
use Tops\services\TServiceCommand;
use Tops\sys\TPermissionsManager;

class UpdatePersonCommand extends TServiceCommand
{
    public function __construct() {
        $this->addAuthorization(TPermissionsManager::updateDirectoryPermissionName);
    }


    /**
     * @param $affiliation
     * @param array $list
     *
     * Data structure:
     *   export interface IAffiliation {
     * 		organizationId: any;
     * 		roleId: any;
     * 	 }
     */
    private function hasAffiliation($affiliation,array $list) {
        foreach ($list as $item) {
            if ($item->organizationId == $affiliation->organizationId && $item->roleId == $affiliation->roleId) {
                return true;
            }
        }
        return false;
    }

    protected function run()
    {
        $request = $this->getRequest();
        $manager = new DirectoryManager();
        $id = $request->personId;
        $person = null;
        $affiliationsToAdd = [];
        $affiliationsToDelete = [];
        if ($request->editState == 1) { // editState.created
            $person = new Person();
            $affiliationsToAdd = $request->affiliations;
        }
        else {
            $person = $manager->getPersonById($id);
            if (empty($person)) {
                $this->addErrorMessage('Person not found for id ' . $request->Value);
                return;
            }
        }

        $valid = $person->
        updateFromDataTransferObject($request);
        if (!$valid) {
            $this->addErrorMessage('Cannot update person entity due to invalid data.');
        }

        $manager->updateEntity($person);
        $result = $person->getDataTransferObject();
        $this->setReturnValue($result);


        $this->addErrorMessage('Not implemented yet');
    }
}