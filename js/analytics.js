/**
 * The Reading Nook - shared Firebase + analytics loader
 * Load with a plain <script src="…/js/analytics.js"></script> on any page.
 * Provides: rnTrack(name, params), rnSaveOrder(order)
 */
(function () {
  if (window.__rnAnalyticsLoaded) return;
  window.__rnAnalyticsLoaded = true;

  var V = '10.14.0';
  var CDN = 'https://www.gstatic.com/firebasejs/' + V + '/';
  var self = document.currentScript && document.currentScript.src;
  var JS_ROOT = self ? self.replace(/analytics\.js.*$/, '') : 'js/';
  var queue = [];
  var ready = false;

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src; s.async = false;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('Failed to load ' + src)); };
      document.head.appendChild(s);
    });
  }

  function flush() {
    ready = true;
    queue.splice(0).forEach(function (fn) { try { fn(); } catch (e) {} });
  }

  window.rnTrack = function (name, params) {
    var run = function () {
      try { if (typeof analytics !== 'undefined' && analytics) analytics.logEvent(name, params || {}); } catch (e) {}
    };
    ready ? run() : queue.push(run);
  };

  window.rnSaveOrder = function (order) {
    return new Promise(function (resolve) {
      var run = function () {
        try {
          if (typeof database === 'undefined' || !database) return resolve(false);
          database.ref('orders/' + order.orderId).set(order)
            .then(function () { resolve(true); })
            .catch(function () { resolve(false); });
        } catch (e) { resolve(false); }
      };
      ready ? run() : queue.push(run);
    });
  };

  // Auto events
  var path = location.pathname;
  if (/\/books\/[^/]+\.html$/.test(path)) {
    var slug = path.split('/').pop().replace('.html', '');
    window.rnTrack('view_item', { items: [{ item_id: slug, item_name: document.title }] });
  }

  // Load Firebase (compat) then the project's config helper
  loadScript(CDN + 'firebase-app-compat.js')
    .then(function () { return loadScript(CDN + 'firebase-analytics-compat.js'); })
    .then(function () { return loadScript(CDN + 'firebase-database-compat.js'); })
    .then(function () { return loadScript(CDN + 'firebase-auth-compat.js'); })
    .then(function () { return loadScript(JS_ROOT + 'firebase.js'); })
    .then(function () { initFirebase(); flush(); })
    .catch(function (e) { console.warn('Analytics unavailable:', e.message); });
})();
