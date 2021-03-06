<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 1/11/2018
 * Time: 6:01 AM
 */

namespace Peanut\QnutDirectory\services\organizations;


use Peanut\PeanutTasks\TaskQueueEntry;
use Peanut\QnutDirectory\db\DirectoryManager;
use Peanut\QnutDirectory\db\model\entity\Address;
use Tops\services\TServiceCommand;
use Tops\sys\TLanguage;
use Tops\sys\TPermissionsManager;

/**
 * Class UpdateOrganizationCommand
 * @package Peanut\QnutDirectory\services\organizations
 *
 * Service contract:
 *      Request:
 *          {
 *              pageSize: for organization list,
 *          	organization: {
 *                      id   :any;
 *          			name        : string;
 *          			code        : string;
 *          			description : string;
 *          			addressId : any;
 *          			organizationType : any ;
 *          			email : string;
 *          			phone : string;
 *          			fax : string;
 *          			notes : string;
 *          		},
 *          	address: DirectoryAddress {
 *          			id             : any = null;
 *          			addressname    : string = '';
 *          			address1       : string = '';
 *          			address2       : string = '';
 *          			city           : string = '';
 *          			state          : string = '';
 *          			postalcode     : string = '';
 *          			country        : string = '';
 *          			phone          : string = '';
 *          			notes          : string = '';
 *          			createdon      : string = '';
 *          			sortkey        : string = '';
 *          			addresstypeId  : any = null;
 *          			listingtypeId  : any = null;
 *          			latitude       : any = null;
 *          			longitude      : any = null;
 *          			active         : number = 1;
 *          			residents : // Not assigned for organization address
 *          			postalSubscriptions: any[];
 *          			editState: number = Peanut.editState.created;
 *          		}
 *          };
 *
 *      Success Response:
 *          {
 *              maxPages: number
 *              organization: IOrganization
 *              address: IAddress
 *              organizations: Array of
 *                  interface IOrganizationListItem {
 *                      id: any,
 *                      name: string,
 *                      code: string,
 *                      typeName: string;
 *                  }
 *      Failed response:
 *          {
 *              errortype: string
 *              errormessage: string
 *          }
 */
class UpdateOrganizationCommand extends TServiceCommand
{
    public function __construct()
    {
        $this->addAuthorization(TPermissionsManager::updateDirectoryPermissionName);
    }


    protected function run()
    {
        $request = $this->getRequest();
        if (empty($request)) {
            $this->addErrorMessage('service-no-request');
            return;
        }
        $pageSize = 0;
        $pageNumber = 1;
        $includeInactive = false;
        if (!empty($request->pageSize)) {
            $pageSize = $request->pageSize;
        }

        $manager = new DirectoryManager($this->getMessages(),$this->getUser()->getUserName());

        $errorCode = $manager->updateOrganization(
                $request->organization,
                empty($request->address) ? null : $request->address
            );

        $response = new \stdClass();
        if ($errorCode) {
            switch($errorCode) {
                case DirectoryManager::errorDuplicateCode :
                    $response->errortype = 'duplicate-code';
                    $response->errormessage = TLanguage::text('organization-code-error');
                    break;
            }
            $this->setReturnValue($response);
            return;
        }

        $response = $manager->getOrganizationsList($pageNumber,$pageSize);
        $response->organization = $manager->getOrganizationByCode($request->organization->code);
        if (empty($response->organization->addressId)) {
            $response->address = null;
        }
        else {
            $response->address = $manager->getAddressById($response->organization->addressId, [Address::postalSubscriptionsProperty]);
            if (empty($response->address)) {
                $response->organization->addressId = null; // address may have been deleted
            }
        }
        $this->setReturnValue($response);
    }
}