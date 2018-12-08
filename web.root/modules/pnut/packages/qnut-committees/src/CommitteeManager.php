<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 11/19/2018
 * Time: 6:16 AM
 */

namespace Peanut\QnutCommittees;


use Peanut\QnutCommittees\db\model\entity\Committee;
use Peanut\QnutCommittees\db\model\entity\CommitteeMember;
use Peanut\QnutCommittees\db\model\repository\CommitteeMembersRepository;
use Peanut\QnutCommittees\db\model\repository\CommitteesRepository;
use Peanut\QnutDirectory\db\model\repository\OrganizationsRepository;
use Peanut\sys\ViewModelManager;
use Tops\sys\TConfiguration;
use Tops\sys\TL;
use Tops\sys\TLanguage;
use Tops\sys\TStrings;

class CommitteeManager
{
    const manageCommitteesPermission='manage committees';
    /**
     * @var CommitteesRepository
     */
    private static $committeesRepository;
    private static function getCommitteesRepository() {
        if (!isset(self::$committeesRepository)) {
            self::$committeesRepository = new CommitteesRepository();
        }
        return self::$committeesRepository;
    }

    /**
     * @var committeeMembersRepository
     */
    private static $committeeMembersRepository;
    private static function getCommitteeMembersRepository() {
        if (!isset(self::$committeeMembersRepository)) {
            self::$committeeMembersRepository = new CommitteeMembersRepository();
        }
        return self::$committeeMembersRepository;
    }

    private static $organizationsRepository;
    private static function getOrganizationsRepository() {
        if (!isset(self::$organizationsRepository)) {
            self::$organizationsRepository = new OrganizationsRepository();
        }
        return self::$organizationsRepository;
    }

    public function getCommitteeList()
    {
        return self::getCommitteesRepository()->getCommitteeList();
    }

    public function getCommittee($committeeId)
    {
        return self::getCommitteesRepository()->get($committeeId);
    }

    public function getCommitteeView($committeeId)
    {
        $committee = self::getCommitteesRepository()->get($committeeId);
        if (!empty($committee)) {
            $committee->fulldescriptionTeaser = TStrings::getTeaser($committee->fulldescription);
            $committee->notesTeaser = TStrings::getTeaser($committee->notes);
        }
        return $committee;
    }

    public function checkDuplicateName($committee) {
        $existing =self::getCommitteesRepository()->getByCommitteeName($committee->name);
        if ($existing) {
            $id = isset($committee->id) ? $committee->id : 0;
            return $existing->name === $committee->name && $existing->id !== $id;
        }
        return false;
    }

    public function getMembersList($committeeId)
    {
        $items = self::getCommitteeMembersRepository()->getMembersList($committeeId);
        if (empty($items)) {
            return array();
        }
        $result = array();
        $today = date('Y-m-d');
        $conjunctionTo = TLanguage::text('conjunction-to');
        $present = TLanguage::text('committee-date-present');
        $current = TLanguage::text('committee-current');
        $unknown = TLanguage::text('committee-dates-unknown');
        $directoryUrl = ViewModelManager::getVmUrl('Directory','qnut-directory');


        foreach($items as $item) {
            if (!empty($item->email)) {
                $item->email = $item->name.'<'.$item->email.'>';
            }
            $isCurrent = empty($item->dateRelieved);
            $endDate = $isCurrent ? $item->endOfService : $item->dateRelieved;

            if (empty($item->startOfService)) {
                $item->termOfService =  $isCurrent ? $current : $unknown;
            }
            else {
                if ($isCurrent && $today > $item->endOfService) {
                    $item->termOfService = "$item->startOfService $conjunctionTo $present";
                }
                else {
                    $item->termOfService = "$item->startOfService $conjunctionTo $endDate";
                }
            }

            $item->href = empty($directoryUrl) ? '' : $directoryUrl.'?pid='.$item->personId;

            array_push($result,$item );
        }
        return $result;
    }

    public function getReport()
    {
        return self::getCommitteesRepository()->getReport();
    }

    private $organizationId;
    private function getOrganizationId() {
        if (!isset($this->organizationId)) {
            $organizationCode = TConfiguration::getValue('organization', 'site');
            if (empty($organizationCode)) {
                $this->organizationId = null;
            }
            else {
                $id = self::getOrganizationsRepository()->getIdForCode($organizationCode);
                $this->organizationId = empty($id) ? null : $id;
            }
        }
        return $this->organizationId;
    }

    public function addCommittee($committeeDTO,$userName)
    {
        if (empty($committeeDTO->organizationId)) {
            $committeeDTO->organizationId = $this->getOrganizationId();
        }
        return self::getCommitteesRepository()->insert($committeeDTO,$userName);
    }

    public function updateCommittee($committeeDTO,$userName)
    {
        if (empty($committeeDTO->organizationId)) {
            $committeeDTO->organizationId = $this->getOrganizationId();
        }
        return self::getCommitteesRepository()->update($committeeDTO,$userName);
    }

    public function updateCommitteeMemberTerm(CommitteeMember $member,$userName)
    {
        $repository = self::getCommitteeMembersRepository();
        if ($member->id == 0) {
            $repository->insert($member,$userName);
        }
        else {
            $repository->update($member,$userName);
        }
    }

    public function getCommitteeMemberTerm($id)
    {
        return self::getCommitteeMembersRepository()->get($id);
    }

    public function deleteMember($id)
    {
        self::getCommitteeMembersRepository()->delete($id);
    }

}