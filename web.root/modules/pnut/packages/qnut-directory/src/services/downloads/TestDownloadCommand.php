<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 1/16/2018
 * Time: 5:51 AM
 */

namespace Peanut\QnutDirectory\services\downloads;


use Tops\services\TServiceCommand;
use Tops\sys\TCsvFormatter;

class TestDownloadCommand extends TServiceCommand
{

    private function createTestObj($name,$address,$city) {
        $result = new \stdClass();
        $result->Name = $name;
        $result->Address = $address;
        $result->City = $city;
        return $result;
    }

    protected function run()
    {
        $request = $this->getRequest();
        if (empty($request)) {
            $this->addErrorMessage("Test request not recieved");
        }
        if (empty($request->value1)) {
            $this->addErrorMessage("Test value 1 not recieved");
        }
        if (empty($request->value2)) {
            $this->addErrorMessage("Test value 2 not recieved");
        }
        $objs = [];
        $objs[] = $this->createTestObj('Terry',1,'Austin');
        $objs[] = $this->createTestObj('Joe',2,'Boston');
        $csv = TCsvFormatter::ToCsv($objs,['Address' => 'number']);
        $result = new \stdClass();
        $result->data = $csv; // join("\n",$csv);
        $result->filename = 'testfile';
        $this->setReturnValue($result);
    }
}