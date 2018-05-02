<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 2/2/2018
 * Time: 11:40 AM
 */

namespace Peanut\QnutCalendar\db\model;

use Peanut\QnutCalendar\db\model\entity\CalendarEvent;
use Peanut\QnutCalendar\db\model\entity\FullCalendarEvent;
use Peanut\QnutCalendar\db\model\entity\NotificationSubscription;
use Peanut\QnutCalendar\db\model\repository\CalendarCommitteeAssociation;
use Peanut\QnutCalendar\db\model\repository\CalendarEventsRepository;
use Peanut\QnutCalendar\db\model\repository\CalendarResourceAssociation;
use Peanut\QnutCalendar\db\model\repository\NotificationSubscriptionsRepository;
use Peanut\QnutCalendar\db\model\repository\NotificationTypesRepository;
use Tops\db\model\repository\LookupTableRepository;
use Tops\db\NamedEntity;
use Tops\sys\IUser;
use Tops\sys\TCalendarPage;
use Tops\sys\TDateRepeater;
use Tops\sys\TDates;

class CalendarEventManager
{
    const ManageCalendarPermissionName = 'Manage calendar';
    /**
     * @var CalendarEventsRepository
     */
    private $eventsRepository;
    private function getEventsRepository() {
        if (!isset($this->eventsRepository)) {
            $this->eventsRepository = new CalendarEventsRepository();
        }
        return $this->eventsRepository;
    }

    /**
     * @var CalendarCommitteeAssociation
     */
    private $committeesAssociation;
    private function getCommitteesAssociation() {
        if (!isset($this->committeesAssociation)) {
            $this->committeesAssociation = new CalendarCommitteeAssociation();
        }
        return $this->committeesAssociation;
    }

    /**
     * @var NotificationSubscriptionsRepository
     */
    private $notificationsRepository;
    private function getNotificationsRepository() {
        if (!isset($this->notificationsRepository)) {
            $this->notificationsRepository = new NotificationSubscriptionsRepository();
        }
        return $this->notificationsRepository;
    }



    /**
     * @var CalendarResourceAssociation;
     */
    private $resourcesAssociation;
    private function getResourcesAssociation() {
        if (!isset($this->resourcesAssociation)) {
            $this->resourcesAssociation = new CalendarResourceAssociation();
        }
        return $this->resourcesAssociation;
    }

    private static $instance;
    public static function GetInstance() {
        if (!isset(self::$instance)) {
            self::$instance = new CalendarEventManager();
        }
    }

    /**
     * @param $id
     * @return bool|CalendarEvent
     */
    public function getEvent($id) {
        return $this->getEventsRepository()->get($id);
    }

    public function addEvent(CalendarEvent $event, $username = 'system') {
        return $this->getEventsRepository()->insert($event,$username);
    }

    public function updateEventAssociations($eventId,array $committees = null, array $resources = null) {
        if ($committees !== null) {
            $this->getCommitteesAssociation()->updateRightValues($eventId,$committees);
        }
        if ($resources !== null) {
            $this->getResourcesAssociation()->updateRightValues($eventId,$resources);
        }
    }

    public function updateEvent(CalendarEvent $event, $username = 'system') {
        $this->getEventsRepository()->update($event,$username);
    }

    /**
     * @param $request
     * @return \stdClass
     */
    public function getCalendarEvents($request)
    {
        $year = empty($request->year) ? date('Y') : $request->year;
        $month = empty($request->month) ? date('n') : $request->month;
        $filter= empty($request->filter) ? '' : $request->filter;
        $code=empty($request->code) ? '' : $request->code; 
        $pageDirection=empty($request->pageDirection) ? '' : $request->pageDirection;
        $publicOnly = (!empty($request->public));

        $calendarPage = TCalendarPage::Create($year, $month, $pageDirection);
        $startDate = (clone $calendarPage->start)->format('Y-m-d');
        $endDate = (clone $calendarPage->end)->format('Y-m-d');
        $eventsRepository = $this->getEventsRepository();
        $eventResults = $eventsRepository->getFilteredEvents($startDate,$endDate,$filter,$code,$publicOnly);

        /**
         * @var $repeats FullCalendarEvent[]
         */
        $results = $eventResults->events;
        /**
         * @var $repeats FullCalendarEvent[]
         */
        $repeats = $eventResults->repeats;


        // get repeating dates
        $repeater = new TDateRepeater();
        $utc = new \DateTimeZone('UTC');
        foreach ($repeats as $event) {
            $occurance = 0;
            $dates = $repeater->getRepeatingDates($calendarPage,$event->repeatPattern);
            if (!is_array($dates)) {
                continue;
            }
            $replacements = $eventsRepository->getRepeatReplacementDates($event->id);
            foreach ($dates as $date) {
                // Check if a replacement event found for this instance
                if (in_array($date,$replacements)) {
                    continue;
                }

                // clone the event and update start and end dates
                $repeat = clone $event;
                $repeat->occurance = ++$occurance;
                $repeat->recurInstance = $date;
                $repeat->start = $date;
                @list($datePart,$timePart) = explode('T',$event->start);
                if ($timePart !== null) {
                    $repeat->start .= 'T'.$timePart;
                }
                if ($event->end !== null) {
                    $start = new \DateTime($event->start,$utc);
                    $end = new \DateTime($event->end,$utc);
                    $test = $end->format(TDates::IsoDateTimeFormat);

                    $interval = $end->diff($start);
                    $end = new \DateTime($repeat->start,$utc);
                    $end->add($interval);
                    $repeat->end = str_replace('UTC','T',$end->format(TDates::IsoDateTimeFormat));
                }
                $results[] = $repeat;
            }
        }

        // sort by start time
        uasort($results,function ($eventA,$eventB) {
            $a = new \DateTime($eventA->start);
            $b = new \DateTime($eventB->start);
            if ($a == $b) {
                return 0;
            }
            return ($a < $b) ? -1 : 1;
        });

        $response = new \stdClass();
        $response->events = $results;
        $response->startDate = $calendarPage->start->format('Y-m-d');
        $response->endDate = $calendarPage->end->format('Y-m-d');
        return $response;
    }


    public function getEventTypesList()
    {
        $repository = new LookupTableRepository('qnut_calendar_event_types');
        $repository->setLookupInfoColumns(['backgroundColor as `color`']);
        return $repository->getLookupList();
    }

    public function getResourcesList()
    {
        $repository = new LookupTableRepository('qnut_resources');
        return $repository->getLookupList();
    }

    public function getCommitteeList()
    {
        $repository = new LookupTableRepository('qnut_committees');
        return $repository->getLookupList();
    }

    private $subscriptionTypeId;
    private function getSubscriptionTypeId()
    {
        if (!isset($this->subscriptionTypeId)) {
            /**
             * @var $type NamedEntity
             */
            $type = (new NotificationTypesRepository())->getEntityByCode('calendar');
            $this->subscriptionTypeId = empty($type) ? 1 : $type->getId();
        }
        return $this->subscriptionTypeId;
    }

    public function addEventNotification($eventId,$personId,$leadDays,$username = 'system') {
        /**
         * @var $subscription NotificationSubscription
         */
        $subscription = $this->getNotificationsRepository()->getSubscription('calendar',$eventId,$personId);
        if (empty($subscription)) {
            $subscription = new NotificationSubscription;
            $subscription->personId = $personId;
            $subscription->notificationTypeId = $this->getSubscriptionTypeId();
            $subscription->itemId = $eventId;
            $subscription->leadDays = $leadDays;
            $this->getNotificationsRepository()->insert($subscription,$username);
        }
        else if ($subscription->leadDays != $leadDays) {
            $subscription->leadDays = $leadDays;
            $this->getNotificationsRepository()->update($subscription, $username);
        }
    }

    public function clearEventNotification($eventId,$personId) {
        /**
         * @var $subscription NotificationSubscription
         */
        $subscription = $this->getNotificationsRepository()->getSubscription('calendar',$eventId,$personId);
        if (!empty($subscription)) {
           $this->getNotificationsRepository()->delete($subscription->id);
        }
    }

    public function deleteEvent($eventId) {
        $this->getNotificationsRepository()->deleteSubscriptions('calendar',$eventId);
        $this->getCommitteesAssociation()->removeAllLeft($eventId);
        $this->getResourcesAssociation()->removeAllLeft($eventId);
        $this->getEventsRepository()->delete($eventId);
    }

    public function deleteRepeatingEvent($eventId)
    {
        $this->getEventsRepository()->deleteRepeatInstances($eventId);
        $this->deleteEvent($eventId);
    }

    public function deleteRepeatingInstances($eventId)
    {
        $this->getEventsRepository()->deleteRepeatInstances($eventId);
    }

    public function truncateRepeatInstances($eventId,$date) {
        if (!empty($date)) {
            $this->getEventsRepository()->truncateRepeatInstances($eventId,$date);
        }

    }

    /**
     * @param $event CalendarEvent
     * @param $instanceDate
     * @param string $username
     *
     * Insert a "cloned" event with active=0.  This supresses the generation of a "virtual" repeating event for that date.
     */
    public function deleteRepeatInstance($eventId,$instanceDate,$username='system')
    {
        $event = $this->getEventsRepository()->get($eventId);
        if ($event) {
            $event->title = $event->title.' - removed';
            $event->recurId = $eventId;
            $event->id = 0;
            $event->recurPattern = null;
            $event->recurEnd = null;
            $event->active = 0;
            $event->start = $instanceDate;
            $event->recurInstance = $instanceDate;
            $this->getEventsRepository()->insert($event, $username);
        }
    }

}