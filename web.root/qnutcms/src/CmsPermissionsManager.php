<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 9/16/2017
 * Time: 9:41 AM
 */

namespace Peanut\qnut\cms;


use Tops\db\TDBPermissionsManager;
use Tops\sys\TPermissionsManager;
use Tops\sys\TPermission;
use Tops\sys\TStrings;
use Tops\sys\TUser;

class CmsPermissionsManager extends TDBPermissionsManager
{
    const roleHandleFormat = TStrings::dashedFormat;

    public function getRoleHandleFormat() {
        return self::roleHandleFormat;
    }

    /**
     * @var $rolesRepository RolesRepository
     */
    private $rolesRepository;
    private function getRolesRepository() {
        if (!isset($this->rolesRepository)) {
            $this->rolesRepository = new RolesRepository();
        }
        return $this->rolesRepository;
    }

    /**
     * @param string $roleName
     * @return bool
     */
    public function addRole($roleName, $roleDescription = null)
    {
        $repository = $this->getRolesRepository();
        $exists = $repository->getRole($roleName);
        if ($exists !== false) {
            return false;
        }
        $role = CmsRole::Create($roleName);
        $repository->insert($role);
        return true;
    }

    /**
     * @param string $roleHandle
     * @return bool
     */
    public function removeRole($roleHandle)
    {
        parent::removeRole($roleHandle); // remove from assignments
        $repository = $this->getRolesRepository();
        $role = $repository->getRole($roleHandle);
        if ($role == false) {
            return false;
        }
        $repository->delete($role->id);
        return true;
    }


    private $roles;
    /**
     * @return [];
     *
     * return array of stdClass
     *  interface ILookupItem {
     *     Key: any;
     *     Text: string;
     *     Description: string;
     *   }
     */
    public function getRoles()
    {
        if (!isset($roles)) {
            $this->roles = array();
            $roles = $this->getRolesRepository()->getAll();
            foreach ($roles as $role) {
                $this->roles[] = $this->createRoleObject($role->rolename);
            }
            $virtualRoles = $this->getVirtualRoles();
            $this->roles = array_merge($this->roles, array_values($virtualRoles));
        }
        return $this->roles;
    }
}