<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 10/23/2017
 * Time: 7:22 AM
 */

namespace Peanut\Mailboxes\services;


use Tops\db\model\repository\MailboxesRepository;
use Tops\mail\TPostOffice;
use Tops\services\TServiceCommand;
use Tops\sys\TLanguage;

/**
 * Class SendContactMessageCommand
 * @package Peanut\Mailboxes\services
 *
 * reguest:
 *     export interface IMailMessage {
 *         mailboxCode: string;
 *         fromName : string;
 *         fromAddress : string;
 *         subject : string;
 *         body : string;
 *      }
 */
class SendContactMessageCommand extends TServiceCommand
{

    protected function run()
    {
        $message = $this->getRequest();

        $sender = TPostOffice::GetMailboxAddress('contact-form');
        if ($sender === false ) {
            $this->addErrorMessage('Contact form address not found.');
        }

        $fromAddress = "$message->fromName <$message->fromAddress>";
        $header = TLanguage::text('mailbox-contact-header');
        $body = $header."\n".
            "$fromAddress\n\n"."---------------"."\n$message->body";

        TPostOffice::SendMessageToUs($fromAddress,$message->subject,$body,'contact-form',$message->mailboxCode);
        $this->addInfoMessage("mailbox--message-sent");
    }
}