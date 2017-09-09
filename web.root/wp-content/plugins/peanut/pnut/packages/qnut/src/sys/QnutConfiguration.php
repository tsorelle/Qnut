<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 9/9/2017
 * Time: 5:15 AM
 */

namespace Qnut\sys;


use PHPUnit\Runner\Exception;
use Tops\sys\TIniSettings;

class QnutConfiguration
{
    private static $settings;
    public static function getSettings() {
        if (!isset(self::$settings)) {
            $path = realpath(__DIR__.'/../..');
            $ini = TIniSettings::Create('package.ini',$path);
            if ($ini === false) {
                throw new Exception("Configuration file package.ini not found at $path");
            }
            self::$settings = $ini;
        }
        return self::$settings;
    }

    public static function GetSetting($key,$default=false) {
        return self::getSettings()->getValue($key,'settings',$default);
    }

    public static function GetDatabaseId() {
        return self::getSettings()->getValue('database','settings','default');
    }
}