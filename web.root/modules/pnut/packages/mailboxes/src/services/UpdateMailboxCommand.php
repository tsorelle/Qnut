<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 10/20/2017
 * Time: 7:44 AM
 */

namespace Peanut\Mailboxes\services;


use Tops\mail\TMailbox;
use Tops\mail\TPostOffice;
use Tops\services\TServiceCommand;

/**
 * Class UpdateMailboxCommand
 * @package Peanut\Mailboxes\services
 *
 * Request:
 * export interface IMailBox {
 *    id:string;
 *    displaytext:string;
 *    description:string;
 *    mailboxcode:string ;
 *    address:string;
 *    state:number;
 * }
 */
class UpdateMailboxCommand extends TServiceCommand
{

    protected function run()
    {
        $manager = TPostOffice::GetMailboxManager();
        $mailBox = $this->getRequest();
        /**
         * @var $current TMailbox
         */
        $current = $manager->findByCode($mailBox->mailboxcode);
        $new = empty($current);
        if ($new) {
            $manager->addMailbox(
                $mailBox->mailboxcode,
                $mailBox->displaytext,
                $mailBox->address,
                $mailBox->description
            );
        }
        else {
            $current->setDescription($mailBox->description);
            $current->setMailboxCode($mailBox->mailboxcode);
            $current->setName($mailBox->displaytext);
            $current->setEmail($mailBox->address);
            $current->setUpdateTime($this->getUser()->getUserName());

            $manager->updateMailbox($current);
        }

        $result = $manager->getMailboxes(true);
        $this->setReturnValue($result);

    }
}