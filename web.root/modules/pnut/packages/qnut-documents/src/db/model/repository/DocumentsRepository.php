<?php 
/** 
 * Created by /tools/create-model.php 
 * Time:  2018-06-19 22:31:43
 */ 
namespace Peanut\QnutDocuments\db\model\repository;


use \PDO;
use Peanut\QnutDocuments\PdfTextParser;
use Tops\db\EntityProperties;
use Tops\db\TEntitySearch;
use Tops\sys\TStringTokenizer;

class DocumentsRepository extends \Tops\db\TEntityRepository
{
    /**
     * @param $fileName
     * @param $folder
     * @param $protected
     * @param int $excludeId
     * @return \Peanut\QnutDocuments\db\model\entity\Document[]
     */
    public function findDuplicates($fileName, $folder, $protected, $excludeId = 0)
    {
        $protected = empty($protected) || $protected === '0' ? 0 : 1;
        $sql = 'SELECT * FROM '.$this->getTableName().
            ' WHERE filename = ? AND folder = ? AND protected = ? AND id <> ?';
        $stmt = $this->executeStatement($sql, [$fileName,$folder,$protected,$excludeId]);
        /** @noinspection PhpMethodParametersCountMismatchInspection */
        $stmt->setFetchMode(PDO::FETCH_CLASS, 'Peanut\QnutDocuments\db\model\entity\Document');

        /**
         *  @var $result \Peanut\QnutDocuments\db\model\entity\Document[]
         */
        $result = $stmt->fetchAll();
        return $result;
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
            'folder'=>PDO::PARAM_STR,
            'abstract'=>PDO::PARAM_STR,
            'protected' =>PDO::PARAM_INT,
            'publicationDate'=>PDO::PARAM_STR,
            'createdby'=>PDO::PARAM_STR,
            'createdon'=>PDO::PARAM_STR,
            'changedby'=>PDO::PARAM_STR,
            'changedon'=>PDO::PARAM_STR,
            'active'=>PDO::PARAM_STR
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

    /**
     * @param $searchRequest
     *     interface IDocumentSearchRequest {
     *         title: string,
     *          fileType: string,
     *         keywords: string,
     *         fulltext: boolean,
     *         dateSearchMode: any,
     *         firstDate: any,
     *         secondDate: any,
     *         properties: INameValuePair[]
     *         literal: boolean
     *         sortOrder: any,
     *         sortDescending: boolean,
     *         pageNumber: any,
     *         itemsPerPage: any
     *         recordCount: any
     *       }
     */
    public function searchDocuments($request,$uri,$docPage) {
        $docPage .= '?id=';
        $itemsPerPage = empty($request->itemsPerPage) ? 0 : $request->itemsPerPage;
        $pageNo = empty($request->pageNumber) ? 1 : $request->pageNumber;
        $offset =  $itemsPerPage > 0 ?  (($pageNo - 1) * $itemsPerPage) : 0;
        $fullText = isset($request->searchType) && $request->searchType == 'text';
        $whereStatements = array();
        $text = isset($request->searchText) ? trim($request->searchText) : '';
        $words = array();
        if (!empty($text)) {
            $text = str_replace('%','&percnt;',$text);
            $words = PdfTextParser::GetIndexWords($text);
        }

        $parameters = array();


        if ($fullText) {
            if (empty($text)) {
                return false;
            }
            $sqlHeader = "SELECT DISTINCT id,title,publicationDate, uri,editUrl, 'PDF' as documentType ";
            $queryHeader = "SELECT doc.id,title,publicationDate, CONCAT('$uri',doc.id) AS uri ,CONCAT('$docPage',doc.id) AS editUrl ";

            $sql = ' FROM ( ';

            $countQuery = 'SELECT COUNT(distinct id) ';

            $join = ' FROM `qnut_document_text_index` idx JOIN qnut_documents doc ON doc.id = idx.documentId ';
            $likeText = " REPLACE(idx.text,'%','&percnt;') LIKE ? ";
            $sql .= $queryHeader.', -1 AS score '.$join;
            $sql .= 'WHERE '.$likeText;
            $parameters[] = "%$text%";

            $sql .= " UNION $queryHeader, -3 AS score $join WHERE ";
            $words = PdfTextParser::GetIndexWords($text);
            $op = '';
            foreach ($words as $word) {
                $sql .= $op.$likeText;
                $parameters[] = "%$word%";
                $op = ' AND ';
            }

            $sql .= " UNION $queryHeader, -3 AS score $join WHERE ";

            $op = '';
            foreach ($words as $word) {
                $sql .= $op.$likeText;
                $parameters[] = "%$word%";
                $op = 'OR ';
            }

            $sql .= ') AS found_docs ';
            $sortBy = 'score DESC ';

            /*
             * Example query
                -- SELECT count( distinct id)

                SELECT DISTINCT id,title,publicationDate,editUrl
                FROM (
                 SELECT doc.id,title,publicationDate, CONCAT('$uri',doc.id) AS uri , CONCAT('$docPage',doc.id) AS editUrl ,UPPER( SUBSTRING_INDEX(filename,'.',-1)) AS documentType, -1 AS score
                 FROM `qnut_document_text_index` idx
                 JOIN qnut_documents doc ON doc.id = idx.documentId
                 WHERE REPLACE(idx.text,'%','&percnt;') LIKE '%food for thought%'

                 UNION
                  SELECT doc.id,title,publicationDate, CONCAT('$uri',doc.id) AS uri , CONCAT('$docPage',doc.id) AS editUrl ,UPPER( SUBSTRING_INDEX(filename,'.',-1)) AS documentType, -2 AS score
                 FROM `qnut_document_text_index` idx
                 JOIN qnut_documents doc ON doc.id = idx.documentId
                 WHERE  REPLACE(idx.`text`,'%','&percnt;')  LIKE '%food%' AND  REPLACE(idx.`text`,'%','&percnt;')  LIKE '%for%' AND  REPLACE(idx.`text`,'%','&percnt;')  LIKE '%thought%'

                 UNION
                 SELECT doc.id,title,publicationDate, CONCAT('$uri',doc.id) AS uri , CONCAT('$docPage',doc.id) AS editUrl ,UPPER( SUBSTRING_INDEX(filename,'.',-1)) AS documentType, -3 AS score
                 FROM `qnut_document_text_index` idx
                 JOIN qnut_documents doc ON doc.id = idx.documentId
                 WHERE  REPLACE(idx.`text`,'%','&percnt;')  LIKE '%food%' OR  REPLACE(idx.`text`,'%','&percnt;')  LIKE '%for%' OR  REPLACE(idx.`text`,'%','&percnt;')  LIKE '%thought%'
                )
                AS found_docs
                ORDER BY score DESC
                LIMIT 2, 2;
             */
        }
        else  {
            $sqlHeader = 'SELECT doc.id,title,publicationDate, '.
                "CONCAT('$uri',doc.id) AS uri , CONCAT('$docPage',doc.id) AS editUrl ,UPPER( SUBSTRING_INDEX(filename,'.',-1)) AS documentType ";

            $countQuery = 'SELECT COUNT(*)';
            $sql =  ' FROM qnut_documents doc ';
            $sortOrder = empty($request->sortOrder) ? 1 : $request->sortOrder;
            switch($sortOrder) {
                case 1 : $sortBy = 'publicationDate'; break;
                case 2 : $sortBy = 'title'; break;
                default : $sortBy = 'id';
            }

            if (!empty($request->sortDesending)) {
                $sortBy .= ' DESC ';
            }
            $filterProperties = is_array($request->properties) ? $request->properties : array();
            if (!empty($filterProperties)) {
                $sql .= 'JOIN  tops_entity_property_values pv ON doc.id = pv.instanceId '.
                    'JOIN tops_entity_properties props ON pv.`entityPropertyId` = props.id ';

                foreach ($filterProperties as $property) {
                    $whereStatements[] = "(props.key = ? AND pv.value = ?)";
                    $parameters[] = $property->Key;
                    $parameters[] = $property->Value;
                }
            }

            if (!empty($request->title)) {
                $whereStatements[] = "(doc.title like ?)";
                $parameters[] =  '%'.$request->title.'%';
            }

            if (!empty($text)) {

                if ($request->literal) {
                    $whereStatements[] = "REPLACE(abstract,'%','&percnt;') like ?";
                    $parameters[] = '%'.$text.'%';
                }
                else {
                    // $words = TStringTokenizer::extractKeywords($request->text);
                    if (!empty($words)) {
                        $allWords = '%' . implode('%', $words) . '%';
                        $whereStatements[] = "REPLACE(abstract,'%','&percnt;') like ?";
                        $parameters[] = $allWords;
                        $statement = '';
                        foreach ($words as $word) {
                            if (!empty($statement)) {
                                $statement .= ' OR ';
                            }
                            $statement .= "REPLACE(abstract,'%','&percnt;') like ?";
                            $parameters[] = '%' . $word . '%';
                        }
                        if (!empty($statement)) {
                            $whereStatements[] = "($statement)";
                        }
                    }
                }
                if (!empty($whereStatements)) {
                    $sql .= ' WHERE ' . implode(' OR ',$whereStatements);
                }

                if (!empty($request->fileType)) {
                    if (empty($whereStatements)) {
                        $sql .= ' WHERE ';
                    }
                    else {
                        $sql .= ' AND ';
                    }
                    $sql .= ' doc.filename like ? ';
                    $parameters[] =  '%'.$request->fileType;
                }

            }
        }

        $response = new \stdClass();
        if (empty($request->recordCount)) {
            $stmt = $this->executeStatement("$countQuery $sql",$parameters);
            $result = $stmt->fetch();
            $response->recordCount = (empty($result) ?  0 : $result[0]);
        }
        else {
            $response->recordCount = $request->recordCount;
        }

        if (!empty($sortBy)) {
            $sql .= " ORDER BY $sortBy ";
        }

        if (!empty($itemsPerPage)) {
            $sql .= " LIMIT $offset, $itemsPerPage";
        }

        $stmt = $this->executeStatement($sqlHeader.$sql,$parameters);
        $response->searchResults = $stmt->fetchAll(PDO::FETCH_OBJ);
        return $response;
    }

    public function getUnindexedDocuments() {
        $where = "filename LIKE ? AND id NOT IN (SELECT documentId FROM qnut_document_text_index)";
        return $this->getEntityCollection($where,['%.pdf'],true);
    }

}