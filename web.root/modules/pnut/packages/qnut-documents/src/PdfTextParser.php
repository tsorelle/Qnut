<?php
/**
 * Created by PhpStorm.
 * User: Terry
 * Date: 12/2/2018
 * Time: 7:02 AM
 */

namespace Peanut\QnutDocuments;


use Peanut\sys\PeanutSettings;
use Smalot\PdfParser\Document;
use Smalot\PdfParser\Parser;
use Tops\sys\TStringTokenizer;

/**
 * Class PdfTextParser
 * @package Peanut\QnutDocuments
 *
 * Requires smalot/PdfParser library  https://www.pdfparser.org/
 * See web.root/modules/src/vendor/readme.txt for installation notes
 *
 * Example output from Document->getDetails()
 *  [Author] => Terry SoRelle
 *  [Creator] => Microsoft® Word 2016
 *  [CreationDate] => 2016-04-27T08:08:51-05:00
 *  [ModDate] => 2016-04-27T08:08:51-05:00
 *  [Producer] => Microsoft® Word 2016
 *  [Pages] => 1
 */
class PdfTextParser
{
    private static $status;

    /**
     * @var $parser Parser
     */
    private static $parser;

    /**
     * @var Document
     */
    public $document = null;
    public $errors  = array();

    public static function Ready() {
        if (!isset(self::$status )) {
            if (class_exists('Smalot\PdfParser\Document')) {
                $srcPath = PeanutSettings::FromSrcPath('vendor/tecnickcom/tcpdf/tcpdf_parser.php');
                if ($srcPath === false) {
                    self::$status = "Dependent module 'vendor/tecnickcom/tcpdf' not found.";
                }
                else {
                    require_once($srcPath);
                    self::$status = 'OK';
                    self::$parser = new Parser();

                }
            }
            else {
                self::$status = "Required module 'Smalot\PdfParser' not installed.";
            }
        }
        return self::$status === 'OK';
    }

    public static function ParseFile($filePath) {
        $response = new PdfTextParser();
        if (self::Ready()) {
            if (file_exists($filePath)) {
                try {
                    $pdf = self::$parser->parseFile($filePath);
                    $response->document = $pdf;
                } catch (\Exception $ex) {
                    $response->errors[] = 'pdf_parser_exception';
                    $message = $ex->getMessage();
                    $response->errors[] = $message;
                    error_log($message);
                }
            }
            else {
                $response->errors[] = 'pdf_parser_no_file';
            }
        }
        else {
            $response->errors[] = self::$status;
        }

        return $response;
    }

    public static function GetIndexWords($text) {
        $text = str_replace(["\t","'","`",'’',"\""],'',$text);
        $text = str_replace(["\n",']','['],' ',$text);
        $text = mb_convert_encoding($text,'UTF-7');
        return TStringTokenizer::extractKeywords($text);
    }

    public function getKeyWords() {
        $text = $this->document->getText();
        return self::GetIndexWords($text);
    }

    public function getKeyText() {
        $words = $this->getKeyWords();
        if (count($words)) {
            return implode(' ',$words);
        }
        return '';
    }

    public function getLastError() {
        if (empty($this->errors)) {
            return '';
        }
        return array_shift($this->errors);
    }
}
