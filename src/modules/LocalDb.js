var IceLib = IceLib || {};
/**
* @module LocalDb
* @desc Get and set values in localStorage and remember their types.
* Values are parsed with the correct type as you retrieve them. 
*/

(function(exports) {
  'use strict';

  /**
  * @param {String} dbName A namespace for localStorage
  * @returns {Object}
  */
  function LocalDb(dbName, mockStorage) {
    this.prefix = dbName;
    this.storage = mockStorage || window.localStorage; 
    this.valueTypeFlag = ':type';
  }

  // Get the key used to identify values in localStorage
  LocalDb.prototype.getKey = function(key) {
    return [this.prefix, key].join(':');
  };

  /**
  * @desc Map data types to parser functions 
  */
  LocalDb.prototype.parseValueByType = {
    'undefined' : function(val) {
      return undefined;
    },
    'number' : function(val) {
      return parseFloat(val);
    },
    'string' : function(val) {
      return '' + val;
    },
    'object' : function(val, key) { 
      if (val === null) {
        return null;
      }
      try {
        var parsed = JSON.parse(val); 
        return parsed;
      } catch (e) {
        Utils.log('error', 'Error parsing object for %s.%s: %o',
         this.prefix, key, e);
      } 
    }
  };

  LocalDb.prototype.exists = function(key) {
    return this.getKey(key) in this.storage;
  };

  LocalDb.prototype.get = function(key, ignoreType) {
    /* Find the keys that correspond to this value in local storage.
    There should be one for the value and one for the data type */
    var valueKey = this.getKey(key),
        value = this.storage.getItem(valueKey),
        typeKey = valueKey + this.valueTypeFlag,
        type = this.storage.getItem(typeKey),
        parseMethod = this.parseValueByType[type]; 

    if (ignoreType === true) {
      return value;
    }
    if (parseMethod) {
      return parseMethod(value, key);
    }
    Utils.log('warn', 'Data type of %s.%s is unknown. Returning value as ' +
    'a string.', this.prefix, key);
    return value; 
  };

  LocalDb.prototype.set = function(key, value, ignoreType) {
    ignoreType = (typeof ignoreType === 'boolean') ? ignoreType : false;
    var valueType = typeof value, parsedValue; 

    if (valueType === 'object') {
      parsedValue = JSON.stringify(value);
    }

    this.storage.setItem(this.getKey(key), parsedValue || value);
    if (ignoreType !== true) {
      this.storage.setItem(this.getKey(key) + this.valueTypeFlag, valueType);
    }
  };

  exports.LocalDb = LocalDb;
})(IceLib);
