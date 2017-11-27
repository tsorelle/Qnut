<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 11/27/2017
 * Time: 8:46 AM
 */

namespace Peanut\QnutDirectory\db\model\repository;


use Tops\db\TAssociationRepository;

class PostaSubscriptionAssociation extends SubscriptionAssociation
{
    public function __construct()
    {
        parent::__construct(
            'qnut_postal_subscriptions',
            'qnut_addresses',
            'qnut_postal_lists',
            'addressId',
            'listId',
            'Peanut\QnutDirectory\db\model\entity\Address',
            'stdclass');
    }

}