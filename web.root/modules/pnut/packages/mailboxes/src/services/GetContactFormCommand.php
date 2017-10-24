<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 10/23/2017
 * Time: 8:38 AM
 */

namespace Peanut\Mailboxes\services;


use Tops\mail\TPostOffice;
use Tops\services\TServiceCommand;

/**
 * Class GetMailboxCommand
 * @package Peanut\Mailboxes\services
 * 
 * Request  mailboxCode : string
 * Response
 * export interface IGetContactFormResponse {
 *     mailboxCode: string;
 *     mailboxList: IMailBox[];
 *     mailboxName: string;
 *     fromName: string;
 *     fromAddress: string;
 *  }
 */

class GetContactFormCommand extends TServiceCommand
{

    protected function run()
    {
        $response = new \stdClass();
        $mailboxCode = $this->getRequest();
        if (empty($mailboxCode)) {
            $this->addErrorMessage('No mailbox code received.');
            return;
        }
        if ($mailboxCode == 'all') {
            $response->mailboxName = '';
            $manager = TPostOffice::GetMailboxManager();
            $response->mailboxList = $manager->getMailboxes();
        }
        else {
            $response->mailboxList = array();
            $mailbox = TPostOffice::GetMailboxAddress($mailboxCode);
            if (empty($mailbox)) {
                $this->addErrorMessage("Mailbox code '$mailboxCode' not found.");
                return;
            }
            $response->mailboxName = $mailbox->getName();
        }

        $user = $this->getUser();
        if ($user->isAuthenticated()) {
            $response->fromName = $user->getDisplayName();
            $response->fromAddress = $user->getEmail();
        }
        else {
            $response->fromName = '';
            $response->fromAddress = '';
        }

        $this->setReturnValue($response);
    }
}