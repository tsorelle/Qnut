<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 11/12/2017
 * Time: 6:34 AM
 */

namespace Peanut\QnutDirectory\db;


use Peanut\QnutDirectory\db\model\repository\AddressesRepository;
use Peanut\QnutDirectory\db\model\repository\PersonsRepository;
use Tops\db\model\repository\LookupTableRepository;

class DirectoryManager
{
    const includeRelated = true;
    const parentClassOnly = false;
    
    private $personsRepository;
    private function getPersonsRepository() {
        if (!isset($this->personsRepository)) {
            $this->personsRepository = new PersonsRepository();
        }
        return $this->personsRepository;
    }

    private $addressesRepository;
    private function getAddressesRepository() {
        if (!isset($this->addressesRepository)) {
            $this->addressesRepository = new AddressesRepository();
        }
        return $this->addressesRepository;
    }


    public function getPersonById($personId,$includeAddress = self::parentClassOnly)
    {
        //todo:implement getPersonById
        return null;
    }

    public function getAddressById($addressId,$includePersons=self::parentClassOnly,$excludePersonId=0)
    {
        //todo:implement getAddressById
        return null;
    }

    public function getDirectoryListingTypeList($translate = true)
    {
        $repository = new LookupTableRepository('qnut_listingtypes');
        return $repository->getLookupList($translate);
    }

    public function getAddressTypeList($translate = true)
    {
        $repository = new LookupTableRepository('qnut_addresstypes');
        return $repository->getLookupList($translate);
    }

    public function getOrganizationsList($translate = true)
    {
        $repository = new LookupTableRepository('qnut_organizations');
        return $repository->getLookupList($translate);
    }

    public function getAffiliationRolesList($translate = true)
    {
        $repository = new LookupTableRepository('qnut_affiliation_roles');
        return $repository->getLookupList($translate);
    }

    public function getEmailListLookup($translate = true)
    {
        $repository = new LookupTableRepository('qnut_email_lists');
        return $repository->getLookupList($translate);
    }

    public function getPostalListLookup($translate = true)
    {
        $repository = new LookupTableRepository('qnut_postal_lists');
        return $repository->getLookupList($translate);
    }

    public function getPersonList($Value)
    {
        return $this->getPersonsRepository()->search($Value);
    }

    public function getAddressList($Value)
    {
        return [];
    }
}