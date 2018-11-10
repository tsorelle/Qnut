<?php 
/** 
 * Created by /tools/create-model.php 
 * Time:  2018-06-19 22:31:43
 */ 
namespace Peanut\QnutDocuments\db\model\repository;


use \PDO;
use Tops\db\EntityProperties;
use Tops\db\TEntitySearch;
use Tops\sys\TStringTokenizer;

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
            'folder'=>PDO::PARAM_STR,
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
        $sortOrder = empty($request->sortOrder) ? 1 : $request->sortOrder;
        switch($sortOrder) {
            case 1 : $sortBy = 'publicationDate'; break;
            case 2 : $sortBy = 'title'; break;
            default : $sortBy = 'id';
        }

        if (!empty($request->sortDesending)) {
            $sortBy .= ' DESC ';
        }

        $itemsPerPage = empty($request->itemsPerPage) ? 0 : $request->itemsPerPage;
        $pageNo = empty($request->pageNumber) ? 1 : $request->pageNumber;
        $offset =  $itemsPerPage > 0 ?  (($pageNo - 1) * $itemsPerPage) : 0;

        $whereStatements = array();
        $parameters = array();
        $filterProperties = is_array($request->properties) ? $request->properties : array();

        $sqlHeader = 'SELECT doc.id,title,publicationDate, '.
            "CONCAT('$uri',doc.id) AS uri , CONCAT('$docPage',doc.id) AS editUrl ,UPPER( SUBSTRING_INDEX(filename,'.',-1)) AS documentType ";

        $sql =  ' FROM qnut_documents doc ';

        if (!empty($filterProperties)) {
            // todo: test after adding properties to test data
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

        if (!empty($request->keywords)) {
            $request->keywords = str_replace('%','&percnt;',$request->keywords);
            if ($request->literal) {
                $whereStatements[] = "REPLACE(abstract,'%','&percnt;') like ?";
                $parameters[] = '%'.$request->keywords.'%';
            }
            else {
                $words = TStringTokenizer::extractKeywords($request->keywords);
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

        $response = new \stdClass();
        if (empty($request->recordCount)) {
            $stmt = $this->executeStatement("SELECT COUNT(*) $sql",$parameters);
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

}