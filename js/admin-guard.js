/**
 * The Reading Nook - admin page gate.
 * Requires a signed-in Firebase user whose email is listed below.
 * NOTE: this only hides the page. Real protection must come from the
 * Firebase Database rules (see firebase-rules.json).
 */
(function () {
  // >>> PUT YOUR ADMIN EMAIL(S) HERE <<<
  var ADMIN_EMAILS = ['YOUR-ADMIN-EMAIL@example.com'];

  var style = document.createElement('style');
  style.id = 'rn-guard-style';
  style.textContent = 'body{visibility:hidden}';
  document.head.appendChild(style);

  function show(ok, msg) {
    if (ok) { style.remove(); return; }
    style.remove();
    document.body.innerHTML = '<div style="font-family:system-ui,sans-serif;max-width:480px;margin:80px auto;padding:24px;text-align:center">' +
      '<h2>Admin only</h2><p>' + msg + '</p><p><a href="../auth.html">Sign in</a> · <a href="../index.html">Home</a></p></div>';
  }

  var tries = 0;
  (function wait() {
    if (typeof auth !== 'undefined' && auth) {
      auth.onAuthStateChanged(function (user) {
        if (!user) return show(false, 'Please sign in with an admin account.');
        var email = (user.email || '').toLowerCase();
        var allowed = ADMIN_EMAILS.some(function (e) { return e.toLowerCase() === email; });
        show(allowed, allowed ? '' : 'This account is not an admin.');
      });
    } else if (++tries > 100) {
      show(false, 'Could not verify sign-in. Check your connection and reload.');
    } else {
      setTimeout(wait, 100);
    }
  })();
})();
