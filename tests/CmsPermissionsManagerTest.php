<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 10/19/2017
 * Time: 7:10 AM
 */

use Peanut\qnut\cms\CmsPermissionsManager;
use PHPUnit\Framework\TestCase;
use Tops\db\EntityRepositoryFactory;

class CmsPermissionsManagerTest extends \Qnut\test\RepositoryTestFixture
{

    public function setUp() {
        $this->runSqlScript('roles-test-setup');
    }

    public function tearDown()
    {
        $this->runSqlScript('roles-test-cleanup');
    }

    public function testGetRoles()
    {
        $manager = new CmsPermissionsManager();
        $roles = $manager->getRoles();
        $this->assertTrue(sizeof($roles) > 2);
    }

    public function testAddRole() {
        $manager = new CmsPermissionsManager();
        $roles = $manager->getRoles();
        $expected = sizeof($roles) + 1;
        $manager->addRole('test-role-two');
        $roles = $manager->getRoles();
        $actual = sizeof($roles);
        $this->assertEquals($expected,$actual);

    }

    public function testRemoveRole() {
        $testPermision = 'unit-test-permission';
        $testRole = 'test-role-two';
        $manager = new CmsPermissionsManager();
        $manager->addRole($testRole);
        $roles = $manager->getRoles();
        $expectedRoleCount = sizeof($roles) - 1;
        $manager->assignPermission($testRole,$testPermision);
        $permission = $manager->getPermission($testPermision);
        $actual = $permission->check($testRole);
        $this->assertTrue($actual,'permision not assigned');
        $manager->removeRole($testRole);
        $roles = $manager->getRoles();
        $actualRoleCount = sizeof($roles);
        $this->assertEquals($expectedRoleCount,$actualRoleCount);
        $permission = $manager->getPermission($testPermision);
        $actual = $permission->check($testRole);
        $this->assertFalse($actual,'permision not updated');
    }

}
