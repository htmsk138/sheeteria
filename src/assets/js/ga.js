// Init
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-08C8RZF3X1');

// Track outbound link clicks
document.addEventListener('DOMContentLoaded', function() {
	document.querySelectorAll('a[data-label]').forEach(function(link) {
		link.addEventListener('click', function(e) {
			gtag('event', 'click', {
				'event_category': 'outbound',
				'event_label': e.currentTarget.dataset.label,
				'transport_type': 'beacon',
			});
		});
  });
});

// Track search terms
function trackSearch(term) {
  if (term) {
    gtag('event', 'search', {
      'search_term': term,
      'transport_type': 'beacon',
    });
  }
}