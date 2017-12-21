<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 9/1/2017
 * Time: 9:57 AM
 */

namespace Tops\extensions\phpmail;

use Tops\mail\IMailer;
use Tops\mail\TContentType;
use Tops\mail\TEMailMessage;
use Tops\mail\TMailConfiguration;
use Tops\mail\TMailSettings;
use Tops\sys\TConfiguration;
use Tops\sys\TPath;
use Tops\sys\TWebSite;

/**
 * Class TPhpMailer
 * @package Tops\mail
 *
 */
class TPhpMailer implements IMailer
{
    private $enabled = true;

    /**
     * @var PHPMailer
     */
    private $mailer;
    private $initialized = false;
    private $basedir;
    
    public function __construct()
    {
        $settings = TMailConfiguration::GetSettings();
        // $senderType = TConfiguration::getValue('sendmail','mail',1);
        $baseDir = TConfiguration::getValue('basedir','mail');
        if ($baseDir !== false) {
            $this->baseDir = TWebSite::ExpandUrl($baseDir);
        }

        $this->mailer = new \Tops\extensions\phpmail\PHPMailer();
        if (empty($settings->sendmail)) {
            $this->enabled = false;
        }
        else {
            switch ($settings->sendmail) {
                case 'smtp' :
                    $this->configureSmtp($settings);
                    break;
                // might support additional mailer types later
                default:
                    $this->mailer->isMail();
                    break;
            }
        }
    }

    public function configureSmtp(TMailSettings $settings)
    {
        $this->mailer->isSMTP();
        //Enable SMTP debugging
        // 0 = off (for production use)
        // 1 = client messages
        // 2 = client and server messages
        $this->mailer->SMTPDebug = $settings->debug;

        //Set the hostname of the mail server
        $this->mailer->Host = $settings->host;
        //Set the SMTP port number - likely to be 25, 465 or 587
        $this->mailer->Port = $settings->port;
        //Whether to use SMTP authentication
        $auth = $settings->auth;
        if ($auth) {
            $this->mailer->SMTPAuth = true;
            //Username to use for SMTP authentication
            $this->mailer->Username =  $settings->username;
            //Password to use for SMTP authentication
            $this->mailer->Password = $settings->password;
        }
    }

    /**
     * @param TEMailMessage $message
     * @return bool|string
     */
    public function send(TEMailMessage $message)
    {
        if (!$this->enabled) {
            return true;
        }
        $address = $message->getFromAddress();
        $this->mailer->setFrom($address->getAddress(), $address->getName());
        $address = $message->getReplyTo();
        $this->mailer->addReplyTo($address->getAddress(), $address->getName());
        $this->mailer->Subject = $message->getSubject();

        foreach ($message->getRecipients() as $recipient) {
            $this->mailer->addAddress($recipient->getAddress(), $recipient->getName());
        }

        foreach ($message->getCCs() as $recipient) {
            $this->mailer->addCC($recipient->getAddress(), $recipient->getName());
        }

        foreach ($message->getBCCs() as $recipient) {
            $this->mailer->addBCC($recipient->getAddress(), $recipient->getName());
        }

        $contentType = $message->getContentType();
        $isHtml = $contentType != TContentType::Text;

        $this->mailer->isHTML($isHtml);
        if ($isHtml) {
            $this->mailer->msgHTML($message->getMessageBody(), $this->basedir);
            if ($contentType == TContentType::MultiPart) {
                $this->mailer->AltBody = $message->getTextPart();
            }
        } else {
            $this->mailer->Body = $message->getMessageBody();
        }

        $returnAddress = $message->getReturnAddress();
        if (!empty($returnAddress)) {
            $this->mailer->addCustomHeader('Return-Path',$returnAddress);
        }

        $attachments = $message->getAttachments();

        foreach ($attachments as $attachment) {
            $path = TPath::fromFileRoot($attachment);
            if ($path===false) {
                return "Attachment path not found: $attachment";
            }
            $this->mailer->addAttachment($path);
        }

        if (!$this->mailer->send()) {
            return $this->mailer->ErrorInfo;
        } else {
            return true;
        }
    }

    public function setSendEnabled($value)
    {
        $this->enabled = $value;
    }
}