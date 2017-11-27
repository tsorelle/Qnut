<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 11/24/2017
 * Time: 5:17 AM
 */

namespace Qnut\test\sys;

use Tops\sys\TUser;
use Peanut\qnut\cms\CmsUser;

class TestUserFactory
{
    private static $config = ['settings' => ['current' => 'guest']];

    public static function setCurrent($username) {
        self::$config['settings']['current'] = $username;
    }

    public static function addUser($userConfig,$setCurrent=true) {
        self::$config[$userConfig->name] = $userConfig;
        if ($setCurrent) {
            self::setCurrent($userConfig->name);
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

    public static function GetUser() {
        return new CmsUser(self::$config);
    }

    public static function SetCurrentUser() {
        TUser::setCurrent();
    }

}