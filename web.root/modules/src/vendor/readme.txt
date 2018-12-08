The vendor directory is used for Composer libraries where Composer is not accessible to Peanut in the deployment.

To add a library for deployment:
1. Copy source code only from the development installation of Composer.  E.g.
    vendor/smalot/pdfparser/src/Smalot/PdfParser  to    (peanut module path)/src/vendor/smalot/PdfParser

2. If the target CMS does not itself include the library add a reference in the [autoload] section of
    application/config/settings.ini.  E.g.

    Smalot\PdfParser=[pnut-src]/vendor/smalot/PdfParser

3. On deployment, if the target CMS itself already includes the library, remove the autoload reference from the deployed settings.ini.
    In this case the library source need not be deployed.

PhpStorm development environment.
1. Add the library to Composer.  This will be used by the editor and the unit tests.
2. Mark the library's source root directory, (peanut module path)/vendor/(the library), as 'Excluded'
When testing the application in a web browser the peanut source location will be used.

Notes:
1. Remember that the source in the Peanut location must be updated manually for changes in the Composer library.
2. You must add additional libraries or require statements to account for any dependencies.
    See pnut/packages/qnut-documents/src/PdfTextParser.php for example that checks dependencies.
