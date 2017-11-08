<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 10/27/2017
 * Time: 9:28 AM
 */

use Peanut\QnutDirectory\sys\TNameParser;
use PHPUnit\Framework\TestCase;

class TNameParserTest extends TestCase
{
    public function testFileByName() {
        $tests = array();
        $tests['Terry SoRelle'] = 'sorelle,terry';
        $tests['Terry Layton SoRelle'] = 'sorelle,terry layton';
        $tests['Terry L. SoRelle'] = 'sorelle,terry l.';
        $tests['T. L. SoRelle'] = 'sorelle,t. l.';
        $tests['Mr. Terry SoRelle'] = 'sorelle,terry';
        $tests['Ms. Terry Layton SoRelle'] = 'sorelle,terry layton';
        $tests['Mrs Terry L. SoRelle'] = 'sorelle,terry l.';
        $tests['Dr T. L. SoRelle'] = 'sorelle,t. l.';
        $tests['Terry SoRelle'] = 'sorelle,terry';
        $tests['Terry Layton SoRelle'] = 'sorelle,terry layton';
        $tests['Terry L. SoRelle'] = 'sorelle,terry l.';
        $tests['T. L. SoRelle'] = 'sorelle,t. l.';
        $tests['Mr. Terry SoRelle'] = 'sorelle,terry';
        $tests['Mr Terry SoRelle'] = 'sorelle,terry';
        $tests['Ms. Terry Layton SoRelle'] = 'sorelle,terry layton';
        $tests['Mrs Terry L. SoRelle'] = 'sorelle,terry l.';
        $tests['Dr T. L. SoRelle, MD'] = 'sorelle,t. l.';
        $tests['Terry'] = 'terry';
        $tests['Mr Terry'] = 'terry';
        $tests['Dr T. L. SoRelle III, MD'] = 'sorelle,t. l.';
        $tests['1st chance'] = 'chance,1st';
        $tests[' '] ='';
        $tests[1] = '';
        $tests['null'] ='';
        $tests['false'] ='';

        foreach ($tests as $name => $expected) {
            $testName = $name;
            switch($name) {
                case 'null' : $name = null;
                break;
                case 'false' : $name = false;
                break;
            }
            $actual = TNameParser::GetFileAsName($name);
            $this->assertEquals($expected,$actual,'Full name = '.$testName);
        }

    }

}
