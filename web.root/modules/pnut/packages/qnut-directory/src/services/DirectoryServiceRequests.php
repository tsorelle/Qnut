<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 12/2/2017
 * Time: 10:57 AM
 */

namespace Peanut\QnutDirectory\services;


use Tops\services\IMessageContainer;
use Tops\sys\TLanguage;

class DirectoryServiceRequests
{
    private $messages;
    public function __construct(IMessageContainer $messages)
    {
        $this->messages = $messages;
    }

    public function getAddressRequest($request) {
        $addressEntityName = TLanguage::text('dir-address-entity');
        if (empty($request->address)) {
            $this->messages->addErrorMessage('service-no-request-value',[$addressEntityName]);
            return false;
        }
        return $request->address;
    }

    public function getAddressIdRequest($request) {
        $addressEntityName = TLanguage::text('dir-address-entity');
        if (empty($request->addressId)) {
            $this->messages->addErrorMessage('service-no-request-value',[$addressEntityName.' id']);
            return false;
        }
        return $request->addressId;
    }

    public function getPersonRequest($request) {
        $personEntityName = TLanguage::text('dir-person-entity');
        if (empty($request->person)) {
            $this->messages->addErrorMessage('service-no-request-value',[$personEntityName]);
            return false;
        }
        return $request->personId;
    }

    public function getPersonIdRequest($request) {
        $personEntityName = TLanguage::text('dir-person-entity');
        if (empty($request->personId)) {
            $this->messages->addErrorMessage('service-no-request-value',[$personEntityName.' id']);
            return false;
        }
        return $request->personId;
    }

    public function getValueRequest($request,$itemName) {
        if (empty($request->Value)) {
            $itemName = TLanguage::text($itemName);
            $this->messages->AddErrorMessage('service-no-request-value',[$itemName]);
            return false;
        }
        return $request->Value;
    }

    public function getNameRequest($request,$itemName) {
        if (empty($request->Name)) {
            $itemName = TLanguage::text($itemName);
            $this->messages->AddErrorMessage('service-no-request-name',[$itemName]);
            return false;
        }
        return $request->Name;
    }


}