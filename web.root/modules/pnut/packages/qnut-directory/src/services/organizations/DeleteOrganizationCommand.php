<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 1/11/2018
 * Time: 6:02 AM
 */

namespace Peanut\QnutDirectory\services\organizations;


use Peanut\QnutDirectory\db\DirectoryManager;
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
        if (empty($request->id)) {
            $this->addErrorMessage('error-no-id');
            return;
        }
        $pageSize = empty($request->pageSize) ? 0 : $request->pageSize;

        $manager = new DirectoryManager($this->getMessages(),$this->getUser()->getUserName());
        $manager->removeOrganization($request->id);
        $response = $manager->getOrganizationsList(1,$pageSize);
        $this->setReturnValue($response);
    }
}