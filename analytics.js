/* 5JAPANESE — consent-gated Google Analytics 4.
   GA4 (gtag.js) is NOT loaded and no analytics cookies are set until the visitor clicks "Accept analytics".
   The choice is stored in localStorage (key: 5j-analytics-consent) and can be changed from the footer. */
(function () {
  'use strict';
  var GA_ID = 'G-4K2XZMSN7D', KEY = '5j-analytics-consent';

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function write(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function loadGA() {
    if (window.__gaLoaded) return;
    window.__gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    gtag('consent', 'update', { analytics_storage: 'granted' });
    gtag('js', new Date());
    gtag('config', GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  function clearGACookies() {
    var host = location.hostname, parts = host.split('.'), domains = ['', host, '.' + host];
    if (parts.length > 2) domains.push('.' + parts.slice(-2).join('.'));
    document.cookie.split(';').forEach(function (c) {
      var n = c.split('=')[0].trim();
      if (n === '_ga' || n.indexOf('_ga_') === 0 || n === '_gid' || n.indexOf('_gat') === 0) {
        domains.forEach(function (d) {
          document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (d ? '; domain=' + d : '');
        });
      }
    });
  }

  var banner;
  function closeBanner() { if (banner) { banner.remove(); banner = null; } }

  function choose(value) {
    var wasGranted = read() === 'granted';
    write(value);
    closeBanner();
    if (value === 'granted') { loadGA(); }
    else {
      window['ga-disable-' + GA_ID] = true;
      clearGACookies();
      if (wasGranted || window.__gaLoaded) location.reload(); // drop the already-loaded GA script
    }
  }

  function showBanner() {
    closeBanner();
    banner = document.createElement('div');
    banner.className = 'consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'consent-title');
    banner.setAttribute('aria-describedby', 'consent-text');
    banner.innerHTML =
      '<h2 id="consent-title">Analytics</h2>' +
      '<p id="consent-text">Can we use Google Analytics to count visits and see which pages are useful? ' +
      'It sets cookies and is off unless you accept. See our <a href="privacy-policy.html">Privacy Policy</a>.</p>' +
      '<div class="consent-actions">' +
      '<button type="button" class="consent-btn" data-choice="denied">Reject analytics</button>' +
      '<button type="button" class="consent-btn" data-choice="granted">Accept analytics</button>' +
      '</div>';
    banner.addEventListener('click', function (e) {
      var c = e.target.getAttribute && e.target.getAttribute('data-choice');
      if (c) choose(c);
    });
    document.body.appendChild(banner);
    banner.querySelector('[data-choice="denied"]').focus();
  }

  function addFooterLink() {
    var nav = document.querySelector('footer nav.foot-links');
    if (!nav) return;
    var b = document.createElement('a');
    b.href = '#analytics-settings';
    b.textContent = 'Analytics settings';
    b.addEventListener('click', function (e) { e.preventDefault(); showBanner(); });
    nav.appendChild(b);
  }

  function init() {
    addFooterLink();
    var v = read();
    if (v === 'granted') loadGA();
    else if (v !== 'denied') showBanner();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
