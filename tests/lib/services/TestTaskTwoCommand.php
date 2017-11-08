<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 10/30/2017
 * Time: 11:25 AM
 */

namespace Qnut\test\services;


use Tops\services\TServiceCommand;

class TestTaskTwoCommand extends TServiceCommand
{

    protected function run()
    {
        $request = $this->getRequest();
        if ($request !== 'two') {
            $this->addErrorMessage('Unexpected input.');
        }
        $this->addInfoMessage('TestTaskTwo done.');
    }
}