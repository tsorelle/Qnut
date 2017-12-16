<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 12/11/2017
 * Time: 4:59 AM
 */

namespace Peanut\QnutDirectory\services;


use Peanut\QnutDirectory\db\EMailQueue;
use Tops\services\TServiceCommand;
use Tops\sys\TConfiguration;
use Tops\sys\TPermissionsManager;

/**
 * Class SendMailingListMessage
 * @package Peanut\QnutDirectory\services
 *
 * Service contract
 *    Request
 *      interface IEMailListSendRequest {
 *        listId: any;
 *        subject: string;
 *        messageText: string;
 *        contentType: string,
 *        template: string;
 *      }
 */
class SendMailingListMessageCommand extends TServiceCommand
{
    public function __construct()
    {
        $this->addAuthorization(TPermissionsManager::sendMailingsPermissionName);
    }

    private function sendTestMessage($request) {
        $email = $this->getUser()->getEmail();
        if (empty($email)) {
            $this->addErrorMessage("Cannot send test message. No email found");
            return;
        }
        $count = EMailQueue::SendTestMessage($request,$this->getUser());
        if ($count == 0) {
            $this->addErrorMessage("Failed to send test message to $email");
        }
        else {
            $this->addInfoMessage('Test message send to '.$email);
        }
    }

    protected function run()
    {
        $request = $this->getRequest();
        if (empty($request)) {
            $this->addErrorMessage('service-no-request');
            return;
        }
        if (empty($request->subject)) {
            $this->addErrorMessage('Error, no subject');
            return;
        }
        if (empty($request->messageText)) {
            $this->addErrorMessage('Error no body');
            return;
        }

        if (empty($request->listId)) {
            $this->sendTestMessage($request);
        }
        else {
            $queue = new EMailQueue();
            $queueResult = EMailQueue::QueueMessageList($request, $this->getUser()->getUserName(),$queue);
            $queueMailings = TConfiguration::getBoolean('queuemailings', 'mail', true);
            if ($queueMailings) {
                $count = $queueResult->count;
                $action = 'submitted to message queue';
            } else {
                $count = EMailQueue::Send($queueResult->messageId,$queue);
                $action = 'sent';
            }
            $plural = $count > 1 ? 's were' : ' was';
            $this->addInfoMessage("$count message$plural $action");
        }
    }
}