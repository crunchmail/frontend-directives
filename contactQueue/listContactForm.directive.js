(function () {
    'use strict';

    var listContactForm = function(apiContactQueue, appSettings, $routeParams, $timeout) {
        return {
            templateUrl:'views/contactQueue/listContactForm.html',
            link: function(scope, element, attrs) {
                apiContactQueue.getAllForm().then(function(result) {
                    scope.getContactForm = result.data.results;
                    document.querySelector('table.animated').classList.add('fadeIn');
                });
                scope.menuCreateForm = function(form) {
                    var obj = {
                        "action": "Éditer",
                        "actionUrl": "#/edit-form/"+btoa(form.url),
                        "subItems": [
                            {
                                "item": "Archiver",
                                "isAction": true,
                                "parameter": btoa(form.url),
                                "itemAction": scope.archiveForm
                            }
                        ]
                    };
                    return obj;
                };
                scope.archiveForm = function(form) {
                    console.log(form);
                };
            }
        };
    };

    module.exports = listContactForm;

}());
