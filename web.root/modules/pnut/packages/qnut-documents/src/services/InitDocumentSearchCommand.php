<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 6/19/2018
 * Time: 5:14 PM
 */
namespace Peanut\QnutDocuments\services;

use Peanut\QnutDocuments\db\model\DocumentIndexManager;
use Tops\sys\TLanguage;

class InitDocumentSearchCommand extends \Tops\services\TServiceCommand
{

    protected function run()
    {
        $manager = new DocumentIndexManager();
        $response = $manager->getMetaData();
        $response->translations = TLanguage::getTranslations([
            'document-search-dropdown-caption'
        ]);
        $this->setReturnValue($response);
    }
}