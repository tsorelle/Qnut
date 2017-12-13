<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 12/12/2017
 * Time: 12:56 PM
 */

namespace Peanut\QnutDirectory\sys;


use Peanut\sys\PeanutSettings;
use Tops\sys\TLanguage;
use Tops\sys\TPath;

class MailTemplateManager
{
    private static $instance;

    private $templateList;


    private function scanTemplateDirectory($path,$result=['html' => [],'text' => []]) {
        $langs = TLanguage::GetSiteLanguageCodes();
        foreach ($langs as $language) {
            $language = strtolower($language);
            if (is_dir("$path/$language")) {
                $files = scandir("$path/$language");
                foreach ($files as $file) {
                    $parts = explode('.',$file);
                    $ext = array_pop($parts);
                    if (($ext == 'html' || $ext == 'txt')) {
                        $key = $ext == 'txt' ? 'text' : 'html';
                        if (!in_array($file,$result[$key])) {
                            $result[$key][] = $file;
                        }
                    }
                }
            }
        }
        return $result;
    }

    private function sortTemplateList(array $templates,$format) {
        $list = array_unique($templates[$format]);
        asort($list);
        $templates[$format] = $list;
    }

    public function getTemplateFileList()
    {
        if (!isset($this->templateList)) {
            $global = PeanutSettings::FromPeanutRoot('templates/mail', TPath::normalize_no_exception);
            $local = TPath::fromFileRoot('application/templates/mail');
            $templates = $this->scanTemplateDirectory($local);
            $templates =  $this->scanTemplateDirectory($global, $templates);
            $this->sortTemplateList($templates,'html');
            $this->sortTemplateList($templates,'text');
            $this->templateList = $templates;
        }
        return $this->templateList;
    }
}