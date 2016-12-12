(function () {
    //TODO: rename file
    'use strict';

  var doorBell = function(apiUser, appSettings, $routeParams, $rootScope, $log, gettextCatalog, $timeout, $compile) {
    return {
      template: "<script></script>",
      replace:true,
      link: function(scope, element, attrs) {
          var scriptDoorBell = "window.doorbellOptions = {"+
              "appKey: 'mYq0tN52jreCmKPLLv7nHjXr0nMoLqRZ0APeZBU2OJLzKWj6zvupfw3mBjdXPE7y',"+
              "strings: {"+
                  "'feedback-button-text': '"+
                  'Feedback'+"',"+
                  "'title': '"+
                  'Feedback'+"',"+
                  "'feedback-textarea-placeholder': '"+
                  gettextCatalog.getString('Send-us your suggestions, comments...')+"',"+
                  "'email-input-placeholder': '"+
                  gettextCatalog.getString('Please fill in your email...')+"',"+
                  "'attach-a-screenshot': '"+
                  gettextCatalog.getString('Add a screenshot')+"',"+
                  "'submit-button-text': '"+
                  gettextCatalog.getString('Send')+"',"+
                  "'message-success' : '"+
                  gettextCatalog.getString('Thanks, your message is send !')+"',"+
                  "'message-error-missing-email': '"+
                  gettextCatalog.getString('Please fill in the email field')+"',"+
                  "'message-error-invalid-email': '"+
                  gettextCatalog.getString('Your email is on error')+"',"+
                  "'message-error-missing-message': '"+
                  gettextCatalog.getString('Please fill in the message field')+"',"+
                  "'message-error-message-too-short': '"+
                  gettextCatalog.getString('Your message is too short')+"'"+
              "}"+
          "};"+
          "(function(w, d, t) {var hasLoaded = false;function l() { if (hasLoaded) { return; } hasLoaded = true; window.doorbellOptions.windowLoaded = true; var g = d.createElement(t);g.id = 'doorbellScript';g.type = 'text/javascript';g.async = true;g.src = 'https://embed.doorbell.io/button/2456?t='+(new Date().getTime());(d.getElementsByTagName('head')[0]||d.getElementsByTagName('body')[0]).appendChild(g); }if (w.attachEvent) { w.attachEvent('onload', l); } else if (w.addEventListener) { w.addEventListener('load', l, false); } else { l(); }if (d.readyState == 'complete') { l(); }}(window, document, 'script'));";

          element.append(scriptDoorBell);
      }
    };
  };

  module.exports = doorBell;

}());
