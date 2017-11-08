<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 10/30/2017
 * Time: 11:24 AM
 */

namespace Qnut\test\services;


use Tops\services\TServiceCommand;

class TestTaskOneCommand extends TServiceCommand
{
    protected function run()
    {
        $this->addInfoMessage('TestTAskOne done.');
    }
}