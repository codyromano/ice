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
})(IceLib, IceLib.LocalDb);