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
use Tops\sys\TLanguage;
use Tops\sys\TPermissionsManager;

/**
 * Get mailbox list and translations for Mailboxes admin form
 *
 * Class GetMailboxListCommand
 * @package Peanut\Mailboxes\services
 *
 * Response:
 *     export interface IGetMailboxesResponse {
 *          list: IMailBox[];
 *          translations: string[];
 *     }
 *     export interface IMailBox {
 *       id:string;
 *       displaytext:string;
 *       description:string;
 *       mailboxcode:string ;
 *       address:string;
 *       'public': any;
 *       active: any
 *    }
 */
class GetMailboxListCommand extends TServiceCommand
{
    protected function run()
    {
        $request = $this->getRequest();
        $allBoxes = empty($request) ? true : $request->filter == 'all';
        if ($allBoxes) {
            $allBoxes = $this->getUser()->isAuthorized(TPermissionsManager::mailAdminPermissionName);
        }
        $manager = TPostOffice::GetMailboxManager();
        $response = new \stdClass();
        $response->list = $manager->getMailboxes(true);
        $response->translations = TLanguage::getTranslations(
          array(
              'form-error-email-invalid',
              'label-address',
              'label-cancel',
              'label-cancel',
              'label-code',
              'label-delete',
              'label-description',
              'label-edit',
              'label-email',
              'label-mailbox',
              'label-name',
              'label-public',
              'label-save-changes',
              'label-yes',
              'mailbox-error-code-blank',
              'mailbox-error-description',
              'mailbox-error-email-name',
              'mailbox-label-delete',
              'mailbox-label-public',
              'mailbox-entity',
              'mailbox-entity-plural'
          )
        );
        $this->setReturnValue($response);
    }
}