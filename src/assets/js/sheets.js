var sheets = [], filters = [];
document.addEventListener('DOMContentLoaded', function() {
  sheets = document.querySelectorAll('#sheet-list li');

  /**
   * Toggle filter.
   */
  document.querySelectorAll('[name^="filter-"]').forEach(function(input) {
    input.addEventListener('change', function(e) {
      updateFilters();
      filterSheets();
    });
  });

  /**
   * Toggle sort.
   */
  document.querySelectorAll('[name="sort').forEach(function(input) {
    input.addEventListener('change', function(e) {
      sortSheets(e.currentTarget.value);
    });
  });
});

/**
 * Filter sheet list on every keyup event on search box.
 */
function searchSheets(terms) {
  var termList = terms.toLowerCase().split(' '), match = false, itemTitle;

  sheets.forEach(function(item) {
    // Shorten target value to "Song Title (Artist Name)"
    itemTitle = getTitleForCompare(item.innerText);

    // Test if the above contains every one of space-separated terms
    match = termList.every(function(term) { return itemTitle.includes(term) });

    // Display/hide the item depending on the test result
    item.style.display = match ? '' : 'none';
  });
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
}

/**
 * Filter sheet list by radio button filters.
 */
function filterSheets() {
  var match = false;
  sheets.forEach(function(item) {
    match = filters.every(function(filter) { return item.dataset.filters.includes(filter) });
    item.classList.toggle('filtered', !match);
  });
}

/**
 * Sort sheet list.
 * Function reference: https://www.w3schools.com/howto/howto_js_sort_list.asp
 */
function sortSheets(key) {
  var sorting = true, shouldSwitch = false, i;

  while (sorting) {
    sorting = false;

    for (i = 0; i < sheets.length - 1; i++) {
      shouldSwitch = false;

      switch (key) {
        case 'title': // Title ASC
          shouldSwitch = getTitleForCompare(sheets[i].innerText) > getTitleForCompare(sheets[i + 1].innerText);
          break;

        case 'publish-date': // Date DESC
          shouldSwitch = sheets[i].dataset.published < sheets[i + 1].dataset.published;
          break;
      }

      if (shouldSwitch) {
        sheets[i].parentNode.insertBefore(sheets[i + 1], sheets[i]);
        sorting = true; // Still sorting
        break;
      }
    }

    // Update sheet list
    sheets = document.querySelectorAll('#sheet-list li');
  }
}

/**
 * Get "song title (artist name)" format text of sheet list item.
 */
function getTitleForCompare(text) {
  return text.trim().split(' - ')[0].toLowerCase();
}
