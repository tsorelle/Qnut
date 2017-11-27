<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 11/27/2017
 * Time: 5:18 PM
 */

namespace Peanut\QnutDirectory\db\model\repository;


class EmailSubscriptionAssociation extends SubscriptionAssociation
{
    public function __construct()
    {
        parent::__construct(
            'qnut_email_subscriptions',
            'qnut_persons',
            'qnut_email_lists',
            'personId',
            'listId',
            'Peanut\QnutDirectory\db\model\entity\Person',
            'Peanut\QnutDirectory\db\model\entity\EmailList');
    }
}