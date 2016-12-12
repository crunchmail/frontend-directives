/**
 * @ngdoc service
 * @name _factory.factory:sessionStorage
 * @description
 * Session storage to save item
 */
(function () {
	'use strict';
    //TODO check browsers compatibility

	var service = function(){
		return {
            /**
             * @ngdoc function
             * @methodOf _factory.factory:sessionStorage
             * @name set
             * @description
             * Save a item in session storage
             * @param {String} key The key to access
             */
            set: function(key, value) {
                sessionStorage.setItem(key, value);
            },
            /**
             * @ngdoc function
             * @methodOf _factory.factory:sessionStorage
             * @name get
             * @description
             * Get our item from session storage
             * @param {String} key The key to access
             */
            get: function(key) {
                return sessionStorage.getItem(key);
            },
            /**
             * @ngdoc function
             * @methodOf _factory.factory:sessionStorage
             * @name remove
             * @description
             * remove our item from session storage
             * @param {String} key The key to access
             */
            remove: function(key) {
                sessionStorage.removeItem(key);
            }
		};
	};

	module.exports = service;
}());
