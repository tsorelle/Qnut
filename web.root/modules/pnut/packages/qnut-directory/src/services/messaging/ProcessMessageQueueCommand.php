<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 12/26/2017
 * Time: 4:25 AM
 */

namespace Peanut\QnutDirectory\services\messaging;


use Peanut\QnutDirectory\db\EMailQueue;
use Tops\services\TServiceCommand;

class ProcessMessageQueueCommand extends TServiceCommand
{

    protected function run()
    {
        if (!$this->getUser()->isAdmin()) {
            $this->addErrorMessage('Administrator permissions are required to run this service.');
            return;
        }
        $count = EMailQueue::ProcessMessageQueue();
        $this->addInfoMessage("Sent $count messages.");
    }
}