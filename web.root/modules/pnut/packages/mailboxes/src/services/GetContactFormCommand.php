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
use Tops\sys\TLanguage;

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
            $mailbox = TPostOffice::GetMailbox($mailboxCode);
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

        $response->translations = TLanguage::getTranslations(array(
            'mail-select-recipient',
            'mail-select-recipient-caption',
            'mail-header-send',
            'mail-header-select',
            'mail-error-recipient',
            'mail-thanks-message',
            'label-your-name',
            'label-your-email',
            'label-subject',
            'label-message',
            'form-error-your-name-blank',
            'form-error-your-email-blank',
            'form-error-email-blank',
            'form-error-email-subject-blank',
            'form-error-email-message-blank',
            'form-error-email-invalid',
            'wait-sending-message'
        ));

        $this->setReturnValue($response);
    }
}