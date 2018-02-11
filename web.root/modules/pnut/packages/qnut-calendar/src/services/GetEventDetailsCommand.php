<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 2/11/2018
 * Time: 9:38 AM
 */

namespace Peanut\QnutCalendar\services;


use Peanut\QnutCalendar\db\model\repository\CalendarEventsRepository;
use Tops\services\TServiceCommand;

class GetEventDetailsCommand extends TServiceCommand
{

    protected function run()
    {
        $request = $this->getRequest();
        if (empty($request)) {
            $this->addErrorMessage('error-no-id');
            return;
        }
        $repository = new CalendarEventsRepository();
        $response = $repository->getEventDetails($request);
        $this->setReturnValue($response);
    }
}