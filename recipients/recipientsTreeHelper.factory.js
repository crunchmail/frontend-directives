/**
 * @ngdoc service
 * @name recipients.factory:recipientsTreeHelper
 * @description
 * Utils function to display recipients in the tree format
 */
(function () {
    'use strict';

    var factory = function($compile){
        return {
            /**
             * @ngdoc function
             * @name compile
             * @methodOf recipients.factory:recipientsTreeHelper
             * @description
             * https://github.com/marklagendijk/angular-recursion
             * Manually compiles the element, fixing the recursion loop.
             * @param {Node} element Passing angular element
             * @param {Object} link A post-link function, or an object with function(s) registered via pre and post properties.
             * @returns {Object} An object containing the linking functions.
             */
            compile: function(element, link) {
                // Normalize the link parameter
                if(angular.isFunction(link)){
                    link = { post: link };
                }

                // Break the recursion loop by removing the contents
                var contents = element.contents().remove();
                var compiledContents;
                return {
                    pre: (link && link.pre) ? link.pre : null,
                    /**
                     * Compiles and re-adds the contents
                     */
                    post: function(scope, element){
                        // Compile the contents
                        if(!compiledContents){
                            compiledContents = $compile(contents);
                        }
                        // Re-add the compiled contents to the element
                        compiledContents(scope, function(clone){
                            element.append(clone);
                        });

                        // Call the post-linking function, if any
                        if(link && link.post){
                            link.post.apply(null, arguments);
                        }
                    }
                };
            }
        };
    };

    module.exports = factory;
}());
