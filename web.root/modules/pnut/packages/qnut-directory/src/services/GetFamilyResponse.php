<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 11/12/2017
 * Time: 6:38 AM
 */

namespace Peanut\QnutDirectory\services;


use Peanut\QnutDirectory\db\model\entity\Address;
use Peanut\QnutDirectory\db\model\entity\Person;
use Peanut\QnutDirectory\db\model\repository\AddressesRepository;
use Peanut\QnutDirectory\db\model\repository\PersonsRepository;

class GetFamilyResponse
{
    public static function BuildResponseForAddress(Address $address,$selectedPersonId = 0)
    {
        $repository = new PersonsRepository();
        $result = new \stdClass();
        $result->address = $address;
        $result->persons = $repository->getAddressResidents($address->id);
        foreach ($result->persons as $person) {
            $repository->setAffiliations($person);
        }
        $result->selectedPersonId = $selectedPersonId;
        return $result;
    }


    public static function BuildResponseForPerson(Person $person)
    {
        if ($person != null && !empty($person->addressId)) {
            $repository = new AddressesRepository();
            /**
             * @var $address Address
             */
            $address = $repository->get($person->addressId);
            if ($address != null) {
                return self::BuildResponseForAddress($address,$person->id);
            }
        }
        $result = new \stdClass();
        $result->persons = array();
        $result->address = null;
        $result->selectedPersonId = $person->id;
        array_push($result->persons, $person);
        return $result;
    }

}