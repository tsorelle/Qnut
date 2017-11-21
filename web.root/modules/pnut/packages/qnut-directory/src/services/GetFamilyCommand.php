<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 11/16/2017
 * Time: 8:57 AM
 */

namespace Peanut\QnutDirectory\services;


use Peanut\QnutDirectory\db\DirectoryManager;
use Tops\services\TServiceCommand;

class GetFamilyCommand extends TServiceCommand
{
    public function __construct()
    {
        $this->addAuthorization("view directory");
    }

    protected function run()
    {
        // todo: translate error messages
        $request = $this->getRequest();
        $response = null;
        $manager = new DirectoryManager();
        if ($request->Name == 'Persons') {
            $person = $manager->getPersonById($request->Value,array(DirectoryManager::affiliationCollection));
            if (empty($person)) {
                $this->addErrorMessage('Person not found for id ' . $request->Value);
                return;
            }
            $response = GetFamilyResponse::BuildResponseForPerson($person);
        } else if ($request->Name == 'Addresses') {
            $address = $manager->getAddressById($request->Value);
            if (empty($address)) {
                $this->addErrorMessage('Address not found for id  ' . $request->Value);
            }
            $response = GetFamilyResponse::BuildResponseForAddress($address);
        }

        $this->setReturnValue($response);
    }
}