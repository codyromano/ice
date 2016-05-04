/**
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
    // Allow consumers to call Ice without constructor instantiation. 
    // It's nicer to use when you don't have to use 'new' all the time
    if ((this instanceof Ice) === false) {
      return new Ice(objectName, initialProps); 
    }
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
