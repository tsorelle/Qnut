<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 11/16/2017
 * Time: 8:57 AM
 */

namespace Peanut\QnutDirectory\services;


use Peanut\QnutDirectory\db\DirectoryManager;
use Peanut\QnutDirectory\db\model\entity\Address;
use Peanut\QnutDirectory\db\model\entity\Person;
use Tops\services\TServiceCommand;


/**
 * Class GetFamilyCommand
 * @package Peanut\QnutDirectory\services
 *
 * Service contract
 *   Request: INameValue
 *   Response:
 *     interface IDirectoryFamily {
 *         address : DirectoryAddress;
 *         persons: DirectoryPerson[];
 *         selectedPersonId : any;
 *     }
 */
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
        $manager = new DirectoryManager();
        $response = new \stdClass();
        if ($request->Name == 'Persons') {
            $person = $manager->getPersonById($request->Value,
                [   Person::affiliationsProperty,
                    Person::emailSubscriptionsProperty]);
            if (empty($person)) {
                $this->addErrorMessage('Person not found for id ' . $request->Value);
                return;
            }
            $address = $manager->getAddressById($person->addressId, [Address::postalSubscriptionsProperty]);
            $response->address = $address;
            if (empty($address)) {
                $response->persons = [$person];
            }
            else {
                $response->persons =
                    $manager->getAddressResidents($address->id,
                        [   Person::emailSubscriptionsProperty,
                            Person::affiliationsProperty]);
            }
            $response->selectedPersonId = $person->id;
        }
        else if ($request->Name == 'Addresses') {
            $address = $manager->getAddressById($request->Value, [Address::postalSubscriptionsProperty]);
            if (empty($address)) {
                $this->addErrorMessage('Address not found for id  ' . $request->Value);
            }
            $response->address = $address;
            $response->persons =
                $manager->getAddressResidents($address->id,
                    [   Person::emailSubscriptionsProperty,
                        Person::affiliationsProperty]);
            $response->selectedPersonId = empty($response->persons) ? null : $response->persons[0]->id;
        }
        else {
            $this->addErrorMessage('Invalid request name');
            return;
        }

        $this->setReturnValue($response);
    }
}