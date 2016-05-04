var Utils = IceLib.Utils,
    LocalDb = IceLib.LocalDb,
    StoredPropsList = IceLib.StoredPropsList;

var domRoot = document.querySelector('#results');

/**
* @desc Simple test function 
*/
function it(about, fn) {
  var pass, err;
  try {
    pass = (fn() == true);
  } catch (e) {
    pass = false;
    err = e;
  }
  if (pass) {
    Utils.log('log', 'Test passed: it %s', about);
  } else if (err) {
    Utils.log('error', 'Test failed: "it %s" with exception %o', about, err);
  } else {
    Utils.log('error', 'Test failed: "it %s"', about);
  }
}

function getMockStorage() {
  return {
    setItem: function(key, value) {
      this[key] = '' + value;
    }, 
    getItem: function(key) {
      return (this.hasOwnProperty(key)) ? this[key] : null;
    }
  };
}

it('should merge objects', function() {
  var o1 = {testA: 'A'},
      o2 = {testB: 'B'},
      o3 = {testC: 'C'};

  var merged = Utils.merge(o1, o2, o3);
  var hasProps = o1.hasOwnProperty('testA') && 
    o2.hasOwnProperty('testB') &&
    o3.hasOwnProperty('testC');

  return hasProps;
});

it('should remove items', function() {
  return Utils.removeItems(['a','b','c','d'], ['b','c']).length === 2;
});

it('should iterate through key / value pairs', function() {
  var object = {prop1: 1, prop2: 2, prop3: 3};
  var count = 0; 

  Utils.forEachKeyValue(object, function(key, value) {
    count+= value; 
  });
  return count === 6;
});

it('should mock localStorage get/set operations', function() {
  var storage = getMockStorage();
  storage.setItem('test', 42); 
  var storedValue = storage.getItem('test'); 
  return storedValue === "42";
});

it('should mock checking properties in localStorage', function() {
  var storage = getMockStorage();
  storage.setItem('test', 42); 
  return 'test' in storage;
});

it('should set and get numbers', function() {
  var db = new LocalDb('testObject', getMockStorage()); 
  var randomKey = 'testNumber_' + new Date().getTime();

  db.set(randomKey, 42);
  var value = db.get(randomKey);
  return value === 42;
}); 

it('should get and set objects', function() {
  var db = new LocalDb('testObject', getMockStorage()); 
  var randomKey = 'testObject_' + new Date().getTime();

  db.set(randomKey, {a: 1});
  var value = db.get(randomKey);
  return value !== null && typeof value === 'object' && value.hasOwnProperty('a');
}); 

it('should add and get stored properties', function() {
  var randomObjectName = 'objectName_' + new Date().getTime();
  var list = new StoredPropsList(randomObjectName, getMockStorage());

  list.add(['prop1','prop2','prop3']);
  var stored = list.get();
  return (stored[0] === 'prop1' && stored[1] === 'prop2' && 
    stored[2] === 'prop3');
});

it('should define initial properties', function() {
  var randomObjectName = 'object_' + new Date().getTime();
  var object = new Ice(randomObjectName, {
    testA: 'A',
    testB: undefined,
    testC: {test: 1}
  });

  if (object.testA !== 'A') {
    return false;
  }
  if (object.testB !== undefined) {
    return false;
  }
  if (object.testC.test !== 1) {
    return false;
  }
  return true;
});
