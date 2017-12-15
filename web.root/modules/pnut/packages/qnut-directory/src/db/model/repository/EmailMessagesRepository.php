<?php 
/** 
 * Created by /tools/create-model.php 
 * Time:  2017-11-15 13:11:28
 */ 
namespace Peanut\QnutDirectory\db\model\repository;


use \PDO;
use PDOStatement;
use Peanut\QnutDirectory\db\model\entity\EmailList;
use Peanut\QnutDirectory\db\model\entity\EmailMessage;
use Peanut\QnutDirectory\db\model\entity\EmailMessageRecipient;
use Tops\db\TDatabase;
use \Tops\db\TEntityRepository;

class EmailMessagesRepository extends \Tops\db\TEntityRepository
{
    protected function getTableName() {
        return 'qnut_email_messages';
    }

    protected function getDatabaseId() {
        return null;
    }

    protected function getRecipientClassName() {
        return 'Peanut\QnutDirectory\db\model\entity\EmailMessageRecipient';
    }

    protected function getClassName() {
        return 'Peanut\QnutDirectory\db\model\entity\EmailMessage';
    }

    protected function getFieldDefinitionList()
    {
        return array(
        'id'=>PDO::PARAM_INT,
        'listId'=>PDO::PARAM_INT,
        'sender'=>PDO::PARAM_STR,
        'replyAddress'=>PDO::PARAM_STR,
        'subject'=>PDO::PARAM_STR,
        'messageText'=>PDO::PARAM_STR,
        'contentType'=>PDO::PARAM_STR,
        'template'=>PDO::PARAM_STR,
        'sentCount'=>PDO::PARAM_INT,
        'recipientCount'=>PDO::PARAM_INT,
        'postedDate'=>PDO::PARAM_STR,
        'postedBy'=>PDO::PARAM_STR,
        'active'=>PDO::PARAM_STR);
    }

    public function queueMessage(EmailMessage $message,$toAddress,$toName) {
        $message->recipientCount = 1;
        $messageId = $this->insert($message);
        $sql = 'INSERT INTO qnut_email_queue (mailMessageId,personId,toAddress,toName) VALUES (?,?,?,?)';
        $stmt = $this->executeStatement($sql, [$messageId,0,$toAddress,$toName]);
        $count = $stmt->rowCount();
        if ($count == 0) {
            // no subscribers, roll back
            $this->delete($messageId);
            return 0;
        }
        $result = new \stdClass();
        $result->messageId = $messageId;
        $result->count = $count;
        return $result;
    }

    public function queueMessageList(EmailMessage $message) {
        /**
         * @var $list EmailList
         */
        $list = (new EmailListsRepository())->get($message->listId);
        if (empty($list)) {
            return -1;
        }
        $message->sender = $list->mailBox;
        $messageId = $this->insert($message);
        $sql =
            'INSERT INTO qnut_email_queue (mailMessageId,personId,toAddress,toName) '.
            "SELECT $messageId AS mailMessageId, s.personId,p.email,p.fullName ".
            'FROM qnut_email_subscriptions s JOIN qnut_persons p ON s.personId = p.id '.
            'WHERE s.listId = ?';

        $stmt = $this->executeStatement($sql, [$message->listId]);
        $count = $stmt->rowCount();
        if ($count == 0) {
            // no subscribers, roll back
            $this->delete($messageId);
            return 0;
        }
        $sql = 'UPDATE qnut_email_messages SET recipientCount = ? WHERE id = ?';
        $stmt = $this->executeStatement($sql,[$count,$messageId]);
        $result = new \stdClass();
        $result->messageId = $messageId;
        $result->count = $count;
        return $result;
    }

    /**
     * @return EmailMessage[]
     */
    public function getQueuedMessages() {
        $sql = 'SELECT DISTINCT m.* FROM qnut_email_queue q ' .
            'JOIN qnut_email_messages m ON m.id = q.mailMessageId ORDER BY m.listId';
        $stmt = $this->executeStatement($sql);
        $result = $stmt->fetchAll(PDO::FETCH_CLASS, $this->getClassName());
        return $result;
    }

    /**
     * @param int $sendLimit
     * @return EmailMessageRecipient[]
     */
    public function getMessageRecipients($sendLimit=0, $messageId=0) {
        $sql =
            'SELECT id, mailMessageId, personId, toAddress, toName '.
            'FROM qnut_email_queue';

        if ($messageId) {
            $sql .= ' WHERE mailMessageId = ?';
            $params = [$messageId];
        }
        else {
            $params = [];
        }

        if ($sendLimit) {
            $sql .= " LIMIT $sendLimit";
        }
        $stmt = $this->executeStatement($sql,$params);
        $result = $stmt->fetchAll(PDO::FETCH_CLASS,$this->getRecipientClassName());
        return $result;
    }

    public function setRecipientCount($messageId,$count) {
        $sql = 'UPDATE qnut_email_messages set recipientCount= ? WHERE id=?';
        $stmt = $this->executeStatement($sql,[$count,$messageId]);
        return $stmt->rowCount();
    }

    public function unqueue($queueId) {
        $sql = 'UPDATE qnut_email_messages m '.
            'JOIN qnut_email_queue q ON q.mailMessageId = m.id '.
            'SET m.recipientCount= m.recipientCount-1 '.
            'WHERE q.id = ?';
        $this->executeStatement($sql,[$queueId]);
        $sql = 'DELETE FROM qnut_email_queue WHERE id = ?';
        $stmt = $this->executeStatement($sql,[$queueId]);
        return $stmt->rowCount();

    }

    public function undateQueue($queueId) {
        $sql = 'UPDATE qnut_email_messages m '.
        'JOIN qnut_email_queue q ON q.mailMessageId = m.id '.
        'SET m.sentCount= m.sentCount+1 '.
        'WHERE q.id = ?';
        $this->executeStatement($sql,[$queueId]);
        $sql = 'DELETE FROM qnut_email_queue WHERE id = ?';
        $stmt = $this->executeStatement($sql,[$queueId]);
        return $stmt->rowCount();
    }
}