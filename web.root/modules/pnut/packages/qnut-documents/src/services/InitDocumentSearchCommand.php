<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 6/19/2018
 * Time: 5:14 PM
 */
namespace Peanut\QnutDocuments\services;

use Peanut\QnutDocuments\DocumentManager;
use Tops\sys\TConfiguration;
use Tops\sys\TLanguage;

class InitDocumentSearchCommand extends \Tops\services\TServiceCommand
{

    protected function run()
    {
        $manager = new DocumentManager();
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
            'document-new-button',
            'document-search-found',
            'document-search-not-found',
            'document-search-dropdown-caption',
            'document-search-publication-date',
            'document-search-return',
            'document-search-terms',
            'document-search-text',
            'document-search-keyword-option',
            'document-search-literal-option',
            'document-status-type',
            'document-icon-label-view',
            'document-icon-label-download',
            'document-icon-label-edit',
            'label-clear-form',
            'label-publication-date',
            'label-doc-type',
            'label-date',
            'label-end-date',
            'label-fulltext',
            'label-title'
        ]);
        $response->fullTextSupported = TConfiguration::getBoolean('fulltext','documents',true);
        $this->setReturnValue($response);
    }
}