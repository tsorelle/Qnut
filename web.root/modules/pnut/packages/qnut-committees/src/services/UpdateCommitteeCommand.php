<?php
namespace Peanut\QnutCommittees\services;

use Peanut\QnutCommittees\CommitteeManager;
use Peanut\QnutCommittees\db\model\entity\Committee;
use Tops\services\TServiceCommand;

/**
 * Class UpdateCommitteeCommand
 * @package Peanut\QnutCommittees\services
 *
 *  Contract:
 *      Request:
 *          interface ICommitteeUpdate {
 *              id : any;
 *              name  : string;
 *              code  : string;
 *              description  : string;
 *              organizationId : any;
 *              fulldescription : string;
 *              mailbox : string;
 *              isStanding : any;
 *              isLiaison  : any;
 *              membershipRequired  : any;
 *              notes : string;
 *              active: any;
 *          }
 *
 */
class UpdateCommitteeCommand extends TServiceCommand
{
    protected function run()
    {
        $committeeUpdate = $this->GetRequest();
        if ($committeeUpdate == null) {
            $this->AddErrorMessage('service-no-request');
            return;
        }

        $committeeId = $committeeUpdate->id;
        $manager = new CommitteeManager();
        if ($committeeId == 0) {
            $committee = new Committee();
        }
        else {
            $committee = $manager->getCommittee($committeeId);
            if (empty($committee)) {
                $this->addErrorMessage('committee-error-not-found');
                return;
            }
        }

        // todo: clean input from notes and full description

        $committee->assignFromObject($committeeUpdate);
        if($committeeId == 0) {
            $manager->addCommittee($committee,$this->getUser()->getUserName());
        }
        else {
            $manager->updateCommittee($committee, $this->getUser()->getUserName());
        };

        $committee = $manager->getCommittee($committeeId);
        $this->setReturnValue($committee);
    }
}