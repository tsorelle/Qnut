<?php
namespace Peanut\QnutCommittees\services;

use Peanut\QnutCommittees\CommitteeManager;
use Tops\services\TServiceCommand;


/**
 * Class GetCommitteeReportCommand
 * @package Peanut\QnutCommittees\services
 *      Contract:
 *          Response:
 *          	Array of
 *          		interface ICommitteeReportItem extends IMemberReportItem{
 *          			committeeId : any;
 *          			committeeName : string;
 *          			statusId : any;
 *          			memberName : string;
 *          			email : string;
 *          			phone : string;
 *          			role : string;
 *          			nominationStatus : any;
 *          		}
 */
class GetCommitteeReportCommand extends TServiceCommand
{
    protected function run()
    {
        $manager = new CommitteeManager();
        $report = $manager->getReport();
        $this->setReturnValue($report);
    }
}