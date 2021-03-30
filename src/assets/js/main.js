var sheets = [];
document.addEventListener('DOMContentLoaded', function() {
  sheets = document.querySelectorAll('#sheet-list li');
});

function filterSheets(terms) {
  var termList = terms.toLowerCase().split(' ');
  sheets.forEach(function(item) {
    item.style.display = termList.every(function(term) { return item.innerText.split(' - ')[0].toLowerCase().includes(term) }) ? '' : 'none';
  });
}
