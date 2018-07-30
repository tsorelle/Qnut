<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 6/19/2018
 * Time: 5:38 PM
 */

namespace Peanut\QnutDocuments\db\model;


use Peanut\QnutDocuments\db\model\entity\Document;
use Peanut\QnutDocuments\db\model\repository\DocumentsRepository;
use Tops\db\model\repository\LookupTableRepository;
use Tops\db\TEntitySearch;

class DocumentIndexManager
{
    private $documentsRepository;
    private function getDocumentsRepository() {
        if (!isset($this->documentsRepository)) {
            $this->documentsRepository = new DocumentsRepository();
        }
        return $this->documentsRepository;
    }


    public function getDocument($id) {
          return $this->getDocumentsRepository()->get($id);
    }

    public function getMetaData() {
        $response = new \stdClass();
        $properties = $this->getDocumentsRepository()->getEntityProperties();
        $response->propertyDefs = $properties->getDefinitions();
        $response->propertyLookups = $properties->getLookups();
        $response->documentStatusTypes = (new LookupTableRepository('qnut_document_status_types'))->getLookupList();
        $response->documentTypes = (new LookupTableRepository('qnut_document_types'))->getLookupList();
        return $response;
    }


}