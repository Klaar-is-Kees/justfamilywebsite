// Justfamily — main.js
// Laadt Lottie-animaties lui in (alleen als lottie-web geladen is en het element in beeld komt)

document.addEventListener('DOMContentLoaded', function () {
  // --- Lottie animaties ---
  var lottieEls = document.querySelectorAll('[data-lottie]');
  if (lottieEls.length && window.lottie) {
    var observer = ('IntersectionObserver' in window)
      ? new IntersectionObserver(onIntersect, { rootMargin: '200px' })
      : null;

    lottieEls.forEach(function (el) {
      if (observer) {
        observer.observe(el);
      } else {
        loadLottie(el);
      }
    });
  }

  function onIntersect(entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        loadLottie(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }

  function loadLottie(el) {
    if (el.dataset.loaded) return;
    el.dataset.loaded = '1';
    window.lottie.loadAnimation({
      container: el,
      renderer: 'svg',
      loop: el.dataset.loop !== 'false',
      autoplay: true,
      path: el.getAttribute('data-lottie')
    });
  }

  // --- Mobiel menu ---
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var isOpen = links.classList.toggle('nav-links--open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  // --- Jaartal in footer ---
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
