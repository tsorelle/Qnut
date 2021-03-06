<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 10/18/2017
 * Time: 9:11 AM
 */
namespace Peanut\QnutDirectory\db\model\entity;


use Tops\db\TEntity;
use Tops\sys\TDataTransfer;

class Person  extends TEntity
{
    const affiliationsProperty = 'affiliations';
    const emailSubscriptionsProperty = 'emailsubscriptions';
    const addressProperty = 'address';

    // public $id; // from TEntity
    // public $active; // from TEntity
    public $firstname;
    public $lastname;
    public $middlename;
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
    public $notes;
    public $uid;

    /**
     * @var $address Address
     */
    public $address = null;
    public $affiliations = [];
    public $emailSubscriptions = [];

    public function getDtoDataTypes()
    {
        $types = parent::getDtoDataTypes();
        $types['dateofbirth'] = TDataTransfer::dataTypeDate;
        $types['deceased'] = TDataTransfer::dataTypeDate;
        return $types;
    }

    public function concatenatedName() {
        $result = empty($this->firstname) ? '' : $this->firstname;
        if (!empty($this->middlename)) {
            $result .= ' '.$this->middlename;
        }
        if (!empty($this->lastname)) {
            $result .= ' '.$this->middlename;
        }
        return $result;
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
    
    public function assignFromObject($dto, $username = 'admin')
    {
        $result = parent::assignFromObject($dto, $username); 
        if (empty($this->fullname)) {
            $this->fullname = $this->concatenatedName();
        }
    }
}