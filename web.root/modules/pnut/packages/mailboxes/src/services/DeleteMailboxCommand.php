<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 10/20/2017
 * Time: 5:32 PM
 */

namespace Peanut\Mailboxes\services;


use Tops\mail\TPostOffice;
use Tops\services\TServiceCommand;
use Tops\sys\TPermissionsManager;

class DeleteMailboxCommand extends TServiceCommand
{

    public function __construct()
    {
        $this->addAuthorization(TPermissionsManager::mailAdminPermissionName);
    }

    protected function run()
    {
        $code = $this->getRequest();
        if ($code === 'two-quakers-support') {
            $this->addErrorMessage("Deletion of this mailbox is not allowed.");
        }
        $manager = TPostOffice::GetMailboxManager();
        $mailbox = $manager->findByCode($code);
        if (!empty($mailbox)) {
            $manager->drop($mailbox->getMailboxId());
        }
        $list = $manager->getMailboxes(true);
        $this->setReturnValue($list);
    }
}