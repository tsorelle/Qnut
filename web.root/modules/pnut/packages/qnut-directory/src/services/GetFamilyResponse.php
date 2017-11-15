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

class GetFamilyResponse
{
    public static function BuildResponseForAddress(Address $address,$selectedPersonId = 0)
    {
        $result = new \stdClass();
        $result->persons = array();
        $result->address = $address;
        $persons = $address->getPersons();
        if (!empty($persons)) {
            foreach($persons as $addrPerson) {
                if ($addrPerson->active) {
                    array_push($result->persons, $addrPerson);
                }
            }
        }
        $result->selectedPersonId = $selectedPersonId;
        return $result;
    }


    public static function BuildResponseForPerson(Person $person)
    {

        if ($person != null) {
            $address = $person->getAddress();
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