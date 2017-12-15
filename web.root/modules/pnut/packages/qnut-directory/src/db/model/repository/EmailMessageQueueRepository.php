<?php 
/** 
 * Created by /tools/create-model.php 
 * Time:  2017-11-15 13:11:28
 */ 
namespace Peanut\QnutDirectory\db\model\repository;


use \PDO;
use PDOStatement;
use Tops\db\TDatabase;
use \Tops\db\TEntityRepository;

class EmailMessageQueueRepository extends \Tops\db\TEntityRepository
{
    protected function getTableName() {
        return 'qnut_email_message_recipients';
    }

    protected function getDatabaseId() {
        return null;
    }

    protected function getClassName() {
        return 'Peanut\QnutDirectory\db\model\entity\EmailMessageRecipient';
    }

    protected function getFieldDefinitionList()
    {
        return array(
        'id'=>PDO::PARAM_INT,
        'mailMessageId'=>PDO::PARAM_INT,
        'personId'=>PDO::PARAM_INT);
    }
    public function queueMessages($messageId,$listId) {
        $sql = 'INSERT INTO qnut_email_message_queue (mailMessageId,personId) '.
            "SELECT $messageId AS mailMessageId, s.personId FROM qnut_email_subscriptions s WHERE s.listId = ?";
        $stmt = $this->executeStatement($sql, [$listId]);
        return $stmt->rowCount();
    }
}