<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 11/30/2017
 * Time: 6:24 PM
 */

namespace Peanut\QnutDirectory\services;


use Peanut\QnutDirectory\db\DirectoryManager;
use Tops\services\TServiceCommand;
use Tops\sys\TPermissionsManager;

/**
 * Class DeletePersonCommand
 * @package Peanut\QnutDirectory\services
 *
 * Service contract:
 *      Request: personId int
 *      Response: none
 */
class DeletePersonCommand extends TServiceCommand
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
        $person = $this->manager->getPersonById($id);
        if (empty($person)) {
            $this->addWarningMessage('service-warning-no-deletion',[$id]);
            return;
        }
        $this->manager->removePerson($id);
        $this->addInfoMessage('service-dropped',[$person->fullname]);
    }
}