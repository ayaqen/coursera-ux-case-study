(function () {
  // Before / after toggles
  document.querySelectorAll('[data-ba]').forEach(function (fig) {
    fig.querySelectorAll('.ba-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var after = btn.dataset.state === 'after';
        fig.classList.toggle('show-after', after);
        fig.querySelectorAll('.ba-btn').forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
      });
    });
  });

  // Lightbox
  var box = document.getElementById('lightbox');
  var boxImg = document.getElementById('lightboxImg');
  function openBox(img) {
    boxImg.src = img.currentSrc || img.src;
    boxImg.alt = img.alt;
    box.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeBox() {
    box.hidden = true;
    boxImg.src = '';
    document.body.style.overflow = '';
  }
  document.querySelectorAll('figure img').forEach(function (img) {
    img.addEventListener('click', function () { openBox(img); });
  });
  box.addEventListener('click', closeBox);
  document.getElementById('lightboxClose').addEventListener('click', function (e) { e.stopPropagation(); closeBox(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !box.hidden) closeBox(); });

  // Active section in the nav
  var links = Array.prototype.slice.call(document.querySelectorAll('.topnav-links a'));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  if ('IntersectionObserver' in window) {
    var current = null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) current = en.target.id;
      });
      links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + current); });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { if (s) io.observe(s); });
  }
})();
