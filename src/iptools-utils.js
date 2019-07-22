/*jshint -W098 */
(function() {
  'use strict';

  var iptUtils = function() {

    // private properties
    var htmlNode = document.querySelector('html');
    var breakpointsArray = [];
    var breakpointsValuesArray = [];
    var cachedBreakpointsHeight = -1;
    var cachedBreakpointsObject = {};

    var classes = {
      isTouch: 'is-touch',
      enableHover: 'hover',
      isIPhone: 'is-iphone',
      mediaQueriesDetectors: 'media-queries-detectors',
      mediaQueriesDetector: 'media-queries-detectors__detector'
    };

    var selectors = {
      mediaQueriesDetectors: '.media-queries-detectors',
      mediaQueriesDetector: '.media-queries-detectors__detector'
    };

    // private methods

    var isTouchDevice = function() {
      return 'ontouchstart' in window || navigator.maxTouchPoints;
    };

    // @TODO evaluate http://detectmobilebrowsers.com/
    var isMobile = function() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    var isIPhone = function() {
      return navigator.platform === 'iPhone';
    };

    var toggleHoverAbility = function(force) {
      var toggle = typeof force !== 'undefined' ?
        !!force :
        htmlNode.classList.contains(classes.enableHover) ? false : true;

      htmlNode.classList.toggle(classes.enableHover, toggle);
    };

    htmlNode.classList.toggle(classes.isTouch, !!isTouchDevice());
    htmlNode.classList.toggle(classes.isIPhone, !!isIPhone());
    toggleHoverAbility(!isTouchDevice());

    var createMediaQueriesDetectors = function() {
      var container = document.createElement('div');
      container.classList.add(classes.mediaQueriesDetectors);
      document.querySelector('body').appendChild(container);
    };

    // public API
    return {

      // public property
      //myPublicProperty: 'foo',

      /**
       * Returns a list of namespaced events
       * @param {(String|String[])} events - valid event name
       * @param {String} namespace - valid namespace for events
       * @returns {String} list of namespaced events
       */
      getNamespacedEvents: function(events, namespace) {
        if (!(events instanceof Array) && typeof events !== 'string') {
          throw new Error('parameter events is not of type Array or String');
        }
        if (typeof events === 'string' && (events.indexOf(' ') !== -1 || events.indexOf('.') !== -1)) {
          throw new Error('parameter events is invalid, contains " " or "."');
        }
        if (events instanceof Array) {
          events.map(function(event) {
            if (typeof event !== 'string' || (event.indexOf(' ') !== -1 || event.indexOf('.') !== -1)) {
              throw new Error('parameter events is invalid, contains " " or "."');
            }
          });
        }
        if (typeof namespace !== 'string') {
          throw new Error('parameter namespace is not of String');
        }
        if (namespace.indexOf(' ') !== -1 || namespace.indexOf('.') !== -1) {
          throw new Error('parameter namespace is invalid, contains " " or "."');
        }

        return events instanceof Array ?
          events.join('.' + namespace + ' ') + '.' + namespace :
          events + '.' + namespace;
      },

      deviceDetection: {

        isTouchDevice: !!isTouchDevice(),

        isIPhone: !!isIPhone(),

        isMobile: !!isMobile(),

        toggleHoverAbility: function(force) {
          toggleHoverAbility(force);
        },

        isMediaQuery: function(mediaQuery) {
          var currentMediaQueries = this.getMediaQueries();
          var isActive = false;

          if (currentMediaQueries.hasOwnProperty(mediaQuery)) {
            isActive = currentMediaQueries[mediaQuery];
          } else {
            throw new Error('Media query ' + mediaQuery + ' does not exist.');
          }
          return isActive;
        },

        getMediaQueriesArray: function() {

          var mediaQueriesDetectors = document.querySelectorAll(selectors.mediaQueriesDetectors);

          if (mediaQueriesDetectors.length === 0) {
            createMediaQueriesDetectors();
          }

          if (breakpointsArray.length === 0) {
            breakpointsArray = window.getComputedStyle(
              document.querySelectorAll(selectors.mediaQueriesDetectors)[0],
              '::before'
            )
              .getPropertyValue('content')
              .replace(/'*"*/g, '')
              .split('|');
          }

          if (breakpointsValuesArray.length === 0) {
            breakpointsValuesArray = window.getComputedStyle(
              document.querySelectorAll(selectors.mediaQueriesDetectors)[0],
              '::after'
            )
              .getPropertyValue('content')
              .replace(/'*"*/g, '')
              .split('|');
          }

          var breakpointsList = {};

          for (var i = 0; i < breakpointsArray.length; i++) {
            breakpointsList[breakpointsArray[i]] = breakpointsValuesArray[i];
          }

          return breakpointsList;
        },

        /**
         * Returns a list of existing and active media queries
         * @returns {Object} list of existing media queries with boolean value denoting their active status
         */
        getMediaQueries: function() {
          var mediaQueriesDetectorsExists = true;
          var mediaQueriesDetectors = document.querySelectorAll(selectors.mediaQueriesDetectors);

          if (mediaQueriesDetectors.length === 0) {
            mediaQueriesDetectorsExists = false;

            createMediaQueriesDetectors();
          }

          mediaQueriesDetectors = document.querySelectorAll(selectors.mediaQueriesDetectors)[0];

          if (breakpointsArray.length === 0) {
            breakpointsArray = window.getComputedStyle(
              document.querySelectorAll(selectors.mediaQueriesDetectors)[0],
              '::before'
            )
              .getPropertyValue('content')
              .replace(/'*"*/g, '')
              .split('|');
          }

          if (document.querySelectorAll(selectors.mediaQueriesDetector).length === 0) {
            for (var i = 1; i <= breakpointsArray.length; i++) {
              var detector = document.createElement('div');
              detector.classList
                .add(classes.mediaQueriesDetector, classes.mediaQueriesDetector + '--' + i);
              mediaQueriesDetectors
                .appendChild(detector);
            }
          }

          var detectedHeight = mediaQueriesDetectors.offsetHeight;

          if (detectedHeight === cachedBreakpointsHeight) {
            return cachedBreakpointsObject;
          } else {
            cachedBreakpointsHeight = detectedHeight;
            // consult the SCSS file for an explanation why/how the following code works
            var detectedHeightBinaryArray = detectedHeight.toString(2).split('').reverse();
            var resultObject = {};

            for (var j = 0; j < breakpointsArray.length; j++) {
              resultObject[breakpointsArray[j]] = detectedHeightBinaryArray[j] === '1';
            }

            cachedBreakpointsObject = resultObject;
            return resultObject;
          }
        }
      }
    };
  };

  window.iptUtils = iptUtils();

})();
