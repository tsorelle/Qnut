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
use Tops\sys\TPermissionsManager;

class GetMailboxListCommand extends TServiceCommand
{
    protected function run()
    {
        $request = $this->getRequest();
        $allBoxes = empty($request) ? true : $request->filter == 'all';
        if ($allBoxes) {
            $allBoxes = $this->getUser()->isAuthorized(TPermissionsManager::managePermissionsPermissionName);
        }
        $manager = TPostOffice::GetMailboxManager();
        $result = $manager->getMailboxes($allBoxes);
        $this->setReturnValue($result);
    }
}