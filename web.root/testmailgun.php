<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 5/8/2018
 * Time: 8:04 AM
 */
require '../vendor/autoload.php';

use Http\Adapter\Guzzle6\Client;

use Mailgun\Mailgun;
$mgClient = // new Mailgun('key-9a48cd8ad4d847ac54bcef292a58d558', Http\Adapter\Guzzle6\Client());
new Mailgun('key-9a48cd8ad4d847ac54bcef292a58d558', new Http\Adapter\Guzzle6\Client());

# Instantiate the client.
// $mgClient = new Mailgun('key-9a48cd8ad4d847ac54bcef292a58d558');
if (empty($mgClient)) {
    exit('failed');
}

$domain = "terry-sorelle.net";


# Make the call to the client.
$result = $mgClient->messages()->send($domain, array(
    'from'    => 'Excited User <terry@terry-sorelle.net>',
    'to'      => 'Terry <terry.sorelle@outlook.com>',
    'subject' => 'Hello',
    'text'    => 'Testing some Mailgun awesomness!'
));



print 'ok';
