var sheets = [];
document.addEventListener('DOMContentLoaded', function() {
  sheets = document.querySelectorAll('#sheet-list li');
});

/**
 * Filter sheet list on every keyup event on search box.
 */
function filterSheets(terms) {
  var termList = terms.toLowerCase().split(' '), match = false, itemTitle;

  sheets.forEach(function(item) {
    // Shorten target value to "Song Title (Artist Name)"
    itemTitle = item.innerText.split(' - ')[0].toLowerCase();

    // Test if the above contains every one of space-separated terms
    match = termList.every(function(term) { return itemTitle.includes(term) });

    // Display/hide the item depending on the test result
    item.style.display = match ? '' : 'none';
  });
}
