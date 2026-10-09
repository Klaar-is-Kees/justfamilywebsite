// Justfamily — crowdfunding.js
// Alleen geladen op campagne.html. Bevat: countdown, voortgangsteller (uit campaign-data.json),
// tier-/bedragselectie, factuurvelden tonen/verbergen, en formulier-handling.

document.addEventListener('DOMContentLoaded', function () {

  // --- Countdown naar de deadline ---
  var deadlineEl = document.getElementById('countdown');
  if (deadlineEl) {
    var deadline = new Date(deadlineEl.dataset.deadline).getTime();

    function updateCountdown() {
      var now = Date.now();
      var diff = Math.max(0, deadline - now);

      var d = Math.floor(diff / (1000 * 60 * 60 * 24));
      var h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      var m = Math.floor((diff / (1000 * 60)) % 60);
      var s = Math.floor((diff / 1000) % 60);

      setText('cd-days', d);
      setText('cd-hours', pad(h));
      setText('cd-minutes', pad(m));
      setText('cd-seconds', pad(s));

      if (diff <= 0) {
        var banner = document.getElementById('campaign-closed-banner');
        if (banner) banner.hidden = false;
      }
    }
    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    function setText(id, val) {
      var el = document.getElementById(id);
      if (el) el.textContent = val;
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // --- Voortgangsteller: haalt totaalbedrag op uit campaign-data.json ---
  // LET OP: dit bestand wordt niet automatisch bijgewerkt door Mollie/Stripe.
  // Zie README.md voor hoe je dit (semi-)live houdt.
  var progressEl = document.getElementById('campaign-progress');
  if (progressEl) {
    fetch('/campaign-data.json', { cache: 'no-store' })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        renderProgress(data);
      })
      .catch(function () {
        // Val stil terug op de in de HTML aanwezige placeholdercijfers als het bestand ontbreekt/faalt.
      });
  }

  function renderProgress(data) {
    var raised = Number(data.raised) || 0;
    var goal = Number(data.goal) || 1;
    var donors = Number(data.donors) || 0;
    var pct = Math.min(100, Math.round((raised / goal) * 100));

    var raisedEl = document.getElementById('amount-raised');
    var goalEl = document.getElementById('amount-goal');
    var donorsEl = document.getElementById('donor-count');
    var fillEl = document.getElementById('progress-fill');
    var updatedEl = document.getElementById('last-updated');

    if (raisedEl) raisedEl.textContent = formatEUR(raised);
    if (goalEl) goalEl.textContent = formatEUR(goal);
    if (donorsEl) donorsEl.textContent = donors;
    if (fillEl) fillEl.style.width = pct + '%';
    if (updatedEl && data.updated) {
      updatedEl.textContent = new Date(data.updated).toLocaleString('nl-NL', {
        day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
      });
    }
  }

  function formatEUR(n) {
    return '€' + Math.round(n).toLocaleString('nl-NL');
  }

  // --- Bedrag-/tier-selectie ---
  var amountRadios = document.querySelectorAll('input[name="bedrag"]');
  var customAmountInput = document.getElementById('custom-bedrag');
  var selectedAmountLabel = document.getElementById('selected-amount-label');

  function currentAmount() {
    var checked = document.querySelector('input[name="bedrag"]:checked');
    if (!checked) return 0;
    if (checked.value === 'anders') {
      return parseInt(customAmountInput.value, 10) || 0;
    }
    return parseInt(checked.value, 10);
  }

  function onAmountChange() {
    document.querySelectorAll('.amount-option').forEach(function (opt) {
      opt.classList.toggle('is-selected', opt.querySelector('input').checked);
    });
    var isCustom = document.querySelector('input[name="bedrag"]:checked')?.value === 'anders';
    if (customAmountInput) customAmountInput.hidden = !isCustom;
    updatePaymentButtons();
  }

  amountRadios.forEach(function (r) { r.addEventListener('change', onAmountChange); });
  if (customAmountInput) customAmountInput.addEventListener('input', updatePaymentButtons);

  // Tier-knoppen ("Kies dit pakket") selecteren het bijbehorende bedrag en scrollen naar het formulier
  document.querySelectorAll('[data-select-tier]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var amount = btn.getAttribute('data-select-tier');
      var radio = document.querySelector('input[name="bedrag"][value="' + amount + '"]');
      if (radio) {
        radio.checked = true;
        onAmountChange();
      }
      var form = document.getElementById('donate-form');
      if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // --- Factuurgegevens tonen/verbergen ---
  var invoiceToggle = document.getElementById('wil-factuur');
  var invoiceFields = document.getElementById('invoice-fields');
  if (invoiceToggle && invoiceFields) {
    invoiceToggle.addEventListener('change', function () {
      invoiceFields.hidden = !invoiceToggle.checked;
    });
  }

  // --- Betaalknoppen: linken naar de Mollie/Stripe-paylink voor het gekozen bedrag ---
  // LET OP: PAYMENT_LINKS hieronder zijn PLACEHOLDERS. Vervang per bedrag door je eigen
  // Mollie- of Stripe-paylink (zie README.md).
  var PAYMENT_LINKS = {
    mollie: {
      35:   'https://payment-links.mollie.com/payment/2UuBnejGFMVpEEhWvWbxN',
      60:   'https://payment-links.mollie.com/payment/DWEHBU3W92RcYgRcdie7c',
      750:  'hhttps://payment-links.mollie.com/payment/N977RDaLq8JYZmSpVU37z',
      1500: 'https://payment-links.mollie.com/payment/WayxptDyqChtdfAMPWHxi'
    },
    stripe: {
      35:   'https://buy.stripe.com/VERVANG-STRIPE-LINK-35',
      60:   'https://buy.stripe.com/VERVANG-STRIPE-LINK-60',
      750:  'https://buy.stripe.com/VERVANG-STRIPE-LINK-750',
      1500: 'https://buy.stripe.com/VERVANG-STRIPE-LINK-1500'
    },
    // Tikkie-betaalverzoeken maak je handmatig aan in de Tikkie-app (of via Tikkie Zakelijk/de API).
    // Let op: controleer zelf het maximumbedrag dat jouw Tikkie-account toestaat per verzoek —
    // dat is afhankelijk van je verificatieniveau en kan ontoereikend zijn voor de €750/€1.500-tiers.
    tikkie: {
      35:   'https://tikkie.me/pl/VERVANG-TIKKIE-LINK-35',
      60:   'https://tikkie.me/pl/VERVANG-TIKKIE-LINK-60',
      750:  'https://tikkie.me/pl/VERVANG-TIKKIE-LINK-750',
      1500: 'https://tikkie.me/pl/VERVANG-TIKKIE-LINK-1500'
    }
  };
  // Generieke links voor een vrij ("anders") bedrag -- vul in als je provider dit ondersteunt
  // (bij Mollie/Stripe kan dit via een eigen "pay what you want"-paylink of Payment Element;
  // bij Tikkie kun je in de app een verzoek "zonder vast bedrag" aanmaken).
  var GENERIC_LINKS = {
    mollie: 'https://www.mollie.com/payments/VERVANG-MOLLIE-LINK-VRIJ-BEDRAG',
    stripe: 'https://buy.stripe.com/VERVANG-STRIPE-LINK-VRIJ-BEDRAG',
    tikkie: 'https://tikkie.me/pl/VERVANG-TIKKIE-LINK-VRIJ-BEDRAG'
  };

  function updatePaymentButtons() {
    var amount = currentAmount();
    if (selectedAmountLabel) {
      selectedAmountLabel.textContent = amount > 0 ? ('€' + amount) : '–';
    }
    var mollieBtn = document.getElementById('btn-mollie');
    var stripeBtn = document.getElementById('btn-stripe');
    var tikkieBtn = document.getElementById('btn-tikkie');
    var exactLink = PAYMENT_LINKS.mollie[amount];
    if (mollieBtn) mollieBtn.href = exactLink || GENERIC_LINKS.mollie;
    var exactStripe = PAYMENT_LINKS.stripe[amount];
    if (stripeBtn) stripeBtn.href = exactStripe || GENERIC_LINKS.stripe;
    var exactTikkie = PAYMENT_LINKS.tikkie[amount];
    if (tikkieBtn) tikkieBtn.href = exactTikkie || GENERIC_LINKS.tikkie;
  }
  updatePaymentButtons();

  // --- Formulier: validatie + (optioneel) doorsturen van donorgegevens ---
  // LET OP: dit formulier verstuurt gegevens naar een extern formulier-verwerkingsadres
  // (bv. Formspree) zodat er een update binnenkomt op info@keesisklaar.nl, zoals gevraagd.
  // Vervang FORM_ENDPOINT in de HTML (actie van het <form>) door je eigen endpoint — zie README.md.
  var donateForm = document.getElementById('donate-form');
  if (donateForm) {
    donateForm.addEventListener('submit', function (e) {
      var naam = document.getElementById('naam');
      var email = document.getElementById('email');
      var akkoord = document.getElementById('akkoord-privacy');
      var feedback = document.getElementById('donate-feedback');
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      var amount = currentAmount();

      var problems = [];
      if (!naam.value.trim()) problems.push('je naam');
      if (!emailOk) problems.push('een geldig e-mailadres');
      if (!akkoord.checked) problems.push('akkoord met het privacybeleid');
      if (!amount || amount <= 0) problems.push('een bedrag');

      if (problems.length) {
        e.preventDefault();
        if (feedback) {
          feedback.textContent = 'Vul nog in: ' + problems.join(', ') + '.';
          feedback.className = 'form-feedback form-feedback--error';
        }
        return;
      }

      // Formulier is geldig: laat 'm doorgaan naar het formulier-endpoint (indien ingesteld),
      // en toon de betaalknoppen zodat de donateur direct door kan naar Mollie/Stripe.
      var paymentButtons = document.getElementById('payment-buttons');
      if (paymentButtons) paymentButtons.hidden = false;
      updatePaymentButtons();

      if (feedback) {
        feedback.textContent = 'Bedankt! Rond je donatie af via Mollie of Stripe hieronder, of maak zelf over via de bankgegevens.';
        feedback.className = 'form-feedback form-feedback--success';
      }

      // Als het formulier-endpoint nog de placeholder is, niet echt versturen (voorkomt een 404/foutmelding).
      if (donateForm.action.indexOf('VERVANG') !== -1) {
        e.preventDefault();
      }
    });
  }

  // --- Jaartal in footer (zelfde als main.js, voor het geval deze pagina main.js niet laadt) ---
  var yearEl = document.getElementById('year');
  if (yearEl && !yearEl.textContent) yearEl.textContent = new Date().getFullYear();
});
