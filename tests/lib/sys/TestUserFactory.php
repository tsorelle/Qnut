<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 11/24/2017
 * Time: 5:17 AM
 */

namespace Qnut\test\sys;

use Tops\sys\IUser;
use Peanut\qnut\cms\CmsUser;

class TestUserFactory  implements \Tops\sys\IUserFactory
{
    private static $config = ['settings' => ['current' => 'guest']];

    public static function setCurrent($username) {
        self::$config['settings']['current'] = $username;
    }

    public static function setAdmin() {
        if (empty(self::$config['admin'])) {
            self::addUser(self::CreateAdmin());
        }
        self::$config['settings']['current'] = 'admin';
    }

    public static function setTestUser($roles='') {
        if (empty(self::$config['testuser'])) {
            self::addUser(self::CreateUserConfig($roles));
        }
        self::$config['settings']['current'] = 'testuser';
    }

    public static function setGuest() {
        self::$config['settings']['current'] = 'guest';
    }

    public static function addUser($userConfig,$setCurrent=true) {
        $name = $userConfig['name'];
        self::$config[$name] = $userConfig;
        if ($setCurrent) {
            self::setCurrent($name);
        }
    }

    public static function CreateAdmin()
    {
        return [
            'name' => 'admin',
            'displayname' => 'The administrator',
            'email' => 'admin@testing.com',
            'roles' => 'administrator'
        ];
    }

    public static function CreateUserConfig($roles='',$email='user@test.com',$name='testuser',$displayName='Test User')
    {
        return [
            'name' => $name,
            'displayname' => $displayName,
            'email' => $email,
            'roles' => $roles
        ];

    }

    /**
     * @return IUser
     */
    public function createUser()
    {
        return new CmsUser(self::$config);
    }


}