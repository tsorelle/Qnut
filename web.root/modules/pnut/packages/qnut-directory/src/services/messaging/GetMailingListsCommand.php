<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 12/11/2017
 * Time: 4:57 AM
 */

namespace Peanut\QnutDirectory\services\messaging;

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
            'add-new',
            'confirm-caption',
            'dir-label-email-queue',
            'dir-label-please-select',
            'dir-label-posted',
            'dir-label-queue-processing',
            'dir-label-sender',
            'form-error-email-invalid',
            'form-error-name-blank',
            'label-active',
            'label-add',
            'label-address',
            'label-cancel',
            'label-code',
            'label-count',
            'label-delete',
            'label-description',
            'label-edit',
            'label-email',
            'label-mailbox',
            'label-message',
            'label-name',
            'label-new',
            'label-of',
            'label-public',
            'label-refresh',
            'label-remove',
            'label-save',
            'label-save-changes',
            'label-status',
            'label-subject',
            'label-until',
            'label-update',
            'label-yes',
            'mail-header-select',
            'mail-header-send',
            'mailbox-entity',
            'mailbox-entity-plural',
            'mailbox-error-code-blank',
            'mailbox-error-description',
            'mailbox-error-email-name',
            'mailbox-label-add-new',
            'mailbox-label-delete',
            'mailbox-label-public',
            'mailing-confirm-resend',
            'mailing-confirm-send',
            'mailing-control-heading',
            'mailing-heading-lists',
            'mailing-get-history',
            'mailing-history-heading',
            'mailing-label-format',
            'mailing-label-list',
            'mailing-list-entity',
            'mailing-message-template',
            'mailing-no-template',
            'mailing-send-mailing',
            'mailing-show-html',
            'mailing-show-text',
            'mailing-test-template',
            'process-command-continue',
            'process-command-pause',
            'status-active',
            'process-status-paused',
            'process-status-ready',
            'mailing-message-entity',
            'mailing-remove-queue',
            'mailing-remove-header'

        ]);

        $result->templates = (new MailTemplateManager)->getTemplateFileList();

        $this->setReturnValue($result);
    }
}