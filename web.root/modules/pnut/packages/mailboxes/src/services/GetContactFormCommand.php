<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 10/23/2017
 * Time: 8:38 AM
 */

namespace Peanut\Mailboxes\services;


use Peanut\sys\TVmContext;
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

    private function getMailbox() {
        $request = $this->getRequest();
        if (isset($request->context)) {
            $context = TVmContext::GetContext($request->context);
            if (!empty($context->value)) {
                return $context->value;
            }
        }
        return  isset($request->mailbox) ? $request->mailbox : false;
    }

    private function filterMailboxList($mailboxes,$code) {
        foreach ($mailboxes as $mailbox) {
            if ($mailbox->mailboxcode == $code) {
                return [$mailbox];
            }
        }
        return false;
    }

    protected function run()
    {
        $response = new \stdClass();
        $mailboxCode =  $this->getMailbox();
        if (empty($mailboxCode)) {
            $this->addErrorMessage('No mailbox code received.');
            return;
        }
        $manager = TPostOffice::GetMailboxManager();
        $mailboxes = $manager->getMailboxes();
        if ($mailboxCode == 'all') {
            $response->mailboxName = '';
            $response->mailboxList = $mailboxes;
        }
        else {
            $response->mailboxList = $this->filterMailboxList($mailboxes,$mailboxCode);
            if ($response->mailboxList === false) {
                $this->addErrorMessage("Mailbox code '$mailboxCode' not found.");
                return;
            }
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