<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 4/27/2017
 * Time: 5:12 PM
 */

namespace Peanut\qnut\cms;

//include __DIR__."/Autoloader.php";
// require_once str_replace('\\','/',realpath(__DIR__.'../../../')). '/vendor/autoload.php';

use Peanut\sys\ViewModelPageBuilder;
use PeanutTest\WebTester;
use Tops\services\DownloadServiceFactory;
use Peanut\sys\ViewModelManager;
use Tops\services\ServiceFactory;
use Tops\sys\TSession;

class CmsController
{
    /**
     * @var CmsController
     */
    private static $instance;

    private $mvvmRoot;
    private $corePath;
    private $vmName;
    private $contentFile;
    private $scriptDebug = true;

    const settingsLocation = 'application/config';

    /**
     * @param $indexDir
     * @return CmsController
     * @throws \Exception
     */
    public static function Start($indexDir) {
        date_default_timezone_set('America/Chicago');
        self::$instance = new CmsController();
        self::$instance->initialize($indexDir);
        return self::$instance;
    }

    public function  getContentFile() {
        return $this->contentFile;
    }

    /**
     * @param $fileRoot
     * @throws \Exception
     */
    public static function StartSession($fileRoot) {
        /** @noinspection PhpIncludeInspection */
        require_once($fileRoot.'/application/config/peanut-bootstrap.php');
        session_start();
        TSession::Initialize();
    }

    /**
     * @param $indexDir
     * @throws \Exception
     */
    public function initialize($indexDir)
    {
        global $_SERVER;
        $uri = $_SERVER['REQUEST_URI'];;
        if (strlen($uri) > 1 && substr($uri,-1) == '/') {
            // trailing slashes screw up relative paths later on
            $uri = substr($uri,0,strlen($uri) - 1);
            header("Location: $uri");
            exit;
        }

        $fileRoot = str_replace('\\', '/', $indexDir) . '/';
        /** @noinspection PhpIncludeInspection */
        require_once($fileRoot.'application/config/peanut-bootstrap.php');

        $settings = \Peanut\Bootstrap::initialize();
        session_start();
        TSession::Initialize();

        if (strtolower($uri) == '/index.php') {
            $routePath = 'home';
        }
        else if(strpos($uri,'/peanut/test/') === 0) {
            $parts = explode('/', $uri);
            $testname = array_pop($parts);
            WebTester::run($testname);
            exit;
        }
        else {
            $routePath = ViewModelManager::ExtractVmName($uri);
            if (empty($routePath)) {
                $routePath = 'home';
            }
        }

        $this->route($fileRoot, $routePath); // ,$settings->peanutUrl);
    }

    /**
     * @param $fileRoot
     * @param $routePath
     * @throws \Exception
     */
    private function route($fileRoot, $routePath) // , $peanutUrl)
    {
        switch ($routePath) {
            case 'peanut/settings' :
                header('Content-type: application/json');
                /** @noinspection PhpIncludeInspection */
                include($fileRoot . "/application/config/settings.php");
                exit;
            case 'peanut/service/execute' :
                header('Content-type: application/json');
                $response = ServiceFactory::Execute();
                print json_encode($response);
                exit;
            case 'peanut/service/download' :
                DownloadServiceFactory::PrintOutput();
                exit;
            default:
                $pageContent = @file_get_contents($fileRoot . '/content/' . $routePath . '.html');
                if ($pageContent === false) {
                    $content = ViewModelPageBuilder::Build($routePath);
                }
                else {
                    $content =  ViewModelPageBuilder::BuildStaticPage($pageContent);
                }

                /*
                 * // example using sub path
                $peanutUrlPos = strlen($peanutUrl) + 1;
                if (substr($routePath, 0, $peanutUrlPos) == $peanutUrl . '/') {
                    $content = \Peanut\sys\ViewModelPageBuilder::Build(substr($routePath, $peanutUrlPos));
                } else {
                    $pageContent = @file_get_contents($fileRoot . '/content/' . $routePath . '.html');
                    $content = $pageContent === false ?  false  : ViewModelPageBuilder::BuildStaticPage($pageContent);
                }
                */

                if ($content === false) {
                    $content = ViewModelPageBuilder::BuildMessagePage('page-not-found');
                }
                print $content;
                exit;
        }
    }


    public function getViewPath()
    {
        $result = $this->mvvmRoot."/view/".$this->vmName.'.html';
        if (file_exists($result)) {
            return $result;
        }
        exit ("View File: $result not found.");

    }

    public function getCoreScript($scriptName) {
        $src = $this->corePath.$scriptName.'.js';
        return "<script src='$src'></script>\n";
    }

    public function getScriptInit() {
        return ViewModelManager::GetStartScript();
    }

    public function getViewContainerId() {
        return strtolower($this->vmName)."-view-container";
    }

    public function getScriptDebug() {
        return $this->scriptDebug;
    }
}