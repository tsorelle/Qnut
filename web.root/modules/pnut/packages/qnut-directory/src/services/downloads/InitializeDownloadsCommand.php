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
        $result->translations = TLanguage::getTranslations(array(
            'dir-label-affiliation',
            'dir-label-please-select',
            'label-download'
        ));

        // $result->translations['dir-entity-label-persons']   = ucfirst(TLanguage::text('dir-person-entity-plural'));

        $this->setReturnValue($result);


    }
}