<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 11/12/2017
 * Time: 6:29 AM
 */

namespace Peanut\QnutDirectory\services;

use Tops\services\TServiceCommand;
use Tops\sys\TLanguage;
use Tops\sys\TPermissionsManager;
use Tops\sys\TUser;
use Peanut\QnutDirectory\db\DirectoryManager;

/**
 * Class InitializeDirectoryCommand
 * @package Peanut\QnutDirectory\services
 *
 *  Service contract
 *    interface IInitDirectoryResponse {
 *       canEdit : boolean;
 *       listingTypes : Peanut.ILookupItem[];
 *       addressTypes : Peanut.ILookupItem[];
 *       organizations: Peanut.ILookupItem[];
 *       affiliationRoles: Peanut.ILookupItem[];
 *       emailLists : Peanut.ILookupItem[];
 *       postalLists : Peanut.ILookupItem[];
 *       family : IDirectoryFamily;
 *       translations : string[];
 *   }
 *
 *   interface IDirectoryFamily {
 *      address : DirectoryAddress;
 *      persons: DirectoryPerson[];
 *      selectedPersonId : any;
 *   }
 *   See GetFamilyService for details
 */


class InitializeDirectoryCommand extends TServiceCommand
{
    public function __construct() {
        $this->addAuthorization(TPermissionsManager::viewDirectoryPermissionName);
    }

    protected function run()
    {
        $result = new \stdClass();
        $manager = new DirectoryManager();
        $user = TUser::getCurrent();

        $result->canEdit = $user->isAuthorized('administer directory');

        $result->organizations = $manager->getOrganizationsList(DirectoryManager::listDefaultFirst);

        $result->listingTypes = $manager->getDirectoryListingTypeList();
        $result->addressTypes = $manager->getAddressTypeList();
        $result->affiliationRoles = $manager->getAffiliationRolesList();
        $result->emailLists = $manager->getEmailListLookup();
        $result->postalLists = $manager->getPostalListLookup();

        $result->family = null;
        $personId = $this->getRequest();
        if ($personId) {
            $service = new GetFamilyService($this->getMessages());
            $service->getPerson($personId);
            $result->family = $service->getResponse();
        }

        $result->translations = TLanguage::getTranslations(array(
            'dir-address-entity',
            'dir-address-entity-plural',
            'dir-label-address-name',
            'dir-affiliation-error',
            'dir-affiliation-role-error',
            'dir-button-label-get-address',
            'dir-button-label-move',
            'dir-description-young-friend',
            'dir-label-affiliation',
            'dir-label-affiliation-plural',
            'dir-label-affiliation-role',
            'dir-label-address-delete',
            'dir-label-person-delete',
            'dir-label-address-type',
            'dir-label-city',
            'dir-label-country',
            'dir-label-directory-listing',
            'dir-label-household-phone',
            // 'dir-label-junior',
            'dir-label-kids-only',
            'dir-label-no-address',
            'dir-label-organization',
            'dir-label-pocode',
            'dir-label-please-select',
            'dir-label-residents',
            'dir-label-sort-key',
            'dir-label-state',
            'dir-label-street-address',
            'dir-label-subscriptions',
            'dir-label-user-name',
            'dir-list-new-person',
            'dir-person-entity',
            'dir-person-entity-plural',
            'form-error-email-invalid',
            'form-error-message',
            'form-error-name-blank',
            'form-error-name-blank',
            'label-add',
            'label-birth-date',
            'label-cancel',
            'label-delete',
            'label-deceased',
            'label-edit',
            'label-email',
            'label-error',
            'label-find',
            'label-found',
            'label-name',
            'label-new',
            'label-notes',
            'label-phone',
            'label-remove',
            'label-save',
            'label-select',
            'label-updated',
            'label-young-friend',
            'nav-more',
            'nav-previous',

            ));

        $result->translations['dir-entity-label-persons']   = ucfirst(TLanguage::text('dir-person-entity-plural'));
        $result->translations['dir-entity-label-person']    = ucfirst(TLanguage::text('dir-person-entity'));
        $result->translations['dir-entity-label-addresses'] = ucfirst(TLanguage::text('dir-address-entity-plural'));
        $result->translations['dir-entity-label-address']   = ucfirst(TLanguage::text('dir-address-entity'));

        $this->setReturnValue($result);
    }
}