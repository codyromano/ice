(function() {
  'use strict';

  // References to demo UI elements
  var $todoList = $('#todo-list'),
      $itemForm = $('[name=addItem]'),
      $itemContentInput = $('[name=newItem]'),
      itemTemplateHtml = $('#item-template').html();

  // This is where all of our list items will be stored
  var items = Ice('items', {list: []});

  /* When you push elements to items.list, the array will automatically
  be saved in localStorage. You don't have to do anything to retrieve
  the stored data. Here we are iterating through items.list to render
  any items that exist from previous page visits. */
  items.list.forEach(renderItem);

  $itemContentInput.focus(); 
  // Add an item to the list when the form is submitted
  $itemForm.submit(function(ev) {
    ev.preventDefault(); 
    var content = $itemContentInput.val(); 

    if (content.length) {
      addItem(content);
      $itemContentInput.val('');
    }
  });

  function renderItem(item) {
    var $temp = $(itemTemplateHtml),
        $checkbox = $temp.find('.item-checkbox');

    $checkbox.attr('checked', item.completed);
    $temp.find('.item-content').text(item.content);

    if (item.completed) {
      $temp.addClass('item-completed');
    }

    // Toggle item completion status 
    $checkbox.click(updateItem.bind(null, $temp, item));
    // Remove the item 
    $temp.find('.item-remove-btn').click(removeItem.bind(null, $temp, item));
    $todoList.append($temp);
  }

  function getListItemIndexById(itemId) {
    for (var i=0, l=items.list.length; i<l; i++) {
      if (items.list[i].id === itemId) {
        return i; 
      }
    }
  }

  function removeItem($container, item) {
    var index = getListItemIndexById(item.id);

    var newList = items.list; 
    newList.splice(index, 1); 
    items.list = newList;

    $container.remove();
  }

  function updateItem($container, item) {
    var index = getListItemIndexById(item.id);

    var newList = items.list; 
    newList[index].completed = !newList[index].completed; 
    items.list = newList;

    var method = (newList[index].completed) ? 'addClass' : 'removeClass'; 
    $container[method]('item-completed');
  }

  function addItem(content) {
    var newItem = {
      content: content,
      completed: false, 
      // Not perfect, but unique enough for this use case
      id: new Date().getTime()
    };

    items.list = items.list.concat(newItem);
    renderItem(newItem);
  }
})(); 
