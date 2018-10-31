<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 6/19/2018
 * Time: 5:16 PM
 */

namespace Peanut\QnutDocuments\services;

use Tops\services\TServiceCommand;

class InitDocumentFormCommand extends TServiceCommand
{
    protected function run()
    {
        $response = new \stdClass();
        $response->maxFileSize = ini_get('upload_max_filesize');
    }
}