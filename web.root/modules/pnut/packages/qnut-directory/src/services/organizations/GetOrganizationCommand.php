<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 1/8/2018
 * Time: 5:42 AM
 */

namespace Peanut\QnutDirectory\services\organizations;


use Peanut\QnutDirectory\db\DirectoryManager;
use Peanut\QnutDirectory\db\model\entity\Address;
use Peanut\QnutDirectory\db\model\repository\AddressesRepository;
use Peanut\QnutDirectory\db\model\repository\OrganizationsRepository;
use Tops\services\TServiceCommand;
use Tops\sys\TLanguage;
use Tops\sys\TPermissionsManager;

/**
 * Class GetOrganizationCommand
 * @package Peanut\QnutDirectory\services\organizations
 *
 *   Service contract:
 *      Request - int organization id
 *      Response:
 *          interface IGetOrganizationResponse extends IOrganizationEntity {
 *              organization: IOrganizationEntity; // same as Organization.php
 *              address : DirectoryAddress | null; // same as Address.php plus postalSubscriptions: any[];
 *                          see:GetFamilyService::getAddress and DirectoryManager::getAddressById
 *          }
 */
class GetOrganizationCommand extends TServiceCommand
{

    public function __construct()
    {
        $this->addAuthorization(TPermissionsManager::viewDirectoryPermissionName);
    }

    protected function run()
    {
        $id = $this->getRequest();
        if (empty($id)) {
            $this->addErrorMessage('service-no-request');
            return;
        }
        $response = new \stdClass();
        $manager = new DirectoryManager();
        $response->organization = $manager->getOrganizationById($id);
        if (empty($response->organization)) {
            $organizationEntityName = TLanguage::text('organization-entity');
            $this->addErrorMessage('error-entity-id-not-found',[$organizationEntityName,$id]);
            return;
        }
        $response->address = null;

        if (!empty($response->organization->addressId)) {
            $response->address = $manager->getAddressById($response->organization->addressId, [Address::postalSubscriptionsProperty]);
            if (empty($response->address)) {
                $response->organization->addressId = null; // address may have been deleted
            }
        }

        $this->setReturnValue($response);
    }
}