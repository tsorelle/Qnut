<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 5/5/2018
 * Time: 5:25 AM
 */

namespace Peanut\QnutCalendar\services;


use Peanut\QnutCalendar\db\model\CalendarEventManager;
use Peanut\QnutCalendar\db\model\entity\CalendarNotification;
use Peanut\QnutCalendar\db\model\entity\FullCalendarEvent;
use Peanut\QnutDirectory\db\EMailQueue;
use Peanut\QnutDirectory\db\model\entity\EmailList;
use Peanut\QnutDirectory\db\model\entity\EmailMessage;
use Tops\services\TServiceCommand;
use Tops\sys\TDates;
use Tops\sys\TL;
use Tops\sys\TLanguage;

class SendEventNotificationsCommand extends TServiceCommand
{

    /**
     * @var EmailList
     */
    private $notificationsListInfo;


    protected function run()
    {
        // TODO: Test SendEventNotificationsCommand with email queue.

        $datearg = $this->getRequest();
        if (empty($datearg)) {
            $rundate = date('YYYY-m-d');
        }
        else  {
            $rundate = TDates::getValidDate($datearg);
            if ($rundate === false) {
                $this->addErrorMessage("Invalid date argument: $datearg");
                return;
            }
        }
        $this->addInfoMessage('Calendar notifications started: '.$rundate);
        $manager = new CalendarEventManager();
        $notifications = $manager->getCalendarNotifications($rundate);
        if (empty($notifications)) {
            $this->addInfoMessage('No calendar notifications were scheduled.');
            return;
        }
        $this->notificationsListInfo = $manager->getNotificationListInfo();
        foreach ($notifications as $notification) {
            $message = $this->createMessage($notification->event, sizeof($notification->recipients));
            EMailQueue::QueueMessageList($message, $this->getUser()->getUserName(),$notification->recipients);
        }
        $this->addInfoMessage('Calendar notifications completed. '.sizeof($notifications).' messages queued.');
    }

    private function createMessage(CalendarNotification $event, $recipientCount, $format='html')
    {
        $message = new EmailMessage();
        $today = new \DateTime();
        $message->postedDate = $today->format('Y-m-d H:i:s');
        $message->postedBy = $this->getUser()->getUserName();
        $message->listId		= $this->notificationsListInfo->id;
        $message->sender       = $this->notificationsListInfo->mailBox;
        $message->replyAddress = $this->notificationsListInfo->mailBox;
        $message->subject      = $event->title;
        $message->messageText  = sprintf(
            ($format=='html' ? '<p>%s<br>%s</p>' : "%s\n%s\n"),
            $event->title,
            $event->formatDateRange()
        );

        if ($event->location) {
            $message->messageText .=
                sprintf('<p><strong>%s</strong>: %s</p>',
                    ($format=='html' ? '<p><strong>%s</strong>: %s</p>' : "\n%s: %s\n"),
                    TLanguage::text('label-location'),$event->location);
        }

        if ($event->description) {
            $message->messageText .=
                sprintf(
                    ($format=='html' ? '<div>%s</div>>' : "\n%s\n"), $event->description);
        }

        $message->contentType  = 'html'; // todo: config?
        $message->template     = 'CalendarNotification';
        $message->recipientCount = $recipientCount;
        $message->active = 1;
        return $message;
    }
}