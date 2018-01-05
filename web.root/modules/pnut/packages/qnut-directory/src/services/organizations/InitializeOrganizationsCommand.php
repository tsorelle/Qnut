<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 1/5/2018
 * Time: 10:19 AM
 */

namespace Peanut\QnutDirectory\services\organizations;


use Peanut\QnutDirectory\db\model\repository\OrganizationsRepository;
use Tops\services\TServiceCommand;

class InitializeOrganizationsCommand extends TServiceCommand
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
        $response = new \stdClass();
        $repository = new OrganizationsRepository();
        $response->organizations = $repository->getOrganizationsList($pageNumber,$pageSize);
        $count = $repository->getCount($includeInactive);
        $response->maxPages = $pageSize == 0 ? 0 : ceil($count / $pageSize);
        $this->setReturnValue($response);
    }
}