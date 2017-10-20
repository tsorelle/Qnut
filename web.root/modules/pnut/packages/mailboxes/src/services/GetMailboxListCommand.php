<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 10/20/2017
 * Time: 7:03 AM
 */

namespace Peanut\Mailboxes\services;


use Tops\mail\TMailbox;
use Tops\mail\TPostOffice;
use Tops\services\TServiceCommand;

class GetMailboxListCommand extends TServiceCommand
{
    protected function run()
    {
        $manager = TPostOffice::GetMailboxManager();
        $result = $manager->getMailboxes(true);
        $this->setReturnValue($result);
    }
}