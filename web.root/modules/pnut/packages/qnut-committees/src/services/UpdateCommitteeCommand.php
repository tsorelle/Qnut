<?php
namespace Peanut\QnutCommittees\services;

use Peanut\QnutCommittees\CommitteeManager;
use Peanut\QnutCommittees\db\model\entity\Committee;
use Tops\services\TServiceCommand;
use Tops\sys\TConfiguration;


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

        if ($manager->checkDuplicateName($committeeUpdate)) {
            $this->addErrorMessage('error-committee-name-exists');
            return;
        }

        if ($committeeId == 0) {
            $prevName  = $committeeUpdate->name;
            $committee = new Committee();
        }
        else {
            $committee = $manager->getCommittee($committeeId);
            if (empty($committee)) {
                $this->addErrorMessage('committee-error-not-found');
                return;
            }
            $prevName = $committee->name;
        }

        $committee->assignFromObject($committeeUpdate);
        if($committeeId == 0) {
            $committeeId = $manager->addCommittee($committee,$this->getUser()->getUserName());
        }
        else {
            $manager->updateCommittee($committee, $this->getUser()->getUserName());
        };
        $result = new \stdClass();
        $result->committee = $manager->getCommitteeView($committeeId);
        $result->list =  $prevName === $result->committee->name ? null : $manager->getCommitteeList();
        $this->setReturnValue($result);
    }
}