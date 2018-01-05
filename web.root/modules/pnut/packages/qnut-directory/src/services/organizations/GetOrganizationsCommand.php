<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 1/5/2018
 * Time: 11:13 AM
 */

namespace Peanut\QnutDirectory\services\organizations;


use Peanut\QnutDirectory\db\model\repository\OrganizationsRepository;
use Tops\services\TServiceCommand;

class GetOrganizationsCommand extends TServiceCommand
{

    protected function run()
    {
        $pageSize = 0;
        $pageNumber = 1;
        $includeInactive = false;
        $request = $this->getRequest();
        if (!empty($request)) {
            if (!empty($request->pageSize)) {
                $pageSize = $request->pageSize;
            }
            if (!empty($request->pageNumber)) {
                $pageNumber = $request->pageNumber;
            }
            $includeInactive = empty($request->includeInactive);
        }
        $response = (new OrganizationsRepository())->getOrganizationsList($pageNumber,$pageSize,$includeInactive);
        $this->setReturnValue($response);
    }
}