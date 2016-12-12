/**
 * @ngdoc service
 * @name recipients.factory:apiRecipient
 * @description
 * Api shortcut for Recipients
 * @requires https://docs.angularjs.org/api/ng/service/$http
 * @requires https://docs.angularjs.org/api/ng/service/$rootScope
 * @requires Lodash
 * @requires gettextCatalog
 */
(function () {
    'use strict';

    var apiRecipient = function($http, $rootScope, $q, _, $log, gettextCatalog){
        return {
            sendingLimit: 1000,
            /**
             * @ngdoc function
             * @methodOf recipients.factory:apiRecipient
             * @name postMails
             * @description
             * Post mails
             * @param {Object} obj Object which contain all mails
             * @param {Object} config passing the $http config
             */
            postMails: function(obj, config) {
                return $http.post($rootScope.recipients, obj, config);
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:apiRecipient
             * @name deleteMail
             * @description
             * Delete single mail
             * @param {String} url API url
             * @param {Object} config passing the $http config
             */
            deleteMail: function(url, config) {
                return $http.delete(url, config);
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:apiRecipient
             * @name resultPost
             * @description
             * Promise result from post
             * @param {Object} result The success promise result from mails posting
             */
            resultPost: function(result) {
                $log.debug("resultPost");
                $log.debug(result);
                $rootScope.recipientFeedbackAdded += result.data.results.length;
                $rootScope.recipientsPercent = Math.ceil(100 * $rootScope.recipientFeedbackAdded / $rootScope.recipientFeedbackTotal);
                return result;
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:apiRecipient
             * @name calculSendingLimit
             * @description
             * Calcul a limit for the bulk post
             * @param {Number} total Mails total number to post
             */
            calculSendingLimit: function(total) {
                //var percent = Math.ceil(this.maxRecipients / total + this.maxRecipientsPercent) / 100;
                if(total > 1000) {
                    return Math.ceil(total / 4);
                }else {
                    return total;
                }
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:apiRecipient
             * @name bulkPost
             * @description
             * The bulk post to send massives mails
             * @param {Array} arr Array with mails
             */
            bulkPost: function(arr) {
                //$rootScope.recipientSpinner = true;
                $rootScope.recipientFeedbackAdded = 0;
                $rootScope.recipientsPercent = Math.ceil(100 * $rootScope.recipientFeedbackAdded / $rootScope.recipientFeedbackTotal);
                $rootScope.recipientFeedbackWording = gettextCatalog.getString("Adding");
                $rootScope.recipientFeedbackTotal = arr.length;
                this.sendingLimit = this.calculSendingLimit(arr.length);
                $log.debug("sendingLimit : " + this.sendingLimit);
                var postRequest = [];
                $log.debug("arr bulkPost");
                $log.debug(arr);
                while(arr.length !== 0) {
                    postRequest.push(this.postMails(_.take(arr, this.sendingLimit)).then(this.resultPost));
                    arr.splice(0, this.sendingLimit);
                    $log.debug(arr.length);
                }
                $log.debug(postRequest);
                return $q.all(postRequest);
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:apiRecipient
             * @name resultDelete
             * @description
             * The success promise from delete call
             * @param {Array} arr The success promise result from delete
             */
            resultDelete: function(result) {
                $log.debug(result);
                $rootScope.recipientFeedbackAdded += result.config.data.length;
                $rootScope.recipientsPercent = Math.round(100 * $rootScope.recipientFeedbackAdded / $rootScope.recipientFeedbackTotal);
                return result;
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:apiRecipient
             * @name deleteRecipients
             * @description
             * Delete recipients
             * @param {Array} arrUrl Array with all API url to delete
             */
            deleteRecipients: function(arrUrl) {
                return $http.delete($rootScope.recipients, {
                    data: arrUrl
                });
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:apiRecipient
             * @name getRecipient
             * @description
             * Get recipients limited by calculSendingLimit result
             * @param {String} url API url
             * @param {Array} arr Array use for the recursive function
             */
            getRecipient: function(url, arr) {
                var main = this;
                return $http.get(url, {
                    params: {
                        "page_size": this.calculSendingLimit($rootScope.recipientFeedbackTotal)
                    }
                }).then(function(response) {
                    $rootScope.recipientFeedbackAdded += response.data.results.length;
                    $rootScope.recipientsPercent = Math.round(100 * $rootScope.recipientFeedbackAdded / $rootScope.recipientFeedbackTotal);
                    arr = arr.concat(response);
                    if(!_.isNull(response.data.next)) {
                        return main.getRecipient(response.data.next, arr);
                    }else {
                        return arr;
                    }
                });
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:apiRecipient
             * @name getAllRecipients
             * @description
             * Get all recipients
             * @param {String} url API url
             */
            getAllRecipients: function(url) {
                $rootScope.recipientsPercent = 0;
                $rootScope.recipientFeedbackAdded = 0;
                $rootScope.recipientFeedbackWording = gettextCatalog.getString("Getting");
                if($rootScope.recipientFeedbackTotal > 1000) {
                    $rootScope.recipientSpinner = true;
                }
                return this.getRecipient(url, []);
            }
        };
    };

    module.exports = apiRecipient;
}());
