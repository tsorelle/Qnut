<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 11/12/2017
 * Time: 6:34 AM
 */

namespace Peanut\QnutDirectory\db;


use Peanut\QnutDirectory\db\model\entity\Address;
use Peanut\QnutDirectory\db\model\entity\Person;
use Peanut\QnutDirectory\db\model\repository\AddressesRepository;
use Peanut\QnutDirectory\db\model\repository\OrganizationsRepository;
use Peanut\QnutDirectory\db\model\repository\PersonsRepository;
use Tops\db\model\repository\LookupTableRepository;
use Tops\db\TVariables;
use Tops\sys\IUser;

class DirectoryManager
{
    const includeRelated = true;
    const parentClassOnly = false;
    const listDefaultFirst = true;

    const personsCollection = 'persons';
    const addressProperty = 'address';
    const affiliationCollection = 'affiliations';


    public function __construct($username = 'system')
    {
        $this->username = $username;
    }

    /**
     * @var string
     */
    private $username = 'system';
    private $personsRepository;
    private function getPersonsRepository() {
        if (!isset($this->personsRepository)) {
            $this->personsRepository = new PersonsRepository();
        }
        return $this->personsRepository;
    }

    private $addresssRepository;
    private function getAddressesRepository() {
        if (!isset($this->addressesRepository)) {
            $this->addresssRepository = new AddressesRepository();
        }
        return $this->addresssRepository;
    }



    private $organizationsRepository;

    public function updatePerson($person)
    {
        return $this->getPersonsRepository()->update($person,$this->username);
    }

    public function addPerson($person)
    {
        return $this->getPersonsRepository()->insert($person,$this->username);
    }

    public function updateAddress($address)
    {
        return $this->getAddressesRepository()->update($address,$this->username);
    }


    public function addAddress($address)
    {
        return $this->getAddressesRepository()->insert($address,$this->username);
    }


    private function getOrganizationsRepository() {
        if (!isset($this->organizationsRepository)) {
            $this->organizationsRepository = new OrganizationsRepository();
        }
        return $this->organizationsRepository;
    }


    public function assignPersonAddress($personId,$addressId) {
        $this->getPersonsRepository()->assignPersonAddress($personId,$addressId);
    }

    public function getPersonById($personId,array $includes = [], array $addressIncludes = [])
    {
        /**
         * @var $person Person
         */
        $person = $this->getPersonsRepository()->get($personId);
        if (empty($person)) {
            return false;
        }
        $this->includePersonProperties($person,$includes, $addressIncludes);
        return $person;
    }

    public function getAddressResidents($addressId,$includes=[]) {
        $residents = $this->getPersonsRepository()->getAddressResidents($addressId);
        if (!is_array($residents)) {
            return [];
        }
        foreach ($residents as $resident) {
            $this->includePersonProperties($resident,$includes);
        }
        return $residents;
    }

    /**
     * @param Person $person
     * @param array $includes
     * @param array $addressIncludes
     */
    public function includePersonProperties(Person &$person, array $includes=[], array $addressIncludes=[])
    {
        foreach ($includes as $include) {
            switch ($include) {
                case Person::addressProperty :
                    /**
                     * @var $address Address
                     */
                    $address = $this->getAddressById($person->addressId, $addressIncludes);
                    if (!empty($address)) {
                        $person->setAddress($address);
                    }
                    break;
                case Person::affiliationsProperty :
                    $this->getPersonsRepository()->setAffiliations($person);
                    break;
                case Person::emailSubscriptionsProperty :
                    $this->getPersonsRepository()->setSubscriptions($person);
                    break;
            }
        }
    }


    public function getAddressById($addressId,array $includes=[],array $residentIncludes=[])
    {
        /**
         * @var $address Address
         */
        $address = $this->getAddressesRepository()->get($addressId);
        if (empty($address)) {
            return false;
        }
        $this->includeAddressProperties($address, $includes,$residentIncludes);

        return $address;
    }

    /**
     * @param $address Address
     * @param array $includes
     */
    private function includeAddressProperties(Address &$address, array $includes=[],array $residentIncludes=[])
    {
        foreach ($includes as $include) {
            switch ($include) {
                case Address::residentsProperty :
                    $residents = $this->getPersonsRepository()->getAddressResidents($address->id);
                    foreach ($residents as $resident) {
                        $this->includePersonProperties($resident, $residentIncludes);
                    }
                    $address->setResidents($residents);
                    break;
                case Address::postalSubscriptionsProperty :
                    $this->getAddressesRepository()->setPostalSubscriptions($address);
                    break;
            }
        }
    }


    public function getDirectoryListingTypeList()
    {
        $repository = new LookupTableRepository('qnut_listingtypes');
        return $repository->getLookupList();
    }

    public function getAddressTypeList()
    {
        $repository = new LookupTableRepository('qnut_addresstypes');
        return $repository->getLookupList();
    }

    public function getOrganizationsList($defaultFirst = false)
    {
        // clear cache for testing only. Comment out for production.
        // TVariables::Clear();

        $siteOrg = $defaultFirst ? TVariables::Get('site-org') : null;
        $repository = new LookupTableRepository('qnut_organizations');
        $result = $repository->getLookupList(
            LookupTableRepository::noTranslation,
            LookupTableRepository::sortByName,
            empty($siteOrg) ? '' : "code <> '$siteOrg'");

        if (!empty($siteOrg)) {
            $org = $repository->getLookupList(
                LookupTableRepository::noTranslation,
                LookupTableRepository::noSort,
                "code = '$siteOrg'");
            if (!empty($org)) {
                array_unshift($result, $org[0]);
            }

        }
        return $result;
    }

    public function getAffiliationRolesList()
    {
        $repository = new LookupTableRepository('qnut_affiliation_roles');
        return $repository->getLookupList();
    }

    public function getEmailListLookup($translate = false)
    {
        $repository = new LookupTableRepository('qnut_email_lists');
        return $repository->getLookupList($translate);
    }

    public function getPostalListLookup($translate = false)
    {
        $repository = new LookupTableRepository('qnut_postal_lists');
        return $repository->getLookupList($translate);
    }

    public function getPersonList($Value,$excludeAddress=0)
    {
        return $this->getPersonsRepository()->search($Value,$excludeAddress);
    }


    public function getAddressList($Value)
    {
        return $this->getAddressesRepository()->search($Value);
    }

    public function removePerson($personId) {
        $this->getPersonsRepository()->remove($personId);
    }

    public function removeAddress($addressId) {
        $this->getPersonsRepository()->unlinkAddress($addressId);
        $this->getAddressesRepository()->remove($addressId);
    }


}