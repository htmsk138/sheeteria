var views = [], sheets = [], keywords = '', filters = [], noMatchMsg = null, viewSelector = '.sheet-list', itemSelector = '.sheet-item';
document.addEventListener('DOMContentLoaded', function() {
  views = document.querySelectorAll(viewSelector);
  sheets = document.querySelectorAll(itemSelector);
  noMatchMsg = document.getElementById('nomatch');

  // Display NEW labels
  displayNew();

  /**
   * Toggle filter.
   */
  document.querySelectorAll('[name^="filter-"]').forEach(function(input) {
    input.addEventListener('change', function(e) {
      updateFilters();
    });
  });

  /**
   * Toggle sort.
   */
  document.querySelectorAll('[name="sort').forEach(function(input) {
    input.addEventListener('change', function(e) {
      sortSheets();
    });
  });

  /**
   * Switch view.
   */
  document.querySelectorAll('[name="view').forEach(function(input) {
    input.addEventListener('change', function(e) {
      switchView();
    });
  });
});

/**
 * Filter sheet list on every keyup event on search box.
 */
function searchSheets(terms) {
  keywords = terms;
  var termList = terms.toLowerCase().split(' '), match = false, itemTitle;

  sheets.forEach(function(item) {
    // Test if the song title and artist name contains every one of space-separated terms
    var keyword = item.dataset.ttl.concat(' ', item.dataset.art);
    match = termList.every(function(term) { return keyword.includes(term) });

    // Display/hide the item depending on the test result
    item.style.display = match ? '' : 'none';
  });

  handleNoMatch();
}

/**
 * Update filter list with checked options.
 */
function updateFilters() {
  filters = [];
  var selected = document.querySelectorAll('[name^="filter-"]:checked');
  selected.forEach(function(input) {
    if ('all' !== input.value) {
      filters.push(input.value);
    }
  });

  filterSheets();
}

/**
 * Filter sheet list by radio button filters.
 */
function filterSheets() {
  var match = false;
  sheets.forEach(function(item) {
    match = filters.every(function(filter) { return item.dataset.f.includes(filter) });
    item.classList.toggle('filtered', !match);
  });

  handleNoMatch();
}

/**
 * Sort sheet list.
 * Function reference: https://www.w3schools.com/howto/howto_js_sort_list.asp
 */
function sortSheets() {
  var key = document.querySelector('[name="sort"]:checked').value, currentVal, nextVal;

  views.forEach(function(view) {
    var sorting = true, shouldSwitch = false, i, sheetsInView;

    while (sorting) {
      sheetsInView = view.querySelectorAll(itemSelector);
      sorting = false;

      for (i = 0; i < sheetsInView.length - 1; i++) {
        shouldSwitch = false;

        // Ignore first 'the' when comparing
        currentVal = sheetsInView[i].dataset[key].replace(/^the /, '');
        nextVal = sheetsInView[i + 1].dataset[key].replace(/^the /, '');

        // For DESC sort
        if (key === 'pd') {
          shouldSwitch = currentVal < nextVal;

        // For ASC sort
        } else {
          shouldSwitch = currentVal > nextVal;
        }

        if (shouldSwitch) {
          break;
        }
      }

      if (shouldSwitch) {
        sheetsInView[i].parentNode.insertBefore(sheetsInView[i + 1], sheetsInView[i]);
        sorting = true; // Still sorting
      }
    }

    // Update sheet list
    sheets = document.querySelectorAll(itemSelector);
  });
}

/**
 * Check if there's no search result and show/hide the message.
 */
function handleNoMatch() {
  var anyMatch = Array.from(sheets).some(function(item) { return item.offsetParent !== null });
  noMatchMsg.style.display = anyMatch ? 'none' : '';
}

/**
 * Display NEW label on products published within specified amount of days.
 */
function displayNew() {
  // Get date from X days ago and format to YYYYMMDD string
  var newDays = 7;
  var aWeekAgo = new Date(Date.now() - (1000 * 60 * 60 * 24) * newDays);
  var aWeekAgoStr = aWeekAgo.toISOString().slice(0,10);

  // NEW label element to display
  var newLabel = document.createElement('span');
  newLabel.classList.add('new');
  newLabel.innerHTML = 'NEW';

  sheets.forEach(function(item) {
    if (item.dataset.pd > aWeekAgoStr) {
      item.querySelector('a').before(newLabel.cloneNode(true));
    }
  });
}

/**
 * Switch between table/list views.
 */
function switchView() {
  views.forEach(function(view) {
    view.hidden = !view.hidden;
  });
}