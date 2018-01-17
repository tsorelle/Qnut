<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 1/16/2018
 * Time: 10:44 AM
 */

namespace Peanut\QnutDirectory\services\downloads;


use Peanut\QnutDirectory\db\DirectoryManager;
use Tops\services\TServiceCommand;
use Tops\sys\TLanguage;

class InitializeDownloadsCommand extends TServiceCommand
{

    protected function run()
    {
        $result = new \stdClass();
        $manager = new DirectoryManager($this->getMessages());
        $result->affiliations = $manager->getAffiliationsList();
        $result->emailLists = $manager->getEmailListLookup();
        $result->postalLists = $manager->getPostalListLookup();
        $result->translations = TLanguage::getTranslations([
            'dir-label-affiliation',
            'dir-label-please-select',
            'download-addresses-description',
            'download-affiliations-caption',
            'download-contacts-description',
            'download-directory-only',
            'download-emails-description',
            'download-include-kids',
            'download-postal-description',
            'label-contacts',
            'label-description',
            'label-download',
            'label-email-lists',
            'label-fields',
            'label-options',
            'label-postal-lists',
            'list-select-caption'
            ]);

        $result->translations['addresses-label']   = ucfirst(TLanguage::text('dir-address-entity-plural'));

        $this->setReturnValue($result);
    }
}