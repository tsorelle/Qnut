<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 11/17/2017
 * Time: 9:52 AM
 */

namespace Peanut\QnutDirectory\db\model;


use Peanut\QnutDirectory\db\model\entity\Organization;
use Peanut\QnutDirectory\db\model\repository\OrganizationsRepository;
use Peanut\QnutDirectory\db\model\repository\VariablesRepository;
use Tops\cache\ITopsCache;
use Tops\cache\TSessionCache;
use Tops\db\TVariables;
use Tops\sys\TConfiguration;
use Tops\sys\TL;
use Tops\sys\TLookupItem;
use Tops\sys\TObjectContainer;

class TSiteInfo
{

    const cacheKey = 'qnut.siteinfo';
    const organizationKey = 'site-organization-code';
    /**
     * @var $instance TSiteInfo
     */
    private static $instance = null;
    private static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new TSiteInfo();
        }
        return self::$instance;
    }

    /**
     * @var $cache ITopsCache
     */
    private $cache;

    /**
     * @return ITopsCache || null
     */
    private function getCache() {
        if (!isset($this->cache)) {
            if (TObjectContainer::HasDefinition('tops.lookup.cache')) {
                $this->cache = TObjectContainer::Get('tops.lookup.cache');
            }
            else {
                $this->cache = new TSessionCache();
            }
        }
        return $this->cache;
    }

    public function __construct()
    {
        $cache = $this->getCache();
        $this->data = $cache->Get(self::cacheKey);
        if ($this->data === null) {
            $this->data = TConfiguration::getIniSection('site');
            $organizationCode = (array_key_exists('organization-code',$this->data)) ?
                $this->data['organization-code'] :
                TVariables::GetSiteOrganization();

            $repository = new OrganizationsRepository();
            /**
             * @var $org Organization
             */
            $org = $repository->getEntityByCode($organizationCode);
            if (empty($org)) {
                $this->data[self::organizationKey] = new TLookupItem();
            }
            else {
                $this->data[self::organizationKey] = TLookupItem::Create(
                    $org->getId(),
                    $org->getCode(),
                    $org->getName(),
                    $org->getDescription()
                );
            }
            $cache->Set(self::cacheKey,$this->data);
        }
    }

    private function getValue($key,$default=null) {
        return (array_key_exists($key,$this->data)) ?  $this->data[$key] : $default;
    }

    public static function Clear() {
        if (self::$instance !== null) {
            if (self::$instance->cache !== null) {
                self::$instance->cache->Remove(self::cacheKey);
            }
            self::$instance = null;
        }
    }

    public static function GetOrganization() {
        return self::Get(self::organizationKey);
    }

    public static function Get($key,$default=null) {
        return self::getInstance()->getValue($key,$default);
    }

}