<?php
namespace Peanut\QnutCommittees\services;

use Peanut\QnutCommittees\CommitteeManager;
use Tops\services\TServiceCommand;
use Tops\sys\TLanguage;

/**
 * Class GetCommitteeListCommand
 * @package Peanut\QnutCommittees\services
 *
 * Contract - response:
 *     interface IGetCommitteeListResponse {
 *          list: ICommitteeListItem[],
 *              {
 *                  Name: string;
 *                  Value: any;
 *                  active: any;
 *              }
 *          canEdit: boolean;
 *          translations: string[];
 *     }
 */
class GetCommitteeListCommand extends TServiceCommand
{
    protected function run()
    {
        $user = $this->getUser();
        if (!$user->isAuthenticated()) {
            $this->AddErrorMessage('page-error-not-authenticated-message');
            $this->SetReturnValue(array());
            return;
        }
        $manager = new CommitteeManager();
        $result = new \stdClass();

        // todo: get person url
        // todo: get help url

        $result->list = $manager->getCommitteeList();
        $result->canEdit = $user->isAuthorized(CommitteeManager::manageCommitteesPermission);
        $result->translations = TLanguage::getTranslations([
            'committee-description-error',
            'committee-entity',
            'committee-entity-plural',
            'committee-label-add-member',
            'committee-label-adhoc',
            'committee-label-current-members',
            'committee-label-emails',
            'committee-label-end-service',
            'committee-label-inactive',
            'committee-label-liaison-appointment',
            'committee-label-nominations',
            'committee-label-phones',
            'committee-label-relieved-service',
            'committee-label-report-options',
            'committee-label-role',
            'committee-label-send-email',
            'committee-label-show-in-directory',
            'committee-label-show-report',
            'committee-label-start-service',
            'committee-label-term',
            'committee-membership-required',
            'committee-membership-required-verbose',
            'committee-name-error',
            'committee-start-date-error',
            'committee-type-liaison',
            'committee-type-standing',
            'committees-add-committee',
            'committees-show-inactive',
            'committees-show-report',
            'form-error-message',
            'label-active',
            'label-cancel',
            'label-close',
            'label-description',
            'label-edit',
            'label-email',
            'label-error',
            'label-full-description',
            'label-help',
            'label-name',
            'label-notes',
            'label-phone',
            'label-save',
            'label-save-changes',
            'label-short-description',
            'label-status',
            'mailbox-entity',
            ]);

            $this->setReturnValue($result);
    }
}