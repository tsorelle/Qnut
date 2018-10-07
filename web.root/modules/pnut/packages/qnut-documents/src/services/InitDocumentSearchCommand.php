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
            'committee-entity',
            'date-search-mode-after',
            'date-search-mode-before',
            'date-search-mode-between',
            'date-search-mode-on',
            'document-doc-type',
            'document-file-type',
            'document-search-button',
            'document-search-found',
            'document-search-not-found',
            'document-search-dropdown-caption',
            'document-search-publication-date',
            'document-search-return',
            'document-search-terms',
            'document-search-text',
            'document-status-type',
            'label-clear-form',
            'label-date',
            'label-end-date',
            'label-fulltext',
            'label-title'
        ]);
        $response->fullTextSupported = true; // todo: configure full text support
        $this->setReturnValue($response);
    }
}