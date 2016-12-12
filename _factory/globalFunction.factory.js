/**
 * @ngdoc service
 * @name _factory.factory:globalFunction
 * @description
 * Catch all request, response and error api call
 * @requires appSettings
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires Lodash
 */
(function () {
    'use strict';

    var factory = function(appSettings, $log, _) {
        return {
            /**
             * @ngdoc function
             * @name roundToTwo
             * @methodOf _factory.factory:globalFunction
             * @param {Number} num number to convert
             * @description return a decimal number with 2 decimal
             */
            roundToTwo: function (num) {
                return +(Math.round(num + "e+2")  + "e-2");
            },
            /**
             * @ngdoc function
             * @name convertPercent
             * @methodOf _factory.factory:globalFunction
             * @param {Number} number number to convert
             * @param {Number} numberMax number Max, use for the convertion
             * @description Convert in percent
             */
            convertPercent: function (number, numberMax) {
                return Math.round((parseFloat(number) / parseFloat(numberMax)) * 100);
            },
            /**
             * @ngdoc function
             * @name convertDegre
             * @methodOf _factory.factory:globalFunction
             * @param {Number} value value to convert
             * @description Convert in degre
             */
            convertDegre: function (value) {
                return this.roundToTwo((parseFloat(value)*360)/100);
            },
            /**
             * @ngdoc function
             * @name insertIframe
             * @methodOf _factory.factory:globalFunction
             * @param {Node} iframeHtml Element html to convert
             * @param {String} iframeSelector Selector to append our iframe
             * @description Create a iframe with html content and insert it in a container
             */
            insertIframe: function(iframeHtml, iframeSelector) {
                var iframe = document.querySelector(iframeSelector);
                var html_string = iframeHtml;

                var iframedoc = iframe.document;
                if (iframe.contentDocument)
                {
                    iframedoc = iframe.contentDocument;
                }
                else if (iframe.contentWindow)
                {
                    iframedoc = iframe.contentWindow.document;
                }

                if (iframedoc){
                    // Put the content in the iframe
                    iframedoc.open();
                    iframedoc.writeln(html_string);
                    iframedoc.close();

                    iframe.addEventListener("load", function() {
                        iframe.style.height = iframedoc.body.scrollHeight + 8 + 'px';
                    });
                    // 8 size of border
                    iframe.style.height = iframedoc.body.scrollHeight + 8 + 'px';

                } else {
                    //just in case of browsers that don't support the above 3 properties.
                    //fortunately we don't come across such case so far.
                    console.warn('Cannot inject dynamic contents into iframe.');
                }
            },
            /**
             * @ngdoc function
             * @name getMaxOfArray
             * @methodOf _factory.factory:globalFunction
             * @param {Array} numArray Array
             * @description
             * Return max value in array
             */
            getMaxOfArray: function(numArray) {
                return Math.max.apply(null, numArray);
            },
            /**
             * @ngdoc function
             * @name crossProduct
             * @methodOf _factory.factory:globalFunction
             * @param {Number} data Enter data
             * @param {Number} valueMax Value max
             * @param {Number} refValue Reference value
             * @description
             * Basic cross product
             */
            crossProduct: function(data, valueMax, refValue) {
                if(valueMax === 0) {
                    return 0;
                }else {
                    return (parseFloat(data) * refValue) / parseFloat(valueMax);
                }
            },
            /**
             * @ngdoc function
             * @name convertTiming
             * @methodOf _factory.factory:globalFunction
             * @param {Number} value Enter data
             * @description
             * [Better use moment.js] Convert duration
             */
            convertTiming: function(value) {
                var seconds = value % 60;
                var min = parseInt(value/60)%60;
                var hours =  parseInt(value/3600)%24;
                var result = '';
                if(hours > 0) {
                    result += hours + "h ";
                }
                if(min > 0) {
                    result += min + "min ";
                }
                result += seconds + "s ";
                return result;
            },
            /**
             * @ngdoc function
             * @name closest
             * @methodOf _factory.factory:globalFunction
             * @param {Node} el Element to find
             * @param {String} classParent ClassParent to find our element
             * @description
             * Find a element with a class
             */
            closest : function(el, classParent) {
                while ((el = el.parentElement) && !el.classList.contains(classParent)) {}
                return el;
            },
            /**
             * @ngdoc function
             * @name componentToHex
             * @methodOf _factory.factory:globalFunction
             * @param {Number} c Number to convert
             * @description
             * Convert to hexadecimal
             */
            componentToHex: function (c) {
                var hex = parseFloat(c).toString(16);
                return hex.length === 1 ? "0" + hex : hex;
            },
            /**
             * @ngdoc function
             * @name rgbToHex
             * @methodOf _factory.factory:globalFunction
             * @param {Number} r red color
             * @param {Number} g green color
             * @param {Number} b blue color
             * @description
             * Convert rgb color to hexadecimal
             */
            rgbToHex: function (r, g, b) {
                var hexColor = "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
                return hexColor.toUpperCase();
            },
            /**
             * @ngdoc function
             * @name convertToNode
             * @methodOf _factory.factory:globalFunction
             * @param {Number} element Element to convert
             * @description
             * Convert rgb color to hexadecimal
             */
            convertToNode: function(element) {
                var docNode = null;
                if (typeof element === "string") {
                    if (window.DOMParser) {
                        var parser = new DOMParser();
                        docNode = parser.parseFromString(element,"text/xml");
                    } else { // Microsoft strikes again
                        docNode = new ActiveXObject("Microsoft.XMLDOM");
                        docNode.async = false;
                        docNode.loadXML(element);
                    }
                    element = docNode.firstChild;
                }
                return element;
            },
            /**
             * @ngdoc function
             * @name lessifyColor
             * @methodOf _factory.factory:globalFunction
             * @param {Object} obj Get color object
             * @description
             * Convert to less color
             * @return {String} Return less colors
             */
            lessifyColor: function(obj) {
                var stringifyStyle = '';

                var objColors = obj;
                _.forOwn(objColors, function(v, k) {
                    stringifyStyle += '@'+k+':'+objColors[k].color+'; ';
                });

                return stringifyStyle;
            },
            /**
             * @ngdoc function
             * @name format
             * @methodOf _factory.factory:globalFunction
             * @param {Node} node Element to convert
             * @description
             * Convert to correct format, use un createContactForm directive
             */
            format: function(node, level) {
                var that = this;
                var indentBefore = new Array(level++ + 1).join('  '),
                    indentAfter  = new Array(level - 1).join('  '),
                        textNode;

                        for (var i = 0; i < node.children.length; i++) {
                            textNode = document.createTextNode('\n' + indentBefore);
                            node.insertBefore(textNode, node.children[i]);
                            that.format(node.children[i], level);
                            if (node.lastElementChild === node.children[i]) {
                                textNode = document.createTextNode('\n' + indentAfter);
                                node.appendChild(textNode);
                            }
                        }
                return node;
            },
            /**
             * @ngdoc function
             * @name generateUUID
             * @methodOf _factory.factory:globalFunction
             * @description
             * Generate a UUID
             */
            generateUUID: function() {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
                }
                return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
            }
        };
    };

    module.exports = factory;
}());
