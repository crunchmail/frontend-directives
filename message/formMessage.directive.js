/**
 * @ngdoc directive
 * @name message.directive:cmFormMessage
 * @description Form to create a message
 * @restrict E
 * @requires Lodash
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires message.factory:apiMessage
 * @requires domains.factory:apiDomains
 * @requires category.factory:apiCategory
 * @requires https://docs.angularjs.org/api/ng/service/$location
 * @requires https://docs.angularjs.org/api/ng/service/$rootScope
 * @requires https://github.com/likeastore/ngDialog
 * @requires message.factory:createMessageFactory
 * @requires gettextCatalog
 * @scope
 * @param {Object} message The message object
 * @param {Object} readOnly If message is read only
 * @param {String} type The message type
 */
(function () {
    'use strict';

    var directive = function(_, $log, apiMessage, apiDomains, apiCategory,
                             $rootScope, ngDialog, gettextCatalog, $location, createMessageFactory) {
        return {
            templateUrl:'views/message/formMessage.html',
            scope: {
                "message": "=",
                "type": "@",
                "readOnly": "="
            },
            link: function(scope, element, attrs) {
                /**
                 * @ngdoc property
                 * @name firstPartMail
                 * @propertyOf message.directive:cmFormMessage
                 * @description Email first part
                 */
                scope.firstPartMail = "";
                /**
                 * @ngdoc property
                 * @name domains
                 * @propertyOf message.directive:cmFormMessage
                 * @description Array with domains
                 */
                scope.domains = [];
                /**
                 * @ngdoc property
                 * @name categories
                 * @propertyOf message.directive:cmFormMessage
                 * @description Array with categories
                 */
                scope.categories = [];
                /**
                 * @ngdoc property
                 * @name noDomain
                 * @propertyOf message.directive:cmFormMessage
                 * @description Boolean to display a message, if there isn't a domain. Default: false.
                 */
                scope.noDomain = false;
                /**
                 * @ngdoc property
                 * @name noCategories
                 * @propertyOf message.directive:cmFormMessage
                 * @description Boolean to display a message if there isn't a category. Default: false.
                 */
                scope.noCategories = false;
                /**
                 * Get all domain and feed domains array
                 */
                apiDomains.getAll().then(function(result) {
                    _.forOwn(result, function(v, k) {
                        if(v.dkim_status !== "ko") {
                            scope.domains.push(v);
                        }
                    });

                    /**
                     * watch message.sender_email to set firstPartMail and lastPartMail
                     */
                    scope.$watch('message.sender_email', function(n, o) {
                        if(!_.isUndefined(n)) {
                            var splitSenderMail = n.split("@");
                            //scope.choiceDomains = splitSenderMail[1];
                            scope.firstPartMail = splitSenderMail[0];
                            scope.lastPartMail = _.find(result, { 'name': splitSenderMail[1]});
                        }
                    });
                    /**
                     * Check to display message if we haven't a domain
                     */
                    if(result.length === 0) {
                        scope.noDomain = true;
                    }
                });

                /**
                 * Save the form
                 */
                createMessageFactory.setForm(scope.messageForm);

                /**
                 * Get all categories and feed categories array
                 */
                apiCategory.getAll().then(function(result) {
                    scope.categories = result.data.results;
                    if(result.data.results.length === 0) {
                        scope.noCategories = true;
                    }
                });

                /**
                 * Watch firstPartMail and check domains length to display the correct result for message.sender_email
                 */
                scope.$watch('firstPartMail', function(newValue, oldValue) {
                    if(!_.isUndefined(scope.domains)) {
                        if(scope.domains.length === 1) {
                            scope.message.sender_email = scope.firstPartMail + '@' + scope.domains[0].name;
                        }else {
                            if(!_.isUndefined(scope.lastPartMail)) {
                                scope.message.sender_email = scope.firstPartMail + '@' + scope.lastPartMail.name;
                            }
                        }
                    }
                });

                /**
                 * @ngdoc property
                 * @name noCategories
                 * @methodOf message.directive:cmFormMessage
                 * @description Boolean to display a message if there isn't a category. Default: false.
                 */
                scope.getDomainsLastPart = function(optionSelected) {
                    if(scope.firstPartMail !== "") {
                        scope.message.sender_email = scope.firstPartMail + '@' + optionSelected.name;
                    }
                };



                /**
                 * @ngdoc function
                 * @name createCategory
                 * methodOf message.directive:cmFormMessage
                 * @description Category creation PopUp
                 */
                scope.createCategory = function() {
                    ngDialog.openConfirm({
                        template: '<cm-create-category on-success="closeThisDialog()"></cm-create-category>',
                        plain: true
                    })
                    .then(function(new_cat) {
                        $log.debug(new_cat);
                        scope.categories.push(new_cat);
                    });
                };

                /**
                 * @ngdoc event
                 * @name $locationChangeStart
                 * @eventOf message.directive:cmFormMessage
                 * @description
                 * Hide Toothpaste editor
                 * Check form and prevent changing route without saving
                 */
                var locationChangeStart = $rootScope.$on('$locationChangeStart', function(event, next) {
                    /*
                     * TODO review this
                     */
                    $rootScope.editeurVisible = false;
                    if(!_.isUndefined(scope.messageForm) && scope.messageForm.$dirty) {
                        var message = gettextCatalog.getString("Are you sure you want to change page? All your unsaved changes will be lost.");
                        event.preventDefault();
                        ngDialog.openConfirm({
                            template: 'views/_directives/confirm.html',
                            controller: function($scope) {
                                $scope.messageConfirm = message;
                            },
                        }).then(function (success) {
                            $location.$$parse(next);
                            locationChangeStart();
                        });
                    }else {
                        locationChangeStart();
                    }
                });

            }
        };
    };

    module.exports = directive;
}());
