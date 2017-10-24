<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 10/23/2017
 * Time: 7:22 AM
 */

namespace Peanut\Mailboxes\services;


use Tops\mail\TPostOffice;
use Tops\services\TServiceCommand;

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
        $recipientAddress = "$message->fromName <$message->fromAddress>";
        TPostOffice::SendMessageToUs($recipientAddress,$message->subject,$message->body,$message->mailboxCode);
        $this->addInfoMessage('Message was sent');
    }
}