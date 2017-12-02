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
use Tops\services\IMessageContainer;
use Tops\services\NullMessageContainer;
use Tops\sys\TL;
use Tops\sys\TLanguage;

class DirectoryManager
{
    const includeRelated = true;
    const includeAddress = true;
    const parentClassOnly = false;

    const listDefaultFirst = true;
    const personsCollection = 'persons';
    const addressProperty = 'address';

    const affiliationCollection = 'affiliations';

    /**
     * @var IMessageContainer $messages
     */
    private $messages;


    public function __construct(IMessageContainer $messages = null, $username = 'system')
    {
        $this->messages = $messages === null ? new NullMessageContainer() : $messages;
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
        $updateResult = $this->getPersonsRepository()->update($person,$this->username);
        if ($updateResult === false) {
            $entityName = TLanguage::text('dir-person-entity','person');
            $this->messages->addErrorMessage('error-update-failed', [$entityName]);
        }
        return $updateResult;
    }

    public function addPerson($person)
    {
        $id =  $this->getPersonsRepository()->insert($person,$this->username);
        if (empty($id)) {
            $entityName = TLanguage::text('dir-person-entity','person');
            $this->messages->addErrorMessage('error-insert-failed',[$entityName]);
        }
        return $id;
    }

    public function updateAddress($address)
    {
        $updateResult = $this->getAddressesRepository()->update($address,$this->username);
        if (empty($updateResult)) {
            $entityName = TLanguage::text('dir-address-entity','address');
            $this->messages->addErrorMessage('error-update-failed', [$entityName]);
        }
        return $updateResult;

    }


    public function addAddress($address)
    {
        $id = $this->getAddressesRepository()->insert($address,$this->username);
        if (empty($id)) {
            $entityName = TLanguage::text('dir-address-entity','address');
            $this->messages->addErrorMessage('error-insert-failed',[$entityName]);
        }
        return $id;

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

    public function getAddress($addressId,$includeSubscriptions=true, $includeResidents = false) {
        $includes = ($includeSubscriptions) ? [Address::postalSubscriptionsProperty] : [];
        if ($includeResidents) {
            $includes[] = Address::residentsProperty;
        }
        $address = $this->getAddressById($addressId, $includes);
        if (empty($address)) {
            $this->messages->addErrorMessage('err-no-address', [$addressId]);
            return false;
        }
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

    public function validatePerson($person)
    {
        $valid = true;
        if (empty($person->fullname)) {
            $this->messages->addErrorMessage('valid-person-name');
            $valid = false;
        }
        return $valid;
    }

    public function validateAddress($address) {
        $valid = true;
        if (empty($address->addressname)) {
            $this->messages->addErrorMessage('valid-address-name');
            $valid = false;
        }
        return $valid;
    }

    public function getPerson($id, $includeAddress = false, array $addressIncludes = []) {
        $includes = [Person::affiliationsProperty, Person::emailSubscriptionsProperty];
        if ($includeAddress) {
            $includes[] = Person::addressProperty;
        }
        $person = $this->getPersonById($id, $includes,$addressIncludes);
        if (empty($person)) {
            $this->messages->addErrorMessage('err-no-person', [$id]);
            return false;
        }
        return $person;
    }

    public function updatePersonFromDto($request) {
        if (empty($request->id)) {
            $this->messages->AddErrorMessage('error-no-id');
            return false;
        }
        $id = $request->id;
        $person = $this->getPerson($id);
        if ($person === false) {
            return false;
        }
        $person->assignFromObject($request);
        if (!$this->validatePerson($person)) {
            return false;
        }
        $updateResult = $this->updatePerson($person);
        return $updateResult !== false ? $id : false;
    }

    public function updateAddressFromDto($request) {
        if (empty($request->id)) {
            $this->messages->AddErrorMessage('error-no-id');
            return false;
        }
        $id = $request->id;
        $address = $this->getAddress($id);
        if ($address === false) {
            return false;
        }
        $address->assignFromObject($request);
        if (!$this->validateaddress($address)) {
            return false;
        }
        $updateResult = $this->updateAddress($address);
        return $updateResult !== false ? $id : false;

    }

    public function createPersonFromDto($request) {
        $person = new Person();
        $person->assignFromObject($request);
        if (!$this->validatePerson($person)) {
            return false;
        }
        $id = $this->addPerson($person);
        return empty($id) ? false: $id;
    }

    public function createAddressFromDto($request) {
        $address = new address();
        $address->assignFromObject($request);
        if (!$this->validateAddress($address)) {
            return false;
        }
        $id = $this->addAddress($address);
        return empty($id) ? false: $id;
    }


}