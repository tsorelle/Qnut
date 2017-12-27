<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 10/30/2017
 * Time: 6:11 AM
 */

namespace Peanut\PeanutTasks;


use PHPUnit\Runner\Exception;
use Tops\db\TEntityRepository;
use Tops\sys\TStrings;

class TaskQueueEntry
{
    public $id;
    public $frequency;
    public $taskname;
    public $namespace;
    public $startdate;
    public $enddate;
    public $inputs;
    public $comments;
    public $active;

    public function assignFromObject($dto)
    {
        $errors = array();
        if (isset($dto->id)) {
            $this->id = $dto->id;
        }
        if (isset($dto->frequency)) {
            $this->frequency = $dto->frequency;
        }
        else {
            $errors[] = 'Frequency is required';
        }
        if (isset($dto->taskname)) {
            $this->taskname = $dto->taskname;
        }
        else {
            $errors[] = 'Task name is required';
        }
        if (isset($dto->namespace)) {
            $this->namespace = $dto->namespace;
        }
        if (empty($dto->startdate) || $dto->startdate == '0000-00-00') {
            $this->startdate = null;
        } else {
            $this->startdate = $dto->startdate;
        }
        if (empty($dto->enddate) || $dto->enddate == '0000-00-00') {
            $this->enddate = null;
        } else {
            $this->enddate = $dto->enddate;
        }
        if (isset($dto->inputs)) {
            $this->inputs = $dto->inputs;
        }
        if (isset($dto->comments)) {
            $this->comments = $dto->comments;
        }
        if (isset($dto->active)) {
            $this->active = $dto->active;
        }
    }


    /**
     * @return bool|\DateInterval
     */
    public function getFrequencyAsInterval($value = false) {
        if ($value === false) {
            $value = $this->frequency;
        }
        $spec = self::stringToIntervalSpec($value);
        if (empty($spec)) {
            return false;
        }
        try {
            return new \DateInterval($spec);
        }
        catch(\Exception $ex) {
            return false;
        }
    }

    public function setFrequency($value)
    {
        $interval = self::stringToInterval($value);
        if ($interval === false) {
            throw new \Exception("Invalid frequency value '$value");
        }
        if ($interval === null) {
            $this->frequency = '';
        }
        else {
            $this->frequency = $value;
        }
    }


    public static function stringToInterval($frequency) {
        $spec = self::stringToIntervalSpec($frequency);
        if (empty($spec)) {
            return $spec;
        }
        try {
            return new \DateInterval($spec);

        } catch (\Exception $ex) {
            return false;
        }
    }

    public static function stringToIntervalSpec($frequency)
    {
        if ($frequency == null) {
            return null;
        }
        $parts = array_filter(explode(' ', trim($frequency)));
        if (sizeof($parts) == 1) {
            return false;
        } else {
            return self::getIntervalSpec($parts[0], $parts[1]);
        }
    }

    public static function getIntervalSpec($count, $unit)
    {
        if (is_numeric($count) && $count > 0) {
            $unit = trim(strtoupper($unit));
            if (empty($unit)) {
                return null;
            }
            if (substr($unit, 0, 3) == 'MI') {
                return 'PT' . $count . 'M';
            }
            $unit = substr($unit, 0, 1);
            if ($unit == 'Y' || $unit == 'M' || $unit == 'D' || $unit == 'W' || $unit == 'H' || $unit == 'S') {
                return 'P' . $count . $unit;
            }
        }
        return null;
    }

    public static function intervalToString($intervalSpec)
    {
        $spec = $intervalSpec;
        $intervalSpec = trim(strtoupper($intervalSpec));
        if (empty($intervalSpec)) {
            return '';
        }
        $unit = substr($intervalSpec, -1);
        $intervalSpec = substr($intervalSpec, 0, strlen($intervalSpec) - 1);
        if (substr($intervalSpec, 0, 2) == 'PT') {
            $unit = 'minute';
            $count = substr($intervalSpec, 2);
        } else {
            switch ($unit) {
                case 'Y' :
                    $unit = 'year';
                    break;
                case 'M' :
                    $unit = 'month';
                    break;
                case 'D' :
                    $unit = 'day';
                    break;
                case 'W' :
                    $unit = 'week';
                    break;
                case 'H' :
                    $unit = 'hour';
                    break;
                case 'S' :
                    $unit = 'second';
                    break;
                default:
                    return 'Invalid: ' . $spec;
            }
            $count = substr($intervalSpec, 1);
        }
        if (!is_numeric($count)) {
            return 'Invalid: ' . $spec;
        }
        if ($count > 1) {
            $unit = $unit . 's';
        }
        return "$count $unit";
    }
}