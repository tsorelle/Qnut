<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 1/11/2018
 * Time: 6:02 AM
 */

namespace Peanut\QnutDirectory\services\organizations;


use Tops\services\TServiceCommand;
use Tops\sys\TPermissionsManager;

/**
 * Class DeleteOrganizationCommand
 * @package Peanut\QnutDirectory\services\organizations
 *
 * Service contract:
 *      Request:
 *          {
 *              id: organization id
 *              pageSize: for organization list
 *          }
 *
 * organization id number
 *      Response:
 *          Array of
 *              interface IOrganizationListItem {
 *                  id: any,
 *                  name: string,
 *                  code: string,
 *                  typeName: string;
 *              }
 */
class DeleteOrganizationCommand extends TServiceCommand
{

    public function __construct()
    {
        $this->addAuthorization(TPermissionsManager::updateDirectoryPermissionName);
    }


    protected function run()
    {
        $request = $this->getRequest();
        if (empty($request)) {
            $this->addErrorMessage('service-no-request');
            return;
        }
        $pageSize = 0;
        $pageNumber = 1;
        $includeInactive = false;
        if (!empty($request->pageSize)) {
            $pageSize = $request->pageSize;
        }

        // TODO: Implement run() method.  Delete Org
    }
}