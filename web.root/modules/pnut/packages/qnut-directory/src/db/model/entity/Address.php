<?php 
/** 
 * Created by /tools/create-model.php 
 * Time:  2017-11-15 13:11:28
 */ 

namespace Peanut\QnutDirectory\db\model\entity;

use Tops\sys\TNameValuePair;

class Address  extends \Tops\db\TimeStampedEntity
{
    const postalSubscriptionsProperty = 'postalsubscriptions';
    const residentsProperty = 'residents';

    public $id;
    public $addressname;
    public $address1;
    public $address2;
    public $city;
    public $state;
    public $postalcode;
    public $country;
    public $phone;
    public $notes;
    public $addresstypeId;
    public $sortkey;
    public $listingtypeId;
    public $latitude;
    public $longitude;
    public $active;

    /**
     * @var TNameValuePair[]
     */
    private $residents = [];
    public $postalSubscriptions = [];

    public function assignFromObject($dto)
    {
        if (isset($dto->id)) {
            $this->id = $dto->id;
        }
        if (isset($dto->addressname)) {
            $this->addressname = $dto->addressname;
        }
        if (isset($dto->address1)) {
            $this->address1 = $dto->address1;
        }
        if (isset($dto->address2)) {
            $this->address2 = $dto->address2;
        }
        if (isset($dto->city)) {
            $this->city = $dto->city;
        }
        if (isset($dto->state)) {
            $this->state = $dto->state;
        }
        if (isset($dto->postalcode)) {
            $this->postalcode = $dto->postalcode;
        }
        if (isset($dto->country)) {
            $this->country = $dto->country;
        }
        if (isset($dto->phone)) {
            $this->phone = $dto->phone;
        }
        if (isset($dto->notes)) {
            $this->notes = $dto->notes;
        }
        if (isset($dto->addresstypeId)) {
            $this->addresstypeId  = $dto->addresstypeId;
        }
        if (isset($dto->sortkey)) {
            $this->sortkey = $dto->sortkey;
        }
        if (isset($dto->listingtypeId)) {
            $this->listingtypeId = $dto->listingtypeId;
        }
        if (isset($dto->latitude)) {
            $this->latitude = $dto->latitude;
        }
        if (isset($dto->longitude)) {
            $this->longitude = $dto->longitude;
        }
        if (isset($dto->active)) {
            $this->active = $dto->active;
        }

        if (isset($dto->postalSubscriptions)) {
            $this->postalSubscriptions = $dto->postalSubscriptions;
        }

    }

    public function getResidents() {
        return isset($this->residents) ? $this->residents : [];
    }

    public function setResidents($value) {
        $this->residents = $value;
    }

    public function getPostalSubscriptions() {
        return isset($this->postalSubscriptions) ? $this->postalSubscriptions : [];
    }

    public function setPostalSubscriptions(array $value) {
        $this->postalSubscriptions = $value;
    }


}