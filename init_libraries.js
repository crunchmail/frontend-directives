(function () {
    'use strict';

    require('angular');
    require('angular-route');
    require('angular-jwt');
    require('angular-drag-and-drop-lists/angular-drag-and-drop-lists');
    require('angular-spinkit');
    require('angular-xeditable');
    require('angular-sanitize');
    require('ng-csv');
    require('ng-dialog');
    require('ngpager/ngpager.min');
    require('checklist-model');
    //Poor performance csv
    require('angular-csv-import');
    require('angular-post-message');
    require('ng-infinite-scroll');
    require('angular-gettext');
    require('angular-animate');
    require('angular-resizable');
    require('angular-moment');
    require('adm-dtp/dist/ADM-dateTimePicker.min');
    require('checklist-model');
    require('v-tabs/dist/v-tabs.min');

    window.Papa = require('papaparse/papaparse');
    window.Raven = require('raven-js/dist/raven');
    /*
     * Include lang moment
     */
    require('moment/locale/fr');

    /*
    * External libraries module
    */
    module.exports = angular.module('external-libraries', [
        'ngRoute',
        'ngDialog',
        'NgPager',
        'ngAnimate',
        'angularMoment',
        'ADM-dateTimePicker',
        'angular-spinkit',
        'angular-jwt',
        'checklist-model',
        'xeditable',
        'ngCsvImport',
        'ngPostMessage',
        'ngSanitize',
        'ngCsv',
        'infinite-scroll',
        'gettext',
        'dndLists',
        'vTabs',
        'angularResizable',
        'checklist-model'
    ]);

}());
