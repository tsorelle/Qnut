<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 1/2/2018
 * Time: 6:19 PM
 */

use Peanut\QnutDirectory\db\model\entity\Address;
use PHPUnit\Framework\TestCase;

class AddressTest extends TestCase
{

    public function testAssignFromObject()
    {
        $dto = new stdClass();
        $dto->addressname = 'addressname';
        $dto->address1 = 'address1';
        $dto->address2 = 'address2';
        $dto->city = 'city';
        $dto->state = 'state';
        $dto->postalcode = 'postalcode';
        $dto->country = 'country';
        $dto->phone = 'phone';
        $dto->notes = 'notes';
        $dto->addresstypeId = 2;
        $dto->sortkey = 'sortkey';
        $dto->listingtypeId = 4;
        $dto->latitude = 'latitude';
        $dto->longitude = 'longitude';

        $instance = new Address();
        $instance->assignFromObject($dto);
        $this->assertEquals($dto->addressname  , $instance->addressname  );
        $this->assertEquals($dto->address1     , $instance->address1     );
        $this->assertEquals($dto->address2     , $instance->address2     );
        $this->assertEquals($dto->city         , $instance->city         );
        $this->assertEquals($dto->state        , $instance->state        );
        $this->assertEquals($dto->postalcode   , $instance->postalcode   );
        $this->assertEquals($dto->country      , $instance->country      );
        $this->assertEquals($dto->phone        , $instance->phone        );
        $this->assertEquals($dto->notes        , $instance->notes        );
        $this->assertEquals($dto->addresstypeId, $instance->addresstypeId);
        $this->assertEquals($dto->sortkey      , $instance->sortkey      );
        $this->assertEquals($dto->listingtypeId, $instance->listingtypeId);
        $this->assertEquals($dto->latitude     , $instance->latitude     );
        $this->assertEquals($dto->longitude    , $instance->longitude    );
        $this->assertEquals(0,$instance->id);
        $this->assertEquals(1,$instance->active);

        $dto->id = 3;
        $dto->active = 0;
        $instance = new Address();
        $instance->assignFromObject($dto);
        $this->assertEquals(3,$instance->id);
        $this->assertEquals(0,$instance->active);
    }
}
