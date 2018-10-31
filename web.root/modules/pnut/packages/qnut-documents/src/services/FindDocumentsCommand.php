<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 10/21/2018
 * Time: 7:39 AM
 */

namespace Peanut\QnutDocuments\services;


use Peanut\QnutDocuments\DocumentManager;
use Tops\services\TServiceCommand;
use Tops\sys\TNameValuePair;

/**
 * Class FindDocumentsCommand
 * @package Peanut\QnutDocuments\services
 *
 * Service Contract:
 *   Request:
 *     interface IDocumentSearchRequest {
 *         title: string,
 *         keywords: string,
 *         fulltext: boolean,
 *         dateSearchMode: any,
 *         firstDate: any,
 *         secondDate: any,
 *         properties: string[]
 *         }
 *   Response:
 *       Array of interface IDocumentSearchResult {
 *         id: any,
 *         title: string,
 *         publicationDate: string,
 *         uri: string;
 *         editUrl: string,
 *         documentType: string
 *      }
 */

class FindDocumentsCommand extends TServiceCommand
{

    protected function run()
    {
        $request = $this->getRequest();
        $response = DocumentManager::getInstance()->searchDocuments($request);
        $this->setReturnValue($response);
    }
}