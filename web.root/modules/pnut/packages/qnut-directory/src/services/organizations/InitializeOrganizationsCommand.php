<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 1/5/2018
 * Time: 10:19 AM
 */

namespace Peanut\QnutDirectory\services\organizations;


use Peanut\QnutDirectory\db\DirectoryManager;
use Tops\services\TServiceCommand;
use Tops\sys\TLanguage;
use Tops\sys\TPermissionsManager;
use Tops\sys\TUser;

class InitializeOrganizationsCommand extends TServiceCommand
{
    public function __construct()
    {
        $this->addAuthorization(TPermissionsManager::viewDirectoryPermissionName);
    }

    protected function run()
    {
        $pageSize = 0;
        $pageNumber = 1;
        $request = $this->getRequest();
        if (!empty($request)) {
            if (!empty($request->pageSize)) {
              $pageSize = $request->pageSize;
            }
            if (!empty($request->pageNumber)) {
                $pageNumber = $request->pageNumber;
            }
        }
        $response = new \stdClass();
        $manager = new DirectoryManager($this->getMessages());
        $list = $manager->getOrganizationsList($pageNumber,$pageSize);
        $response->organizations = $list->organizations;
        $response->maxPages = $list->maxpages;

        $user = TUser::getCurrent();

        $response->canEdit = $user->isAuthorized('administer directory');
        $response->listingTypes = $manager->getDirectoryListingTypeList();
        $response->addressTypes = $manager->getAddressTypeList();
        $response->affiliationRoles = $manager->getAffiliationRolesList();
        $response->postalLists = $manager->getPostalListLookup();
        $response->organizationTypes = $manager->getOrganizationTypeList();

        $response->translations = TLanguage::getTranslations([
                'dir-label-address-name',
                'dir-label-address-type',
                'dir-label-city',
                'dir-label-country',
                'dir-label-directory-listing',
                'dir-label-organization',
                'dir-label-organization',
                'dir-label-organization-type',
                'dir-label-pocode',
                'dir-label-sort-key',
                'dir-label-state',
                'dir-label-street-address',
                'dir-label-subscriptions',
                'form-error-email-invalid',
                'form-error-name-blank',
                'form-error-message',
                'label-address',
                'label-cancel',
                'label-code',
                'label-create-address',
                'label-delete',
                'label-description',
                'label-details',
                'label-edit',
                'label-email',
                'label-error',
                'label-fax',
                'label-name',
                'label-next',
                'label-notes',
                'label-of',
                'label-page',
                'label-phone',
                'label-previous',
                'label-remove-address',
                'label-return-list',
                'label-save',
                'label-updated',
                'organization-code-error-blank',
                'organization-confirm-delete-header',
                'organization-confirm-delete-text',
                'organization-confirm-save-header',
                'organization-confirm-save-text',
                'organization-error-name',
                'organization-error-type',
                'organization-entity',
                'organization-remove',
                'organization-select-caption',
                'organizations-label-add-new',
                'organizations-label-type',
                'organizations-list-heading',
                'validation-code-blank'
            ]
        );

        $response->translations['dir-entity-label-addresses'] = ucfirst(TLanguage::text('dir-address-entity-plural'));
        $response->translations['dir-entity-label-address']   = ucfirst(TLanguage::text('dir-address-entity'));

        $this->setReturnValue($response);
    }
}