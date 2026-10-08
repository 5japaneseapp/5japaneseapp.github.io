/* 5KANA free resources: download flow.
   Click "Download PDF" -> optional ad/interstitial -> PDF download. No account, no payment,
   and the file is never locked behind the ad.

   AD INTEGRATION POINT
   No ad network is installed on this site yet. When one is added, register it BEFORE this file loads:

     window.FIVEKANA_AD = {
       // Render the ad into `slot` (a <div>). Call done() when the ad has finished or been closed.
       // If it errors or can't fill, call done() immediately so the download is never blocked.
       render: function (slot, done) { ... }
     };

   Until then (no provider registered) the interstitial is skipped and the PDF downloads right away. */
(function () {
  var modal = document.getElementById('dl-modal');
  var slot = document.getElementById('dl-ad-slot');
  var fallback = document.getElementById('dl-fallback');
  var closeBtn = document.getElementById('dl-close');

  function startDownload(url, name) {
    var a = document.createElement('a');
    a.href = url; a.download = name || ''; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
  }

  function closeModal() {
    if (modal && modal.open) modal.close();
    if (slot) slot.innerHTML = '';
  }

  document.querySelectorAll('[data-download]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var url = link.getAttribute('href');
      var name = url.split('/').pop();
      var ad = window.FIVEKANA_AD;
      // No provider registered: let the plain link download the PDF normally.
      if (!ad || typeof ad.render !== 'function' || !modal || typeof modal.showModal !== 'function') return;
      e.preventDefault();
      var finished = false;
      function done() {
        if (finished) return;
        finished = true;
        closeModal();
        startDownload(url, name);
      }
      fallback.href = url;
      fallback.setAttribute('download', name);
      slot.innerHTML = '';
      modal.showModal();
      try { ad.render(slot, done); } catch (err) { done(); }
      setTimeout(done, 20000); // safety net: never hold the download longer than 20 seconds
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (fallback) fallback.addEventListener('click', closeModal);
})();
