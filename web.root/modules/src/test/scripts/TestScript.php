<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 9/8/2017
 * Time: 7:29 AM
 */

namespace PeanutTest\scripts;


abstract class TestScript
{
     private $success = false;
     private $assertions = 0;
     private $passed = 0;
     private $failed = 0;
     protected function assert($proposition,$message) {
         $this->assertions++;
         if ($proposition) {
             $this->passed++;
             return true;
         }
         $this->failed++;
         print "Assertion failed, $message\n";
         return false;
     }

     protected function assertNotEmpty($actual,$item) {
         return $this->assert(!empty($actual),$item.' was empty');
     }

     protected function assertNotNull($actual,$item) {
         return $this->assert($actual !== null,$item.' was null');
     }

     protected function assertEquals($expected,$actual,$message = '') {
         if (!empty($message)) {
             $message = ', message: '.$message;
         }
         return $this->assert($expected == $actual,"Not equal: expected: $expected, actual:$actual $message");
     }



    public function run() {
         try {
            $this->execute();
            $this->success = $this->failed == 0;
         }
         catch (\Exception $exception) {
             print "\n\nTest threw exception: ".$exception->getMessage()."\n";
             print "Terminated\n";
             $this->success = false;
         }
         print "\n";
         print $this->success ? 'Test Passed!' : 'TEST FAILED!!!';
         print "\nAssertions: $this->assertions, passed: $this->passed, failed: $this->failed\n";
         print "Done.";

    }

    public abstract function execute();
}