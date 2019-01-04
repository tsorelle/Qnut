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
use Tops\sys\TPermissionsManager;

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
    public function __construct()
    {
        $this->addAuthorization(TPermissionsManager::mailAdminPermissionName);
    }

    protected function run()
    {
        $manager = TPostOffice::GetMailboxManager();
        $mailBox = $this->getRequest();
        $public = empty($mailBox->public) ? 0 : 1;

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
                $mailBox->description,
                $public
            );
        }
        else {
            $current->setDescription($mailBox->description);
            $current->setMailboxCode($mailBox->mailboxcode);
            $current->setName($mailBox->displaytext);
            $current->setEmail($mailBox->address);
            $current->setPublic($public);
            $current->setUpdateTime($this->getUser()->getUserName());

            $manager->updateMailbox($current);
        }

        $result = $manager->getMailboxes(true);
        $this->setReturnValue($result);

    }
}