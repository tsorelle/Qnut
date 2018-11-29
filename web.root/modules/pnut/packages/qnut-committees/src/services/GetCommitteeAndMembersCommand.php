<?php

namespace Peanut\QnutCommittees\services;

use Peanut\QnutCommittees\CommitteeManager;
use Tops\services\TServiceCommand;
use Tops\sys\TStrings;


/**
 * Class GetCommitteeAndMembersCommand
 * @package Peanut\QnutCommittees\services
 *
 * Contract
 *      Request: committee id
 *      Response:
 *      	interface IGetCommitteeResponse {
 *      	    committee: ICommittee
 *      			{
 *      			    id : any;
 *      				name  : string;
 *      				code  : string;
 *      				description  : string;
 *      				organizationId : any;
 *      				fulldescription : string;
 *                      fulldescriptionTeaser: string
 *      				mailbox : string;
 *      				isStanding : any;
 *      				isLiaison  : any;
 *      				membershipRequired  : any;
 *                      notesTeaser: string;
 *      				notes : string;
 *      				active: any;
 *      				createdby : string;
 *      				createdon : string;
 *      				changedby : string;
 *      				changedon : string;
 *      			}
 *      	    members : ITermOfServiceListItem[]
 *      			{
 *      			    name: string;
 *      				email: string;
 *      				phone: string;
 *      				role: string;
 *      				termOfService: string;
 *      				dateAdded : string;
 *      				dateUpdated : string;
 *                      href: string;
 *      			}
 *      	}
 */
class GetCommitteeAndMembersCommand extends TServiceCommand
{


    protected function run()
    {
        $committeeId = $this->GetRequest();
        if (empty($committeeId)) {
            $this->AddErrorMessage('error-no-id');
            return;
        }
        $result = new \stdClass();

        $manager = new CommitteeManager();
        $result->committee = $manager->getCommitteeView($committeeId);
        if ($result->committee == null) {
            $this->AddErrorMessage("Committee not found for id $committeeId");
            return;
        }

        $result->members = $manager->getMembersList($committeeId);
        $this->SetReturnValue($result);
    }
}