<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 10/17/2018
 * Time: 6:04 AM
 */

namespace Peanut\QnutDocuments;


use Peanut\QnutDocuments\db\model\entity\Document;
use Peanut\QnutDocuments\db\model\repository\DocumentsRepository;
use Peanut\sys\ViewModelManager;
use Tops\db\model\repository\LookupTableRepository;
use Tops\sys\TConfiguration;
use Tops\sys\TLanguage;
use Tops\sys\TNameValuePair;
use Tops\sys\TPath;
use Tops\sys\TStringTokenizer;
use Tops\sys\TUser;

class DocumentManager
{

    const defaultDocumentsUri = '/documents/';
    const defaultSearchUri = '/document-search/';
    private static $documentsUri;
    public static function getDocumentsUri() {
        if (!isset(self::$documentsUri)) {
            self::$documentsUri = TConfiguration::getValue('uri','documents',self::defaultDocumentsUri);
            if (substr(self::$documentsUri,strlen(self::$documentsUri) - 1) !== '/') {
                self::$documentsUri .= '/';
            }
        }
        return self::$documentsUri;
    }

    private static $searchUri;
    public static function getSearchUri() {
        if (!isset(self::$searchUri)) {
            self::$searchUri = TConfiguration::getValue('uri','documents',self::defaultSearchUri);
            if (substr(self::$searchUri,strlen(self::$searchUri) - 1) !== '/') {
                self::$searchUri .= '/';
            }
        }
        return self::$searchUri;
    }


    /**
     * @var DocumentsRepository
     */
    private $documentsRepository;

    /**
     * @var \Tops\db\EntityProperties EntityProperties
     */
    private $properties;

    const defaultDocumentLocation = 'application/documents';

    public function __construct()
    {
        $this->documentsRepository = new DocumentsRepository();
        $this->properties = $this->documentsRepository->getEntityProperties();
    }

    /**
     * @var DocumentManager
     */
    private static $instance;

    /**
     * @return DocumentManager
     */
    public static function getInstance() {
        if (!isset(self::$instance)) {
            self::$instance = new DocumentManager();
        }
        return self::$instance;
    }

    private static $documentDir;
    public static function getDocumentDir($private,$folder='',$fileName='') {
        if (!isset(self::$documentDir)) {
            $location = TConfiguration::getValue('location','documents',self::defaultDocumentLocation);
            self::$documentDir = TPath::fromFileRoot($location);
            if (!is_dir(self::$documentDir)) {
                mkdir(self::$documentDir, 0664, true);
            }
        }
        $result =  TPath::joinPath(self::$documentDir, ($private ? 'private' : 'public'));
        if ($folder) {
            $result .= "/$folder";
        }
        if ($fileName) {
            $result .= "/$fileName";
        }
        return $result;
    }

    public function getDocumentPath($document) {
        return self::getDocumentDir($document->protected,$document->folder,$document->filename);
    }

    private static function getMimeType($ext) {
        // mime types  https://www.lifewire.com/file-extensions-and-mime-types-3469109

        switch(strtolower($ext)) {
            case 'pdf' :
                return 'application/pdf';
            case 'txt' :
                return 'text/plain';
            case 'rtf' :
                return 'text/rtf';
            case 'doc' :
            case 'docx':
                return 'application/mssord';
            default:
                return 'application/octet-stream';
        }
    }

    /**
     * Stream document file from library
     * Called from routing function, depending on the CMS.
     * @param null $uri
     */
    public static function returnDocumentContent($uri=null) {
        if ($uri === null) {
            global $_SERVER;
            $uri = $_SERVER['REQUEST_URI'];
        }
        $docsUri = DocumentManager::getDocumentsUri();
        $args =  explode('/',substr($uri,strlen($docsUri)));
        $argc = count($args);
        $download = false;
        if ($argc > 1 && strtolower($args[$argc - 1]) === 'download') {
            $download = true;
            array_pop($args);
            $argc--;
        }
        if ($argc == 0) {
            self::exitNotFound();
        }
        if (is_numeric($args[0])) {
            $document = self::getInstance()->getDocument($args[0]);
            if (empty($document)) {
                self::exitNotFound();
            }
            $private = $document->protected;
            $filename = $document->filename;
            $folder = $document->folder;
        }
        else {
            if ($args[0] === 'public' || $args[0] === 'private') {
                $p = array_shift($args);
                $private = ($p === 'private');
            }
            $filename = array_pop($args);
            $folder = implode('/',$args);
            $filepath = self::getDocumentDir(true, $folder, $filename);
            if (!isset($private)) {
                $private = file_exists($filepath);
            }
        }
        self::openDocument($filename,$folder,$private,$download);
    }

    public static function exitNotFound()
    {
        header("HTTP/1.0 404 Not Found");
        print TLanguage::text('document-open-error-no-file','Document not found in the library');
        exit;
    }

    public static function exitNotAuthorized() {
        header("HTTP/1.0 401  Unauthorized");
        print TLanguage::text('document-open-error-not-authorized','You must sign in to view documents in the library');
        exit;
    }

    public static function openDocument($filename,$folder='',$private=true,$download=null) {
        if ($private && !TUser::getCurrent()->isAuthenticated()) {
            self::exitNotAuthorized();
        };
        $filepath = self::getDocumentDir($private,$folder,$filename);
        if (!file_exists($filepath)) {
            self::exitNotFound();
        }

        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        $mimetype = self::getMimeType($ext);

        if ($download === true || $ext !== 'pdf') {
            header("Content-Disposition: attachment; filename=$filename;");
        }
        header("Content-Type: $mimetype");
        header('Content-Length: ' . filesize($filepath));

        $data = file_get_contents($filepath);
        print $data;
        exit;
    }

    public function getDocumentsRepository() {
        return $this->documentsRepository;
    }

    public function getProperties() {
        return $this->properties;
    }

    /**
     * @param $id
     * @return bool|Document
     */
    public function getDocument($id) {
        $document = $this->documentsRepository->get($id);
        return $document;
    }

    public function getDocumentPropertyValues($id) {
        return $this->properties->getValues($id);
    }

    public function validatePropertyValues($propertyValues) {
        return $this->properties->validate($propertyValues);
    }

    public function updateDocument(Document $document,$propertyValues,$userName) {
        if (empty($document->id)) {
            $documentId = $this->documentsRepository->insert($document, $userName);
        } else {
            $documentId = $document->id;
            $this->documentsRepository->update($document, $userName);
        }

        if ($propertyValues !== null) {
            $this->properties->setValues($documentId,$propertyValues);
        }

        return $this->documentsRepository->get($documentId);
    }

    public function checkDuplicateFiles($document) {
        $filename = TPath::normalizeFileName($document->filename);
        $dupes = $this->documentsRepository->findDuplicates($filename,$document->folder,$document->protected,$document->id);
        return $dupes;
    }

    public function documentFileExists(Document $document) {
        $filepath = self::getDocumentDir($document->protected,trim($document->folder),$document->filename);
        return file_exists($filepath);
    }

    public function getMetaData() {
        $response = new \stdClass();
        $properties = $this->getDocumentsRepository()->getEntityProperties();
        $response->properties = $properties->getLookupDefinitions(); // only lookup properties are supported at this time.
        $response->propertyLookups = $properties->getLookups();
        return $response;
    }

    public function getFileTypesLookup() {
        return (new LookupTableRepository('qnut_document_file_types'))->getLookupList(LookupTableRepository::noTranslation,null,LookupTableRepository::noSort);
    }

    public function searchDocuments($request) {
        $docpage = ViewModelManager::getVmUrl('Document','qnut-documents');
        return $this->getDocumentsRepository()->searchDocuments($request,self::getDocumentsUri(),$docpage);
    }

    public function deleteDocument($id)
    {
        $this->properties->dropValues($id);
        $this->documentsRepository->delete($id);
    }
}