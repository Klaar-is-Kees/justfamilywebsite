// Justfamily — main.js
// Laadt Lottie-animaties lui in (alleen als lottie-web geladen is en het element in beeld komt)

document.addEventListener('DOMContentLoaded', function () {
  // Kleine helper, op meerdere plekken in dit bestand gebruikt
  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(null, args); }, wait);
    };
  }

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
    // Sluit het mobiele menu automatisch als er op een link wordt geklikt
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('nav-links--open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // --- Sticky header: krimpt + krijgt schaduw bij scrollen ---
  var header = document.querySelector('.site-header');
  if (header) {
    var onScrollHeader = function () {
      header.classList.toggle('site-header--scrolled', window.scrollY > 12);
    };
    onScrollHeader();
    window.addEventListener('scroll', onScrollHeader, { passive: true });
  }

  // --- Scroll-reveal animaties ---
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    if ('IntersectionObserver' in window) {
      var revealObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(function (el, i) {
        el.style.transitionDelay = (i % 4) * 60 + 'ms';
        revealObserver.observe(el);
      });
    } else {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }
  }

  // --- Tellende statistieken (bv. 50%, 9%) ---
  var countEls = document.querySelectorAll('[data-count]');
  if (countEls.length && 'IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    countEls.forEach(function (el) { countObserver.observe(el); });
  } else {
    countEls.forEach(function (el) { el.textContent = el.dataset.count + (el.dataset.suffix || ''); });
  }

  function animateCount(el) {
    var target = parseFloat(el.dataset.count, 10);
    var suffix = el.dataset.suffix || '';
    var duration = 1100;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      var value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // --- FAQ: netjes één antwoord tegelijk open ---
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  // --- Interactieve taakverdeel-demo ---
  var splitSlider = document.getElementById('taak-slider');
  if (splitSlider) {
    var youOut = document.getElementById('taak-jij');
    var partnerOut = document.getElementById('taak-partner');
    var fillBar = document.getElementById('taak-fill');
    var totalUren = 18; // voorbeeld: totaal uren huishouden per week in de demo

    function updateSplit() {
      var val = parseInt(splitSlider.value, 10); // 0-100, aandeel "jij"
      var jouwUren = Math.round((totalUren * val) / 100 * 10) / 10;
      var partnerUren = Math.round((totalUren - jouwUren) * 10) / 10;
      if (youOut) youOut.textContent = val + '% · ' + jouwUren + ' uur';
      if (partnerOut) partnerOut.textContent = (100 - val) + '% · ' + partnerUren + ' uur';
      if (fillBar) fillBar.style.width = val + '%';
      splitSlider.setAttribute('aria-valuetext', 'Jij ' + val + '%, partner ' + (100 - val) + '%');
    }
    splitSlider.addEventListener('input', updateSplit);
    updateSplit();
  }

  // --- Contactformulier: validatie + mailto-verzending (statische site, geen backend) ---
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var naam = contactForm.naam.value.trim();
      var email = contactForm.email.value.trim();
      var bericht = contactForm.bericht.value.trim();
      var feedback = document.getElementById('contact-feedback');
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!naam || !emailOk || !bericht) {
        if (feedback) {
          feedback.textContent = 'Vul je naam, een geldig e-mailadres en je bericht in.';
          feedback.className = 'form-feedback form-feedback--error';
        }
        return;
      }

      var subject = encodeURIComponent('Contact via justfamily.nl — ' + naam);
      var body = encodeURIComponent(bericht + '\n\n— ' + naam + ' (' + email + ')');
      window.location.href = 'mailto:info@justfamily.nl?subject=' + subject + '&body=' + body;

      if (feedback) {
        feedback.textContent = 'Je mailprogramma opent met je bericht klaar om te versturen naar info@justfamily.nl.';
        feedback.className = 'form-feedback form-feedback--success';
      }
    });
  }

  // --- Cookiebanner ---
  var cookieBanner = document.getElementById('cookie-banner');
  if (cookieBanner) {
    var consent = null;
    try { consent = localStorage.getItem('justfamily-cookie-consent'); } catch (e) {}
    if (!consent) {
      cookieBanner.hidden = false;
    }
    var acceptBtn = document.getElementById('cookie-accept');
    var declineBtn = document.getElementById('cookie-decline');
    function setConsent(value) {
      try { localStorage.setItem('justfamily-cookie-consent', value); } catch (e) {}
      cookieBanner.hidden = true;
    }
    if (acceptBtn) acceptBtn.addEventListener('click', function () { setConsent('accepted'); });
    if (declineBtn) declineBtn.addEventListener('click', function () { setConsent('declined'); });
  }

  // --- Carousel (bv. experts-sectie): automatisch doorschuiven + pijlen ---
  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    var track = carousel.querySelector('[data-carousel-track]');
    var prevBtn = carousel.querySelector('[data-carousel-prev]');
    var nextBtn = carousel.querySelector('[data-carousel-next]');
    var dotsWrap = carousel.querySelector('[data-carousel-dots]');
    var items = track ? Array.prototype.slice.call(track.children) : [];
    if (!track || !items.length) return;

    var currentIndex = 0;
    var autoplayDelay = 4500;
    var autoplayTimer = null;

    // Dots opnieuw opbouwen (voorkomt dubbele dots bij een herlaad van dit script)
    var dots = [];
    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      items.forEach(function (item, i) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', 'Ga naar kaart ' + (i + 1));
        dot.addEventListener('click', function () { goTo(i); restartAutoplay(); });
        dotsWrap.appendChild(dot);
        dots.push(dot);
      });
    }

    function getStep() {
      var trackStyles = window.getComputedStyle(track);
      var gap = parseFloat(trackStyles.columnGap || trackStyles.gap) || 0;
      return items[0].getBoundingClientRect().width + gap;
    }

    function goTo(index) {
      currentIndex = (index + items.length) % items.length; // oneindige lus
      track.scrollTo({ left: currentIndex * getStep(), behavior: 'smooth' });
      updateUI();
    }

    function next() { goTo(currentIndex + 1); }
    function prev() { goTo(currentIndex - 1); }

    function updateUI() {
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === currentIndex); });
      // Oneindige lus: pijlen blijven altijd klikbaar
      if (prevBtn) prevBtn.disabled = false;
      if (nextBtn) nextBtn.disabled = false;
    }

    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = setInterval(next, autoplayDelay);
    }
    function stopAutoplay() {
      if (autoplayTimer) clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
    function restartAutoplay() { startAutoplay(); }

    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); restartAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { next(); restartAutoplay(); });

    // Pauzeer bij hover/focus/aanraken, hervat zodra de bezoeker weggaat
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('focusin', stopAutoplay);
    carousel.addEventListener('focusout', startAutoplay);
    carousel.addEventListener('touchstart', stopAutoplay, { passive: true });

    // Houd de actieve dot in sync als iemand handmatig sleept/swiped
    track.addEventListener('scroll', debounce(function () {
      var index = Math.round(track.scrollLeft / getStep());
      currentIndex = Math.max(0, Math.min(items.length - 1, index));
      updateUI();
    }, 100), { passive: true });

    window.addEventListener('resize', debounce(function () { goTo(currentIndex); }, 150));

    updateUI();
    startAutoplay();

    // Pauzeer autoplay als het tabblad niet actief is (bespaart resources/batterij)
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopAutoplay(); else startAutoplay();
    });
  });

  // --- Jaartal in footer ---
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

