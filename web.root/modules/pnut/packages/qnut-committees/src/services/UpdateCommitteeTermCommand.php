<?php

namespace Peanut\QnutCommittees\services;

use Peanut\QnutCommittees\CommitteeManager;
use Peanut\QnutCommittees\db\model\entity\CommitteeMember;
use Peanut\QnutDirectory\db\DirectoryManager;
use Tops\services\TServiceCommand;

/**
 * Class UpdateCommitteeTermCommand
 * @package Peanut\QnutCommittees\services
 *
 * Contract:
 *      Request:
 *      	interface ITermOfService {
 *      	   	personId : any;
 *      	    committeeId: any;
 *      	    id: any;
 *      	    statusId: any;
 *      	    startOfService: string;
 *      	    endOfService: string;
 *      	    dateRelieved: string;
 *      	    roleId: any;
 *      	    notes: string;
 *      	}
 *      Response:
 *      	interface ITermOfServiceListItem[]
 *      	{
 *      	    name: string;
 *      		email: string;
 *      		phone: string;
 *      		role: string;
 *      		termOfService: string;
 *      		dateAdded : string;
 *      		dateUpdated : string;
 *      	}
 *
 */
class UpdateCommitteeTermCommand extends TServiceCommand
{

    protected function run()
    {
        $manager = new CommitteeManager();
        $request = $this->GetRequest();
        if ($request == null) {
            $this->AddErrorMessage('service-no-request');
            return;
        }

        if ($request->statusId == 4) {
            $manager->deleteMember($request->id);
        }
        else {
            if ($request->id == 0) {
                $member = new CommitteeMember();
            } else {
                $member = $manager->getCommitteeMemberTerm($request->id);
                if (empty($member)) {
                    $this->addErrorMessage('committee-error-member-not-found');
                    return;
                }
            }
            $member->assignFromObject($request);
            $manager->updateCommitteeMemberTerm($member, $this->getUser()->getUserName());
        }

        $result = $manager->getMembersList($member->committeeId);
        $this->SetReturnValue($result);
    }
}