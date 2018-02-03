<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 1/20/2018
 * Time: 9:45 AM
 */


class GoogleCalendarTest extends PHPUnit_Framework_TestCase
{
    public function testApiConnect() {

        $client = new Google_Client();
        $path = \Tops\sys\TPath::fromFileRoot('client_secret_771901347562-ssuprisvar5rn09k2f00crqvgk35l70u.apps.googleusercontent.com.json');
        $config = file_get_contents($path);
        $client->setAuthConfig($config);
        $client->addScope(Google_Service_Calendar::CALENDAR);
        // $client->setApplicationName("My Application");
        // $client->setClientId('68526682336-ljb27kv9bv2v131sb3ofcq41jljfh3tk.apps.googleusercontent.com');
        // $client->setDeveloperKey("AIzaSyBYZb1w7mZzRL31R7r-EDtGYrtAQ4CnlhA");
        $service = new Google_Service_Calendar($client);

        $events = $service->events->listEvents('qnutpublic');
        $this->assertNotEmpty($events);
    }

}
