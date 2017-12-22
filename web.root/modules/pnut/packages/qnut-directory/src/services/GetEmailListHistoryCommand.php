<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 12/21/2017
 * Time: 3:01 PM
 */

namespace Peanut\QnutDirectory\services;


use Peanut\QnutDirectory\db\EMailQueue;
use Peanut\QnutDirectory\db\model\repository\EmailMessagesRepository;
use Tops\db\model\repository\ProcessesRepository;
use Tops\services\TProcessManager;
use Tops\services\TServiceCommand;
use Tops\sys\TDates;
use Tops\sys\TPermissionsManager;

/**
 * Class GetEmailListHistoryCommand
 * @package Peanut\QnutDirectory\services
 *
 * Service Contract
 *      Request: none
 *      Response:
 *         interface IGetMessageHistoryResponse {
 *             status: string;
 *             pausedUntil: string;
 *             items: IMessageHistoryItem[];
 *         }
 *
 *         interface IMessageHistoryItem {
 *             messageId: any;
 *             timeSent: string;
 *             listName: string;
 *             recipientCount: number;
 *             sentCount: number;
 *             sender: string;
 *             subject: string;
 *             active: boolean;
 *         }
 */
class GetEmailListHistoryCommand extends TServiceCommand
{
    public function __construct()
    {
        $this->addAuthorization(TPermissionsManager::mailAdminPermissionName);
    }

    protected function run()
    {
        $repository = new EmailMessagesRepository();
        $response = new \stdClass();
        $response->items = $repository->getMessageHistory();
        $isPaused = EMailQueue::isPaused();
        if ($isPaused) {
            $response->status = 'paused';
            $response->pausedUntil = $isPaused;
        }
        else {
            $response->status = EMailQueue::GetActiveStatus();
            $response->pausedUntil  = '';
        }
        $this->setReturnValue($response);
    }
}