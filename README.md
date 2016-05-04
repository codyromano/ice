# Ice.js
![](http://i.imgur.com/08Q84zC.jpg)
## Life is too short for managing state

Don't spend another moment writing code to persist data on the client side.

Ice extends native JavaScript objects to make them persistent. You can change the properties of an Ice object using dot notation, as if you were dealing with a plain object, and your changes will persist in the browser.

### Installing

Check out the repo:
```
git clone https://github.com/codyromano/ice.git
```
Run the example code in your browser: 
```
cd ice && sh bundle.sh && open example.html 
```

### Why Ice?

Let's say you have the following state in your app:
```
var searchResults = {
  page: 2,
  currentPageTitle: 'My page',
  ...
};
```
To persist this state locally, you might do this:
```
window.localStorage.setItem('searchResults', JSON.stringify(searchResult));
```
And to retrieve it: 
```
var storedString = window.localStorage.getItem('searchResults'),
    searchResults = JSON.parse(storedString); 
```
That's a pain. Even if you have helper functions to abstract local storage, you have to implement those helpers. If you're not careful, your object can easily fall out of sync with the stored data. Ice manages all of these local storage operations on your behalf. 

### Creating an Ice object

Using Ice, you define objects like this: 
```
var searchResults = new Ice('searchResults', {
  page: 2,
  itemsPerPage: 20,
  currentPageTitle: 'My test'
}); 
```
### Setting and getting properties
Now you can work with `searchResults` as if it were a plain object. As you change properties, values will be automatically saved and retrieved from `localStorage`. To change the page number... 
```
searchResults.page = 3; 
```
If you reload the page and refer to `page` using dot notation, the change remains:
```
console.log(searchResults.page); // 3
```
Ice recognizes that a new value for `page` exists in local storage. It overrides the original value, `2`, with the stored property. **Note that Ice parses data according to its original type.** localStorage may convert your number to a string, but Ice will return it as a number. The same goes for objects. In general, what you give is what you get. (Doesn't that sound philosophical?)

### Adding and removing properties
To update an existing property, just use dot notation. To add properties to an object that you've already defined, you have to call `_add`: 
```
searchResults._add({
  newProperty: 'myNewProperty', 
  otherProp: 42
}); 
```
To remove a property, call `_remove`: 
```
searchResults._remove('newProperty'); // Remove a single property
```
Or: 
```
searchResults._remove(['newProperty', 'otherProp']); // Remove multiple properties
```
### Changing the localStorage backend
By default Ice uses `window.localStorage` for persisting data. You can override this behavior with custom methods:
```
searchResults.db.storage.getItem = function(key) {...your custom getter...}; 
searchResults.db.storage.setItem = function(key, value) { ...your custom setter...};
```
