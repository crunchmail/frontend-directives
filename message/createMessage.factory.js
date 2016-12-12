/**
 * @ngdoc service
 * @name message.factory:createMessage
 * @description Service use in {@link message.directive:cmCreateMessage}
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires https://docs.angularjs.org/api/ng/service/$rootScope
 */
(function () {
    'use strict';

    var createMessageFactory = function($log, $rootScope){
        return {
            /**
             * @ngdoc property
             * @name messageModel
             * @propertyOf message.factory:createMessage
             * @description The message model use in {@link message.directive:cmCreateMessage}
             */
            messageModel: {},
            /**
             * @ngdoc function
             * @name closeEditeur
             * @methodOf message.factory:createMessage
             * @description Close Toothpaste editor
             */
            closeEditeur: function() {
                $rootScope.editeurVisible = false;
                $rootScope.hideBody  = "";
            },
            /**
             * @ngdoc property
             * @name initHtmlMessage
             * @propertyOf message.factory:createMessage
             * @description Static html to init first message with content
             */
            initHtmlMessage: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="x-UA-Compatible" content="IE=edge"><style>#outlook a {padding: 0;}.ReadMsgBody,.ExternalClass {width: 100%;}.ExternalClass,.ExternalClass p,.ExternalClass span,.ExternalClass font,.ExternalClass td,.ExternalClass div {line-height: 100%;}body {width:100% !important;-webkit-text-size-adjust:none;-ms-text-size-adjust: none;margin: 0;padding: 0;font-family: sans-serif;}a img {border: 0;}img {height: auto;outline: 0;text-decoration: none;max-width: 100%;width: auto;display: block;-ms-interpolation-mode: bicubic;}table {border-collapse: collapse;margin: 0 auto;}table td { border-collapse: collapse; }.crunchWFull { width: 100%; }.crunchW3-4 { width: 450px; }.crunchW2-3 { width: 400px; }.crunchW1-2 { width: 300px; }.crunchW1-3 { width: 200px; }.crunchW1-4 { width: 150px; }.crunchW1-5 { width: 120px; }.crunchW1-6 { width: 100px; }.crunchW1-7 { width: 85px; }.crunchW1-8 { width: 69px; }.crunchW1-8 { width: 66px; }.crunchW1-10 { width: 60px; }.crunchCol div {display: inline-block;letter-spacing: normal;}.crunchCol.crunchBlockValignTop div {vertical-align: top;}.crunchCol.crunchBlockValignBottom div {vertical-align: bottom;}.crunchCol.crunchBlockValignMiddle div {vertical-align: middle;}.crunchCol td {letter-spacing: -5px;vertical-align: top;}.crunchBlock,.crunchBlockNoBg {margin: auto;}.crunchBlock.crunchFitBlock,.crunchBlockNoBg.crunchFitBlock {width: 100%;}.crunchCol .crunchButton td { letter-spacing: normal; }.crunchInlineImg img {display: inline;width: auto;}.crunchValignCenter div,.crunchValignCenter.crunchInlineImg img {vertical-align: middle;}.crunchGlobalWrapper .crunchNoPadding { padding: 0; }.crunchSeparator,.crunchSeparator td {padding: 0;}.crunchTtu { text-transform: uppercase; }.crunchTar { text-align: right; }.crunchTar .crunchButton {margin-left: auto;margin-right: inherit;}.crunchTac { text-align: center; }.crunchTac img,.crunchTac .crunchButton {margin: auto;}.crunchTac div { text-align: center; }.crunchTal { text-align: left; }.crunchTal .crunchButton {margin-right: auto;margin-left: inherit;}.crunchWrapper .crunchElement {margin: 10px 0;display: block;}.crunchElement.crunchButton { display: table; }.crunchLink {font-weight: bold;text-decoration: none;}.crunchButton { text-align: center; }.crunchButton p { margin: 0; }.crunchButton a { text-decoration: none; }.crunchButton td { background: inherit; }</style><style>.crunchWFull {min-width: 600px;}.crunchBlock td {padding: 25px;}.crunchBlockNoBg div {vertical-align: middle;padding: 10px;}.crunchBlock div {padding: 10px;vertical-align: middle;}.crunchBlock,.crunchBlockNoBg {width: 600px;}.crunchBlock.crunchFitBlock > table,.crunchBlockNoBg.crunchFitBlock > table {width: 600px;}.crunchBlock.crunch2Col div {width: 250px;}.crunchBlockNoBg.crunch2Col div {width: 280px;}.crunchBlock.crunch3Col div {width: 150px;}.crunchBlockNoBg.crunch3Col div {width: 180px;}.crunchBlock.crunch1-3ColLeft div:first-child {width: 150px;}.crunchBlockNoBg.crunch1-3ColLeft div:first-child {width: 180px;}.crunchBlock.crunch1-3ColLeft div + div {width: 350px;}.crunchBlockNoBg.crunch1-3ColLeft div + div {width: 380px;}.crunchBlock.crunch1-3ColRight div:first-child {width: 350px;}.crunchBlockNoBg.crunch1-3ColRight div:first-child {width: 380px;}.crunchBlock.crunch1-3ColRight div + div {width: 150px;}.crunchBlockNoBg.crunch1-3ColRight div + div {width: 180px;}.crunchBlock.crunch1-4ColLeft div:first-child {width: 100px;}.crunchBlockNoBg.crunch1-4ColLeft div:first-child {width: 130px;}.crunchBlock.crunch1-4ColLeft div + div {width: 400px;}.crunchBlockNoBg.crunch1-4ColLeft div + div {width: 430px;}.crunchBlock.crunch1-4ColRight div:first-child {width: 400px;}.crunchBlockNoBg.crunch1-4ColRight div:first-child {width: 430px;}.crunchBlock.crunch1-4ColRight div + div {width: 100px;}.crunchBlockNoBg.crunch1-4ColRight div + div {width: 130px;}.crunchMessageUsers {padding: 15px;font-size: 14px;text-align: center;font-family: Arial, sans-serif;margin: 0;}.crunchMessageUsers a {text-decoration: none;}.crunchWrapper .crunchTitle,.crunchWrapper .crunchText,.crunchWrapper .crunchList,.crunchWrapper .crunchLink {font-family: Arial, sans-serif;}.crunchWrapper .crunchTitle {font-weight: bold;line-height: 1.2;}.crunchTitle .crunchSubtitle {font-size: 60%;font-weight: normal;}.crunchWrapper .crunchText,.crunchWrapper .crunchList,.crunchWrapper .crunchLink {line-height: 1.5;font-size: 14px;}.crunchWrapper h1 {font-size: 30px;}.crunchWrapper h2 {font-size: 25px;}.crunchWrapper h3 {font-size: 18px;}.crunchWrapper h4,.crunchWrapper h5,.crunchWrapper h6 {font-size: 14px;}.crunchGlobalWrapper {background: #EEEEEE;}.crunchBgFB {background: #004f7c;}.crunchBgFB a {color: #FFF;}.crunchButton.crunchSmallButton {padding: 5px 10px;}.crunchCitation,.crunchCitation div {text-align: center;}.crunchMessageUsers a {color: #333333;}.crunchMessageUsers {color: #666666;}.crunchCitation .crunchText {font-size: 25px;}.crunchCitation img {margin: auto;}.crunchCitation .crunchButton {margin: auto;}.crunchSocial img,.crunchInlineImg img {display: inline;}.crunchSocial img {margin: 0 10px;padding-top: 10px;}.crunchList {padding-left: 16px;}.crunchList li {list-style: disc;}.crunchLink {color: #333333;}.crunchText {color: #666666;}.crunchButton {background: #333333;}.crunchButton .crunchLink {color: #FFF;}.crunchBlock {background: #FFFFFF;}.crunchWrapper .crunchBgPrimaryColor {background: #333333;}.crunchWrapper .crunchBgPrimaryColor .crunchTitle,.crunchWrapper .crunchBgPrimaryColor .crunchText,.crunchWrapper .crunchBgPrimaryColor .crunchList,.crunchWrapper .crunchBgPrimaryColor .crunchLink {color: #FFF;}.crunchBgPrimaryColor .crunchButton {background: #FFFFFF;}.crunchBgPrimaryColor .crunchButton td {background: inherit;}.crunchWrapper .crunchBgPrimaryColor .crunchLink {color: #333333;}.crunchCheckerboard:nth-child(odd) div:nth-child(even) {background: #333333;}.crunchCheckerboard:nth-child(even) div:nth-child(odd) {background: #333333;}.crunchCheckerboard:nth-child(odd) div:nth-child(even) * {color: #FFF;}.crunchCheckerboard:nth-child(even) div:nth-child(odd) * {color: #FFF;}.crunchCheckerboard:nth-child(odd) div:nth-child(even) .crunchButton {background: #FFFFFF;}.crunchCheckerboard:nth-child(even) div:nth-child(odd) .crunchButton {background: #FFFFFF;}.crunchCheckerboard:nth-child(odd) div:nth-child(even) .crunchButton * {color: #333333;}.crunchCheckerboard:nth-child(even) div:nth-child(odd) .crunchButton * {color: #333333;}.crunchBlock td td {background: inherit;}</style><style data-premailer="ignore">@media screen and (max-width:600px){div[class*="crunchBlock"],div[class*="crunchBlockNoBg"]{width:100%!important;display:block!important;box-sizing: border-box;}div[class*="crunchBlock"] div,div[class*="crunchBlockNoBg"] div{width:100%!important;display:block!important;box-sizing: border-box;}div[class*="crunchBlock"] table,div[class*="crunchBlockNoBg"] table{table-layout: fixed;}[class*="crunchTar"]{text-align:left!important;}table[class*="crunchWFull"]{width:100%!important;min-width: 0;}div[class*="crunchBlockNoBg"].crunch2Col div{padding:0 10px!important;}table[class="crunchGlobalWrapper"]{min-width:0!important;}}</style></head><body><table cellpadding="0" cellspacing="0" align="center" class="crunchGlobalWrapper" width="100%"><tbody><tr><td><table class="crunchWrapper crunchWFull" align="center" width="100%"><tbody><tr><td><div class="crunchTac crunchMessageUsers messageHeader"><div style="display:none;font-size:1px;color:#FFFFFF;line-height:1px;font-family:14px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;" class=""></div><p class=" ">Le message s\'affiche mal ? <a href="WEB_VERSION_URL" class="">Visualisez-le dans votre navigateur.</a></p></div></td></tr><tr><td></td></tr></tbody></table></td></tr><tr><td><div class="crunchTac crunchMessageUsers messageFooter"><p class=" "><a href="UNSUBSCRIBE_URL" class="">Se désinscrire</a> pour ne plus recevoir ces emails</p></div></td></tr></tbody></table></body></html>',
            /**
             * @ngdoc property
             * @name formCreateMessage
             * @propertyOf message.factory:createMessage
             * @description Variable to save create form
             */
            formCreateMessage: null,
            /**
             * @ngdoc function
             * @name setForm
             * @methodOf message.factory:createMessage
             * @description Save create form
             */
            setForm: function(form) {
                this.formCreateMessage = form;
            },
            /**
             * @ngdoc function
             * @name getForm
             * @methodOf message.factory:createMessage
             * @description Get create form
             */
            getForm: function(form) {
                return this.formCreateMessage;
            }
        };
    };

    module.exports = createMessageFactory;
}());
