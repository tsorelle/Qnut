<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 12/14/2017
 * Time: 2:01 AM
 */

namespace Peanut\QnutDirectory\db;


use Peanut\QnutDirectory\db\model\entity\EmailMessage;
use Peanut\QnutDirectory\db\model\entity\EmailMessageRecipient;
use Peanut\QnutDirectory\db\model\repository\EmailMessagesRepository;
use Peanut\QnutDirectory\sys\MailTemplateManager;
use Tops\mail\TEmailAddress;
use Tops\mail\TPostOffice;
use Tops\sys\IUser;
use Tops\sys\TConfiguration;
use Tops\sys\TTemplateManager;
use Tops\sys\TWebSite;

class EMailQueue
{
    public static function QueueMessageList($messageDto, $username) {
        $repository =  new EmailMessagesRepository();
        $message = EmailMessage::Create($messageDto, $username);
        return $repository->queueMessageList($message);
    }

    public static function QueueSingleMessage($messageDto, $toAddress, $toName, $username) {
        $repository =  new EmailMessagesRepository();
        $message = EmailMessage::Create($messageDto, $username);
        return $repository->queueMessage($message,$toAddress,$toName);
    }

    public static function SendTestMessage($messageDto, IUser $user) {
        $recipient = new EmailMessageRecipient();
        $recipient->id = $user->getId();
        $recipient->toName = $user->getDisplayName();
        $recipient->toAddress = $user->getEmail();
        $message = EmailMessage::Create($messageDto,$user->getUserName());
        $instance = new EMailQueue();
        return $instance->sendMessage($recipient,$message);
    }

    public static function Send($messageId) {
        $instance = new EMailQueue();
        return $instance->sendMessages(0,$messageId);
    }

    public static function ProcessMessageQueue() {
        $instance = new EMailQueue();
        $sendLimit = TConfiguration::getValue('sendlimit', 'mail', 0);
        return $instance->sendMessages($sendLimit);
    }

    /**
     * @var EmailMessagesRepository
     */
    private $messagesRepository;

    /**
     * @return EmailMessagesRepository
     */
    private function getMessagesRepository()
    {
        if (!isset($this->messagesRepository)) {
            $this->messagesRepository = new EmailMessagesRepository();
        }
        return $this->messagesRepository;
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

    private function log($message)
    {
        // todo: implement log
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
                $this->log("No template content found for '$template'");
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

    public function sendMessage(EmailMessageRecipient $recipient, EmailMessage $message,$logging = true)
    {
        $to = TEmailAddress::Create($recipient->toAddress, $recipient->toName);
        if (empty($to)) {
            $this->log("Invalid email address, $recipient->toAddress");
            return 0;
        }
        $messageText = $this->mergeContent($recipient, $message->messageText,
            empty($message->template) ? '' : $message->template, $message->listId);

        $sendResult = TPostOffice::SendMessage(
            $to,
            $message->sender,
            $message->subject,
            $messageText,
            $message->contentType,
            $message->replyAddress
        );

        if ($sendResult === false) {
            if ($logging) {
                $this->log("Mail server failed to send. Recipient id: $recipient->id, Message id: $message->id");
            }
            return -1; // try again later.
        }
        $sendResult = TPostOffice::SendMessage(
            $to,
            $message->sender,
            $message->subject,
            $messageText,
            $message->contentType,
            $message->replyAddress
        );

        if ($sendResult === false) {
            if ($logging) {
                $this->log("Mail server failed to send. Recipient id: $recipient->id, Message id: $message->id");
            }
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
        $repository = $this->getMessagesRepository();
        if ($messageId) {
            $message = $repository->get($messageId);
            $this->messages = [$message];
        }
        else {
            $this->messages = $repository->getQueuedMessages();
        }
        $recipients = $repository->getMessageRecipients($sendLimit,$messageId);
        foreach ($recipients as $recipient) {
            $result = $this->sendQueuedMessage($recipient);
            switch($result) {
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
}