<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 10/13/2018
 * Time: 7:28 AM
 */

namespace Peanut\QnutDocuments\services;


use Tops\services\TServiceCommand;
use Peanut\QnutDocuments\db\model\entity\Document;
use Peanut\QnutDocuments\DocumentManager;
use Tops\services\TUploadHelper;
use Tops\sys\TLanguage;

class UpdateDocumentCommand extends TServiceCommand
{

    protected function run()
    {


        $request = $this->getRequest();
        if (!$request) {
            $this->addErrorMessage('No request received');
            return;
        }

        if (!isset($request->documentId)) {
            $this->addErrorMessage('error-no-id');
            return;
        }
        $documentId = $request->documentId;
        $isNew = empty($documentId);
        $protected = isset($request->protected) ? $request->protected : false;
        $folder = isset($request->folder) ? $request->folder : '';
        if (empty($request->title)) {
            $this->addErrorMessage('document-update-error-no-title');
            return;
        }

        $propertyValues = isset($request->propertyValues) ? $request->propertyValues : null;
        $documentManager = new DocumentManager();

        if ($propertyValues !== null) {
            $errors = $documentManager->validatePropertyValues($propertyValues);
            if (!empty($errors)) {
                foreach ($errors as $error) {
                    $this->addErrorMessage($error);
                }
                return;
            }
        }


        $documentEntityName = TLanguage::text('document-entity');

        /**
         * @var Document $document
         */
        $document = null;
        $fileCount = TUploadHelper::filesReady($this->getMessages());
        if ($this->hasErrors()) {
            return;
        }

        if ($isNew) {
            $document = new Document();
        } else {
            $document = $documentManager->getDocument($documentId);
            if (empty($document)) {
                $this->addErrorMessage('error-entity-id-not-found', [$documentEntityName, $documentId]);
                return;
            }
        }

        if ($fileCount) {
            if (!$isNew) {
                // replacing current file
                $currentFile = DocumentManager::getDocumentDir($document->protected, $document->location, $document->filename);
                unlink($currentFile);
            }
            $documentDir = DocumentManager::getDocumentDir($protected, $folder);

            $uploadedFiles = TUploadHelper::upload($this->getMessages(), $documentDir);
            if ($this->hasErrors()) {
                return;
            }
            $fileName = array_shift($uploadedFiles);
            if (!$fileName) {
                $this->addErrorMessage('SYSTEM ERROR: Cannot get uploaded file name');
                return;
            }
            $document->filename = $fileName;
        } else if ($isNew) {
            $this->addErrorMessage('document-update-error-no-upload');
            return;
        }

        $document->assignFromObject($request);
        if ($documentManager->documentFileExists($document)) {
            $document = $documentManager->updateDocument($document,$propertyValues,$this->getUser()->getUserName());
            $this->setReturnValue($document);
        }
        else {
            $this->addErrorMessage('document-update-error-no-file');
        }
    }
}