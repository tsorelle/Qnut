<?php 
/** 
 * Created by /tools/create-model.php 
 * Time:  2017-11-15 13:11:28
 */ 

namespace Peanut\QnutDirectory\db\model\entity;

use Tops\sys\TNameValuePair;

class Address  extends \Tops\db\TEntity
{
    const postalSubscriptionsProperty = 'postalsubscriptions';
    const residentsProperty = 'residents';

    // public $id;
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
    // public $active;

    /**
     * @var TNameValuePair[]
     */
    private $residents = [];
    public $postalSubscriptions = [];

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