<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 10/18/2017
 * Time: 9:11 AM
 */
namespace Peanut\QnutDirectory\db\model\entity;


use Tops\db\TimeStampedEntity;
use Tops\sys\TDates;

class Person  extends TimeStampedEntity
{
    const affiliationsProperty = 'affiliations';
    const emailSubscriptionsProperty = 'emailsubscriptions';
    const addressProperty = 'address';

    public $id;
    public $fullname;
    public $addressId;
    public $email;
    public $username;
    public $phone;
    public $phone2;
    public $dateofbirth;
    public $junior;
    public $deceased;
    public $listingtypeId;
    public $sortkey;
    public $notes;
    public $active;

    /**
     * @var $address Address
     */
    public $address = null;
    public $affiliations = [];
    public $emailSubscriptions = [];

    public function assignFromObject($dto)
    {
        if (isset($dto->id)) {
            $this->id = $dto->id;
        }
        if (isset($dto->fullname)) {
            $this->fullname = $dto->fullname;
        }
        if (isset($dto->addressId)) {
            $this->addressId = $dto->addressId;
        }

        if (isset($dto->email)) {
            $this->email = $dto->email;
        }
        if (isset($dto->username)) {
            $this->username = $dto->username;
        }
        if (isset($dto->phone)) {
            $this->phone = $dto->phone;
        }
        if (isset($dto->phone2)) {
            $this->phone2 = $dto->phone2;
        }
        if (isset($dto->dateofbirth)) {
            $this->dateofbirth = TDates::formatMySqlDate($dto->dateofbirth);
        }
/*        if (isset($dto->junior)) {
            $this->junior = $dto->junior;
        }*/
        if (isset($dto->deceased)) {
            $this->deceased = TDates::formatMySqlDate($dto->deceased);
        }
        if (isset($dto->listingtypeId)) {
            $this->listingtypeId = $dto->listingtypeId;
        }
        if (isset($dto->sortkey)) {
            $this->sortkey = $dto->sortkey;
        }
        if (isset($dto->notes)) {
            $this->notes = $dto->notes;
        }
        if (isset($dto->active)) {
            $this->active = $dto->active;
        }
        if (isset($dto->affiliations)) {
            $this->affiliations = $dto->affiliations;
        }
        if (isset($dto->emailSubscriptions)) {
            $this->emailSubscriptions = $dto->emailSubscriptions;
        }
    }

    public function setAddress($address)
    {
        $this->address = $address;
    }

    public function getAddress() {
        return $this->address;
    }

    public function getAffiliations() {
        return isset($this->affiliations) ? $this->affiliations : array();
    }

    public function setAffilliations(array $value) {
        $this->affiliations = $value;
    }

    public function getEmailSubscriptions() {
        return isset($this->emailSubscriptions) ? $this->emailSubscriptions : array();
    }

    public function setEmailSubscriptions(array $value) {
        $this->emailSubscriptions = $value;
    }

}