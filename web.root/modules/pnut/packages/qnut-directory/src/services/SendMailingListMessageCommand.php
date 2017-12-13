<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 12/11/2017
 * Time: 4:59 AM
 */

namespace Peanut\QnutDirectory\services;


use Tops\services\TServiceCommand;
use Tops\sys\TPermission;
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
 *        body: string;
 *        template: string;
 *      }
 */
class SendMailingListMessageCommand extends TServiceCommand
{
    public function __construct()
    {
        $this->addAuthorization(TPermissionsManager::sendMailingsPermissionName);
    }

    private function sendTestMessage() {
        $email = $this->getUser()->getEmail();
        // todo: complete implementation
        $this->addInfoMessage('Test message send to '.$email);
    }

    private function sendToMessageList($listId) {
        $messageCount = 0;

        // todo: complete implementation
        $this->addInfoMessage(
            ($messageCount == 1 ? 'One message' : "$messageCount messages").' submitted for delivery'
        );
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
        if (empty($request->body)){
            $this->addErrorMessage('Error no body');
            return;
        }

        if (empty($request->listId)) {
            $this->sendTestMessage();
        }
        else {
            $this->sendToMessageList($request->listId);
        }

    }
}