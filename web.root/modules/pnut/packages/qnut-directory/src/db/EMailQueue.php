<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 12/14/2017
 * Time: 2:01 AM
 */

namespace Peanut\QnutDirectory\db;


use Peanut\QnutDirectory\db\model\entity\EmailList;
use Peanut\QnutDirectory\db\model\entity\EmailMessage;
use Peanut\QnutDirectory\db\model\entity\EmailMessageRecipient;
use Peanut\QnutDirectory\db\model\repository\EmailListsRepository;
use Peanut\QnutDirectory\db\model\repository\EmailMessagesRepository;
use Peanut\QnutDirectory\sys\MailTemplateManager;
use Tops\mail\TEmailAddress;
use Tops\mail\TPostOffice;
use Tops\services\MessageType;
use Tops\services\TProcessManager;
use Tops\sys\IUser;
use Tops\sys\TConfiguration;
use Tops\sys\TDates;
use Tops\sys\TTemplateManager;
use Tops\sys\TWebSite;

class EMailQueue
{
    const processCode = 'email-queue-send';

    private static $messagesRepository;
    public static function getMessagesRepository(){
        if (!isset(self::$messagesRepository)) {
            self::$messagesRepository = new EmailMessagesRepository();
        }
        return self::$messagesRepository;
    }

    /**
     * @var TProcessManager
     */
    private $process;
    public static function QueueMessageList($messageDto, $username, array $recipients=null) {
        $message = EmailMessage::Create($messageDto, $username);
        return (self::getMessagesRepository())->queueMessageList($message,$recipients);
    }

    public static function QueueSingleMessage($messageDto, $toAddress, $toName, $username,$instance=null) {
        $message = EmailMessage::Create($messageDto, $username);
        return (self::getMessagesRepository())->queueMessage($message,$toAddress,$toName);
    }

    public static function SendTestMessage($messageDto, IUser $user,$instance=null) {
        if ($instance === null) {
            $instance = new EMailQueue();
        }
        $recipient = new EmailMessageRecipient();
        $recipient->id = $user->getId();
        $recipient->toName = $user->getDisplayName();
        $recipient->toAddress = $user->getEmail();
        $message = EmailMessage::Create($messageDto,$user->getUserName());
        return $instance->sendMessage($recipient,$message);
    }

    public static function Send($messageId,$instance = null) {
        if ($instance === null) {
            $instance = new EMailQueue();
        }
        return $instance->sendMessages(0,$messageId);
    }

    public static function ProcessMessageQueue() {
        $instance = new EMailQueue();
        $sendLimit = TConfiguration::getValue('sendlimit', 'mail', 0);
        return $instance->sendMessages($sendLimit);
    }

    public static function Pause($reason='interrupt message processsing',$interval='1 hour') {
        $process = TProcessManager::Get(self::processCode);
        if ($process !== false) {
            $paused = $process->pauseProcess($reason,$interval);
            if ($paused) {
                return TDates::reformatDateTime($paused,'g:i:s A');
            }
        }
        return false;
    }

    public static function Restart()
    {
        $process = TProcessManager::Get(self::processCode);
        if ($process !== false) {
            return $process->startProcess();
        }
        return false;
    }

    public static function isPaused($format='g:i:s A') {
        $process = TProcessManager::Get(self::processCode);
        if ($process !== false) {
            $paused = $process->isPaused();
            if ($paused !== false) {
               return TDates::reformatDateTime($paused,$format);
            }
        }
        return false;
    }

     /**
     * @var EmailMessage[];
     */
    private $messages;
    private function getMessage($id)
    {
        foreach ($this->messages as $message) {
            if ($message->id === $id)
                return $message;
        }
        return false;
    }

    private function startProcess() {
        $this->process = TProcessManager::CreateProcess(self::processCode,'Send email','Process outgoing email in queue');
    }

    private function log($message,$messageType=MessageType::Info, $event='process mail',$detail=null)
    {
        if (isset($this->process)) {
            $this->process->log($event,$message,$messageType,$detail);
        }
    }
    
    private function logError($message,$event='mail process error',$detail=null) {
        if (isset($this->process)) {
            $this->process->logError($event,$message,$detail);
        }
    }

    private function logWarning($message,$event='mail process warning',$detail=null) {
        if (isset($this->process)) {
            $this->process->logWarning($event,$message,$detail);
        }
    }

    /**
     * @var string[]
     */
    private $templates=[];
    private function getTemplateContent($template)
    {
        if (!array_key_exists($template, $this->templates)) {
            $templateContent = (new MailTemplateManager())->getTemplateContent($template);
            if (empty($templateContent)) {
                $this->logError("No template content found for '$template'");
            }
            $this->templates[$template] = $templateContent;
         }
        return $this->templates[$template];
    }

    public function mergeContent(EmailMessageRecipient $recipient, $messageText,$template='',$listId=0) {
        if (!empty($template)) {
            $template = $this->getTemplateContent($template);
            if (empty($template)) {
                return 0;
            }
            $messageText = TTemplateManager::ReplaceContentTokens($template, ['content' => $messageText]);
        }

        $messageText = TTemplateManager::ReplaceContentTokens($messageText, [
            'personId' => $recipient->personId,
            'listId' => $listId,
            'recipientName' => $recipient->toName,
            'siteUrl' => $this->getSiteUrl(),
            'unsubscribe-url' => $this->getUnsubscribeUrl()
        ]);
        return $messageText;
    }

    /**
     * @var array EmailList[]
     */
    private $lists = [];
    private function  getList($listId) {
        if ($listId > 0) {
            if (!isset($this->lists)) {
                $this->lists = (new EmailListsRepository())->getAll(true);
            }
            /**
             * @var $list EmailList
             */
            foreach ($this->lists as $list) {
                if ($list->id == $listId) {
                    return $list;
                }
            }
        }
        return false;
    }



    public function sendMessage(EmailMessageRecipient $recipient, EmailMessage $message,$logging = true)
    {
        $to = TEmailAddress::Create($recipient->toAddress, $recipient->toName);
        if (empty($to)) {
            $this->logWarning("Invalid email address, $recipient->toAddress");
            return 0;
        }
        $messageText = $this->mergeContent($recipient, $message->messageText,
            empty($message->template) ? '' : $message->template, $message->listId);

        $alias = null;
        if ($message->listId) {
            $list = $this->getList($message->listId);
            if ($list !== false) {
                $alias = $list->name;
            }
        }

        $sendResult = TPostOffice::SendMessage(
            $to,
            $message->sender,
            $alias,
            $message->subject,
            $messageText,
            $message->contentType,
            $message->replyAddress
        );

        if ($sendResult === false) {
            $this->log("Mail server failed to send. Recipient id: $recipient->id, Message id: $message->id");
            return -1; // try again later.
        }
        return 1;
    }

    /**
     * @param EmailMessageRecipient $recipient
     * @return int  0 = error; 1 = sent; -1 = retry
     */
    public function sendQueuedMessage(EmailMessageRecipient $recipient)
    {
        $message = $this->getMessage($recipient->mailMessageId);
        if (empty($message)) {
            $this->log("Mail message #$recipient->mailMessageId not found");
            return 0;
        }
        return $this->sendMessage($recipient,$message);
    }

    public function sendMessages($sendLimit = 0, $messageId=0)
    {
        $sendCount = 0;
        $this->startProcess();
        try {
            $this->log("Sending ".
                ($sendLimit ? $sendLimit : 'all').
                " messages for message #$messageId");
            $repository = self::getMessagesRepository();
            if ($messageId) {
                $message = $repository->get($messageId);
                $this->messages = [$message];
            } else {
                $this->messages = $repository->getQueuedMessages();
            }
            $recipients = $repository->getMessageRecipients($sendLimit, $messageId);
            foreach ($recipients as $recipient) {
                if ($this->process->isPaused()) {
                    break;
                }
                $result = $this->sendQueuedMessage($recipient);
                switch ($result) {
                    case 1:
                        $repository->undateQueue($recipient->id);
                        $sendCount++;
                        break;
                    case 0:
                        $repository->unqueue($recipient->id);
                        break;
                    // case -1: ignore and leave for next round.
                }
            }
            $this->log("Sent $sendCount messages for message #$messageId");
        }
        catch (\Exception $ex) {
            $this->process->logException($ex);
        }
        return $sendCount;
    }

    private $siteUrl;
    private function getSiteUrl()
    {
        if (!isset($this->siteUrl)) {
            $this->siteUrl = TWebSite::GetSiteUrl();
        }
        return $this->siteUrl;
    }

    private $unsubscribeUrl;
    private function getUnsubscribeUrl()
    {
        if (!isset($this->unsubscribeUrl)) {
            $url = TConfiguration::getValue('unsubscribeUrl','mail','/unsubscribe');
            if (strpos($url,'/') === 0) {
                $url = $this->getSiteUrl().$url;
            }
            else {
                $lower = strtolower($url);
                if (substr($lower,1,5) !== 'http:' && substr($lower,1,6) !== 'https') {
                    $url = $this->getSiteUrl().'/'.$url;
                }
            }
            $this->unsubscribeUrl = $url;
        }
        return $this->unsubscribeUrl;
    }

    public static function GetStatus()
    {
        $response = new \stdClass();
        $isPaused = EMailQueue::isPaused();
        if ($isPaused) {
            $response->status = 'paused';
            $response->pausedUntil = $isPaused;
        }
        else {
            $response->status = self::GetActiveStatus();
            $response->pausedUntil  = '';
        }
        return $response;
    }

    public static function GetActiveStatus() {
        $activeCount = (self::getMessagesRepository())->getActiveMessageCount();
        return $activeCount ? 'active' : 'ready';
    }

    public static function GetMessageHistory() {
        return (self::getMessagesRepository())->getMessageHistory();
    }

    public static function RemoveMessage($messageId)
    {
        (self::getMessagesRepository())->removeMessage($messageId);
    }

}