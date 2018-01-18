<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 11/12/2017
 * Time: 6:38 AM
 */

namespace Peanut\QnutDirectory\services\membership;


use Peanut\QnutDirectory\db\DirectoryManager;
use Peanut\QnutDirectory\db\model\entity\Address;
use Peanut\QnutDirectory\db\model\entity\Person;
use Peanut\QnutDirectory\db\model\repository\AddressesRepository;
use Peanut\QnutDirectory\db\model\repository\PersonsRepository;
use Tops\services\IMessageContainer;
use Tops\services\TServiceCommand;
use Tops\sys\TLanguage;
/**
 * Class GetFamilyService
 * @package Peanut\QnutDirectory\services
 *
 * ServiceCommand extension class shared by GetFamilyCommand and InitializeDirectoryCommand
 * Service contract:
 *      Response:
 *           interface IDirectoryFamily {
 *               address : DirectoryAddress;
 *               persons: DirectoryPerson[];
 *               selectedPersonId : any;
 *           }
 *
 *           export class DirectoryAddress {
 *               public id             : any = null;
 *               public addressname    : string = '';
 *               public address1       : string = '';
 *               public address2       : string = '';
 *               public city           : string = '';
 *               public state          : string = '';
 *               public postalcode     : string = '';
 *               public country        : string = '';
 *               public phone          : string = '';
 *               public notes          : string = '';
 *               public createdon      : string = '';
 *               public addresstypeId  : any = null;
 *               public listingtypeId  : any = null;
 *               public latitude       : any = null;
 *               public longitude      : any = null;
 *               public changedby      : string = '';
 *               public changedon      : string = '';
 *               public createdby      : string = '';
 *               public active         : number = 1;
 *
 *               public residents : Peanut.INameValuePair[];
 *               public postalSubscriptions: any[];
 *
 *               public editState: number = Peanut.editState.created; // added on client side.
 *           }
 *
 *           export class DirectoryPerson {
 *               public id             : any = null;
 *               public addressId      : any = null;
 *               public listingtypeId  : any = null;
 *               public fullname       : string = '';
 *               public firstname       : string = '';
 *               public middlename       : string = '';
 *               public lastname       : string = '';
 *               public email          : string = '';
 *               public username       : string = '';
 *               public phone          : string = '';
 *               public phone2         : string = '';
 *               public dateofbirth    : string = '';
 *               public deceased       : string = '';
 *               public sortkey        : string = '';
 *               public notes          : string = '';
 *               public createdby      : string = '';
 *               public createdon      : string = '';
 *               public changedby      : string = '';
 *               public changedon      : string = '';
 *               public active         : number = 1;
 *
 *               public address: DirectoryAddress;
 *               public affiliations: IAffiliation[];
 *               public emailSubscriptions : any[];
 *
 *               public editState : number = Peanut.editState.created; // added on client side
 *           }
 *
 *       	export interface IAffiliation {
 *               organizationId: any;
 *               roleId: any;
 *           }
 *
 *       	 export interface INameValuePair {
 *               Name: string;
 *               Value: any;
 *           }
 */
class GetFamilyService
{
    /**
     * @var IMessageContainer
     */
    private $messages;

    private $response;
    private $manager;

    public function __construct($messages,$username='system')
    {
        $this->messages = $messages;
        $this->manager = new DirectoryManager($messages,$username);
        $this->response = new \stdClass();
        $this->response->persons = [];
        $this->response->address = null;
        $this->response->selectedPersonId = 0;
    }

    public function getAddress($addressId)
    {
        if (!empty($addressId)) {
            $address = $this->manager->getAddressById($addressId, [Address::postalSubscriptionsProperty]);
            if (empty($address)) {
                $this->messages->addErrorMessage('err-no-address',[$addressId]);
                $this->response = null;
            } else {
                $this->response->persons =
                    $this->manager->getAddressResidents($address->id,
                        [Person::emailSubscriptionsProperty,
                            Person::affiliationsProperty]);
                $this->response->selectedPersonId = empty($this->response->persons) ? null : $this->response->persons[0]->id;
                $this->response->address = $address;
            }
        }
    }


    public function getPerson($personId)
    {
        $person = $this->manager->getPersonById($personId,
            [   Person::affiliationsProperty,
                Person::emailSubscriptionsProperty]);
        if (empty($person)) {
            $this->messages->addErrorMessage('err-no-person', [$personId]);
            $this->response = null;
            return;
        }
        if (empty($person->addressId)) {
            $this->response->persons = [$person];
        }
        else {
            $this->GetAddress($person->addressId);
            if ($this->response === null) {
                return;
            }
        }
        $this->response->selectedPersonId = $person->id;
    }

    public function getResponse() {
        return $this->response;
    }


}