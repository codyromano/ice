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
var IceLib = IceLib || {};

/**
* @module StoredPropsList
*/
(function(exports, LocalDb) {
  'use strict';

  function StoredPropsList(objectName, mockStorage) {
    this.db = new LocalDb(objectName, mockStorage);
    this.manifestKey = '_ice_manifest_';
    this.delimiter = ':';
  }

  StoredPropsList.prototype.set = function(propsArray) {
    this.db.set(this.manifestKey, propsArray.join(this.delimiter), true);
  };

  StoredPropsList.prototype.add = function(propsArray) {
    var list = this.get();

    propsArray.forEach(function(prop) {
      if (list.indexOf(prop) === -1) {
        list.push(prop);
      }
    });
    this.set(list);
    return list;
  };

  StoredPropsList.prototype.get = function() {
    var listStr = this.db.get(this.manifestKey, true);
    if (listStr) {
      return listStr.split(this.delimiter);
    }
    return [];
  };

  exports.StoredPropsList = StoredPropsList;
})(IceLib, IceLib.LocalDb);/**
* @module Ice 
* @author Cody Romano
*
* @desc Ice makes it easier to persist objects in localStorage. To save an
* object, pass it as an argument to the constructor. Ice will return a plain 
* object. You can set properties of that object directly. Ice will detect 
* changes and save them in localStorage. It will also respect data types. 
* By default all values that you save in localStorage will be returned as 
* strings. With Ice, if you save a number, you'll get back a number.
*/
(function(exports, Utils, StoredPropsList, LocalDb) {
  'use strict';

  function addPersistentProperty(db, object, preferStored, key, value) {
    var _value; 

    // Whether or not the value in localStorage should take precedence 
    // over the provided value. preferStored will be false in the 
    // case of adding new properties
    preferStored = (typeof preferStored === 'boolean') ? preferStored : true; 

    if (db.exists(key) && preferStored) {
      _value = db.get(key); 
    } else {
      _value = value; 
      db.set(key, _value);
    }

    Object.defineProperty(object, key, {
      // configurable = false means the property cannot be deleted 
      // directly. Use the Ice._remove method instead
      configurable: false, 
      enumerable: true, 
      set: function(newValue) {
        db.set(key, newValue);
        _value = newValue; 
      },
      get: function() {
        return _value;
      }
    });
    return object;
  }

  function Ice(objectName, initialProps) {
    initialProps = initialProps || {};

    if (typeof objectName !== 'string' || !objectName.length) {
      throw new Error('Object name must be a non-empty string.');
    }
    if (typeof initialProps !== 'object') {
      throw new Error('initialProps must be an object.');
    }
    // A manifest of properties associated with this object
    this.propsList = new StoredPropsList(objectName);

    // Abstraction for localStorage that also handles parsing of types
    this.db = new LocalDb(objectName);

    // Define the object with its initial properties
    this._define(initialProps);
  }

  /**
  * @desc Define an object with a set of initial properties. If values exist
  * in local storage, the stored values will override the values provided
  * via 'props'.
  * @param {Object}
  */
  Ice.prototype._define = function(props) {
    props = props || {};
    var _self = this;

    // Add the given properties to the manifest if they don't already exist
    this.propsList.add(Object.keys(props));

    // Check for properties that are not in 'props' but exist in local storage
    this.propsList.get().forEach(function(propName) {
      if (_self.db.exists(propName)) {
        props[propName] = _self.db.get(propName);
      }
    });

    //var addPropMethod = addPersistentProperty.bind(null, db, props, true);
    var addPropMethod = addPersistentProperty.bind(this, this.db, this, true);
    Utils.forEachKeyValue(props, addPropMethod);
    return props;
  };

  /**
  * @desc Add one or more properties to an Ice object or update the 
  * properties if they exist. The key difference between '_add' and '_define'
  * is that '_add' will overwrite values in local storage.
  * @param {Object}
  */
  Ice.prototype._add = function(props) {
    this.propsList.add(Object.keys(props));

    var addPropMethod = addPersistentProperty.bind(this, this.db, this, false);
    Utils.forEachKeyValue(props, addPropMethod);
    return props;
  };

  Ice.prototype._remove = function(keys) {
    var props = this.propsList.get();

    // If no argument is provided, remove all keys
    if (keys === undefined) {
      return this.propsList.set([]);
    }
    // For convenience, Ice allows a single key to be provided as a string
    keys = (typeof keys === 'string') ? [keys] : keys;

    // Remove the keys from the manifest of stored properties
    var newPropsList = Utils.removeItems(props, keys);
    this.propsList.set(newPropsList);
  };

  exports.Ice = Ice;
})(window, IceLib.Utils, IceLib.StoredPropsList, IceLib.LocalDb);
