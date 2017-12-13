<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 12/11/2017
 * Time: 4:57 AM
 */

namespace Peanut\QnutDirectory\services;

use Peanut\QnutDirectory\db\DirectoryManager;
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
        $manager = new DirectoryManager($this->getMessages());
        $result->emailLists = $manager->getEmailListLookup();
        $result->translations = TLanguage::getTranslations([
            'confirm-caption',
            'dir-label-please-select',
            'label-subject',
            'label-message',
            'mail-header-send',
            'mail-header-select',
            'mailing-send-mailing',
            'mailing-label-format',
            'mailing-label-list',
            'mailing-message-template',
            'mailing-test-template',
            'mailing-show-html',
            'mailing-show-text',
            'mailing-no-template',
            'mailing-confirm-send',
            'mailing-confirm-resend'
            ]);


        $result->templates = (new MailTemplateManager)->getTemplateFileList();

        $this->setReturnValue($result);
    }
}