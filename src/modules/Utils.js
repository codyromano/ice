var IceLib = {};

/**
* @module Utils
*/
(function(exports) {
  var Utils = {
    /**
    * @desc Combine any number of objects
    * @returns {Object}
    */
    merge: function() {
      var objectsArray = Array.prototype.slice.call(arguments);
      return objectsArray.reduce(function(result, object) {
        for (var key in object) {
          result[key] = object[key];
        }
        return result;
      }, {});
    },
    /**
    * @param {Array}
    * @param {Array}
    * @returns {Array}
    */
    removeItems: function(array, items) {
      items.forEach(function(item) {
        var i; 
        while ((i = array.indexOf(item)) !== -1) {
          array.splice(i, 1);
        }
      });
      return array;
    },
    /**
    * @desc Simple abstraction for console logging
    * @param {String} severity warn|log|debug|info|error
    */
    log: function(severity) {
      severity = severity || 'log';
      /* Convert args list to array. Slice off severity because we 
      don't want to pass it as an argument to the console */
      var args = Array.prototype.slice.call(arguments, 1);
      if (console && severity in console) {
        console[severity].apply(console, args);
      }
    },
    /**
    * @returns {Object}
    */
    forEachKeyValue: function(object, callback) {
      for (var key in object) {
        callback(key, object[key]);
      }
      return object;
    }
  };

  exports.Utils = Utils;
})(IceLib);
