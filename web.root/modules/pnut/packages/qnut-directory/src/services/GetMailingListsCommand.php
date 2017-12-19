<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 12/11/2017
 * Time: 4:57 AM
 */

namespace Peanut\QnutDirectory\services;

use Peanut\QnutDirectory\db\DirectoryManager;
use Peanut\QnutDirectory\db\model\repository\EmailListsRepository;
use Peanut\QnutDirectory\sys\MailTemplateManager;
use Tops\services\TServiceCommand;
use Tops\sys\TLanguage;

/**
 * Class GetMailingLists
 * @package Peanut\QnutDirectory\services
 *
 * Service contract
 *      Request: none
 *      Response:
 *          interface IGetMailingListsResponse {
 *              emailLists : Peanut.ILookupItem[];
 *              translations : string[string];
 *              templates : string[string][string]
 *          }
 */
class GetMailingListsCommand extends TServiceCommand
{

    protected function run()
    {
        $result = new \stdClass();
        // $manager = new DirectoryManager($this->getMessages());
        // $result->emailLists = $manager->getEmailListLookup();
        $result->emailLists = (new EmailListsRepository())->getLookupList();
        $result->translations = TLanguage::getTranslations([
            'confirm-caption',
            'dir-label-email-queue',
            'dir-label-please-select',
            'dir-label-posted',
            'dir-label-queue-processing',
            'dir-label-sender',
            'label-active',
            'label-cancel',
            'label-count',
            'label-code',
            'label-edit',
            'label-mailbox',
            'label-message',
            'label-name',
            'label-of',
            'label-refresh',
            'label-remove',
            'label-save',
            'label-status',
            'label-subject',
            'label-until',
            'label-update',
            'mail-header-select',
            'mail-header-send',
            'mailing-confirm-resend',
            'mailing-confirm-send',
            'mailing-heading-lists',
            'mailing-control-heading',
            'mailing-history-heading',
            'mailing-label-format',
            'mailing-label-list',
            'mailing-message-template',
            'mailing-no-template',
            'mailing-send-mailing',
            'mailing-show-html',
            'mailing-show-text',
            'mailing-test-template',
            'process-command-continue',
            'process-command-pause',
            'process-status-active',
            'process-status-paused',
            'process-status-ready'
            ]);


        $result->templates = (new MailTemplateManager)->getTemplateFileList();

        $this->setReturnValue($result);
    }
}