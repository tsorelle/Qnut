<?php 
/** 
 * Created by /tools/create-model.php 
 * Time:  2018-06-19 22:31:43
 */ 
namespace Peanut\QnutDocuments\db\model\repository;


use \PDO;
use Tops\db\EntityProperties;
use Tops\db\TEntitySearch;

class DocumentsRepository extends \Tops\db\TEntityRepository
{
    private function getSearch()
    {
        return new TEntitySearch(self::EntityCode,$this->getTableName(),$this->getDatabaseId());
    }

    private $entityProperties;
    public function getEntityProperties() {
        if (!isset($this->entityProperties)) {
            $this->entityProperties = new EntityProperties(self::EntityCode);
        }
        return $this->entityProperties;
    }

    /*private $valuesRepository;
    private function getValuesRepository() {
        if (!isset($this->valuesRepository)) {
            $this->valuesRepository = new EntityPropertyValuesRepository();
        }
        return $this->valuesRepository;
    }*/

    const EntityCode = 'document';
    protected function getTableName() {
        return 'qnut_documents';
    }

    protected function getDatabaseId() {
        return null;
    }

    protected function getClassName() {
        return 'Peanut\QnutDocuments\db\model\entity\Document';
    }

    protected function getFieldDefinitionList()
    {
        return array(
            'id'=>PDO::PARAM_INT,
            'title'=>PDO::PARAM_STR,
            'filename'=>PDO::PARAM_STR,
            'location'=>PDO::PARAM_STR,
            'abstract'=>PDO::PARAM_STR,
            'keywords'=>PDO::PARAM_STR,
            'protected' =>PDO::PARAM_INT,
            'publicationDate'=>PDO::PARAM_STR,
        );
    }

    /**
     * @param $id
     * @return \Peanut\QnutDocuments\db\model\entity\ExtendedDocument
     */
    public function getDocument($id) {
        $sql = 'SELECT * FROM '.$this->getTableName().' WHERE id = ?';
        $stmt = $this->executeStatement($sql, [$id]);
        /** @noinspection PhpMethodParametersCountMismatchInspection */
        $stmt->setFetchMode(PDO::FETCH_CLASS, 'Peanut\QnutDocuments\db\model\entity\ExtendedDocument');

        /**
         *  @var $document \Peanut\QnutDocuments\db\model\entity\ExtendedDocument
         */
        $document = $stmt->fetch();
        if ($document) {
            $document->properties = $this->getEntityProperties()->getValues($id);
        }
        return $document;
    }

}