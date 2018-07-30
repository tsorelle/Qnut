<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 6/19/2018
 * Time: 5:14 PM
 */
namespace Peanut\QnutDocuments\services;

use Peanut\QnutDocuments\db\model\DocumentIndexManager;

class InitDocumentSearchCommand extends \Tops\services\TServiceCommand
{

    protected function run()
    {
        $manager = new DocumentIndexManager();
        $response = $manager->getMetaData();
        $response->translations = []; // todo: add translations
        $this->setReturnValue($response);
    }
}