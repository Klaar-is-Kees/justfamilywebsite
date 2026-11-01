// Just Fair Check — interactieve check voor partners
// ---------------------------------------------------------------------------
// Alles draait in de browser: antwoorden worden alleen lokaal (localStorage)
// op dit apparaat bewaard en nergens naartoe gestuurd.
//
// TAKENLIJST
// De taken komen uit "KeywordTaskList.xlsx" (tabblad "Keywords - Klaar is Kees Task Table").
//   freq  = Task Frequency in Days (keer per week)
//   min   = Time in minutes (per keer)
//   tijd per week = freq × min  (zelfde formule als kolom H in de Excel)
//   show  = taak alleen tonen als één van deze situaties is aangevinkt
//   hide  = taak verbergen als deze situatie is aangevinkt (kolom "If not keyword")
//   extra = aanvulling voor de Fair Check, staat (nog) niet in de Excel
//
// Fysieke taken worden gewogen in tijd. Cognitieve en emotionele taken tellen
// per taak even zwaar mee: denk- en zorgwerk laat zich slecht in minuten vangen.
// ---------------------------------------------------------------------------

(function () {
  'use strict';

  var KIDS = ['kids04', 'kids412', 'kids12'];
  var YOUNG = ['kids04', 'kids412'];
  var PETS = ['kat', 'hond', 'huisdier'];

  var SITUATIONS = [
    { id: 'kids04', label: 'Kinderen 0–4 jaar', group: 'gezin' },
    { id: 'kids412', label: 'Kinderen 4–12 jaar', group: 'gezin' },
    { id: 'kids12', label: 'Kinderen 12+', group: 'gezin' },
    { id: 'mantelzorg', label: 'Mantelzorg', group: 'gezin' },
    { id: 'kat', label: 'Kat', group: 'dieren' },
    { id: 'hond', label: 'Hond', group: 'dieren' },
    { id: 'huisdier', label: 'Ander huisdier', group: 'dieren' },
    { id: 'tuin', label: 'Tuin', group: 'huis' },
    { id: 'balkon', label: 'Balkon', group: 'huis' },
    { id: 'planten', label: 'Planten', group: 'huis' },
    { id: 'auto', label: 'Auto', group: 'huis' },
    { id: 'vaatwasser', label: 'Vaatwasser', group: 'hulp' },
    { id: 'droger', label: 'Wasdroger', group: 'hulp' },
    { id: 'robotstofzuiger', label: 'Robotstofzuiger', group: 'hulp' },
    { id: 'robotdweiler', label: 'Robotdweiler', group: 'hulp' },
    { id: 'schoonmaker', label: 'Schoonmaker', group: 'hulp' },
    { id: 'bezorgservice', label: 'Boodschappen-bezorgservice', group: 'hulp' }
  ];
  var DEFAULT_SITUATION = ['vaatwasser'];

  // Huisgrootte bepaalt de tijd voor stofzuigen en dweilen (kolom "House Size")
  var HOUSE = {
    s: { label: 'Tot 75 m²', stofzuigen: 60, dweilen: 30 },
    m: { label: '75–150 m²', stofzuigen: 120, dweilen: 60 },
    l: { label: 'Meer dan 150 m²', stofzuigen: 180, dweilen: 90 }
  };

  var CATEGORIES = [
    {
      id: 'fysiek',
      title: 'Fysieke taken',
      short: 'Fysiek',
      verb: 'Het doen',
      intro: 'Alles wat je met je handen doet: koken, wassen, schoonmaken, halen en brengen. Deze taken wegen we in tijd per week.',
      question: 'Welke taak doe je eigenlijk best graag, en welke zou je het liefst nooit meer doen?'
    },
    {
      id: 'cognitief',
      title: 'Cognitieve taken',
      short: 'Cognitief',
      verb: 'Het denken',
      intro: 'Plannen, onthouden, regelen en overzicht houden. Dit is de mentale last: de vraag is niet wie het uitvoert, maar wie eraan dénkt.',
      question: 'Welke taak zit bij jou altijd "in je hoofd", ook als de ander hem uitvoert?'
    },
    {
      id: 'emotioneel',
      title: 'Emotionele taken',
      short: 'Emotioneel',
      verb: 'Het zorgen',
      intro: 'Aandacht, troost, sfeer en verbinding: met de kinderen, met familie en met elkaar. Vaak onzichtbaar, maar het kost wel energie.',
      question: 'Wanneer voelde jij je de afgelopen tijd écht gesteund door de ander?'
    }
  ];

  var TASKS = [
    // ---------------- FYSIEK ----------------
    { id: 'koken', cat: 'fysiek', name: 'Koken', freq: 7, min: 30 },
    { id: 'boodschappen', cat: 'fysiek', name: 'Boodschappen doen', freq: 4, min: 30 },
    { id: 'tafel-dekken', cat: 'fysiek', name: 'Tafel dekken diner', freq: 7, min: 5 },
    { id: 'tafel-af-diner', cat: 'fysiek', name: 'Tafel afruimen diner', freq: 7, min: 5 },
    { id: 'tafel-af-ontbijt', cat: 'fysiek', name: 'Tafel afruimen ontbijt', freq: 7, min: 10 },
    { id: 'vaatwasser-in', cat: 'fysiek', name: 'Vaatwasser inruimen', freq: 7, min: 10, show: ['vaatwasser'] },
    { id: 'vaatwasser-uit', cat: 'fysiek', name: 'Vaatwasser uitruimen', freq: 7, min: 10, show: ['vaatwasser'] },
    { id: 'afwassen', cat: 'fysiek', name: 'Afwassen', freq: 7, min: 20, hide: ['vaatwasser'] },
    { id: 'keuken-opruimen', cat: 'fysiek', name: 'Keuken opruimen', freq: 7, min: 10 },
    { id: 'woonkamer-opruimen', cat: 'fysiek', name: 'Woonkamer opruimen', freq: 7, min: 20 },
    { id: 'vuilnis', cat: 'fysiek', name: 'Vuilnis wegbrengen', freq: 2, min: 5 },
    { id: 'blik-glas', cat: 'fysiek', name: 'Blik, glas & karton wegbrengen', freq: 1, min: 5 },
    { id: 'was-wassen', cat: 'fysiek', name: 'Kleding wassen', freq: 4, min: 10 },
    { id: 'was-ophangen', cat: 'fysiek', name: 'Kleding ophangen', freq: 4, min: 20, hide: ['droger'] },
    { id: 'was-vouwen', cat: 'fysiek', name: 'Kleding opvouwen & in de kast', freq: 4, min: 10 },
    { id: 'bedden', cat: 'fysiek', name: 'Bedden verschonen', freq: 1, min: 30 },
    { id: 'stofzuigen', cat: 'fysiek', name: 'Stofzuigen', freq: 1, min: 'stofzuigen', hide: ['robotstofzuiger', 'schoonmaker'] },
    { id: 'robotstofzuiger', cat: 'fysiek', name: 'Robotstofzuiger aan-/uitzetten', freq: 1, min: 10, show: ['robotstofzuiger'] },
    { id: 'dweilen', cat: 'fysiek', name: 'Dweilen', freq: 1, min: 'dweilen', hide: ['robotdweiler', 'schoonmaker'] },
    { id: 'robotdweiler', cat: 'fysiek', name: 'Robotdweiler aan-/uitzetten', freq: 1, min: 10, show: ['robotdweiler'] },
    { id: 'badkamer', cat: 'fysiek', name: 'Toilet & badkamer schoonmaken', freq: 1, min: 40, hide: ['schoonmaker'] },
    { id: 'deuren', cat: 'fysiek', name: 'Deuren en deurklinken', freq: 1, min: 30, hide: ['schoonmaker'] },
    { id: 'afstoffen', cat: 'fysiek', name: 'Afstoffen', freq: 1, min: 30, hide: ['schoonmaker'] },
    { id: 'ramen', cat: 'fysiek', name: 'Ramen lappen', freq: 0.25, min: 30, hide: ['schoonmaker'] },
    { id: 'koelkast', cat: 'fysiek', name: 'Koelkast schoonmaken', freq: 0.25, min: 20 }, // tijd geschat (leeg in Excel)
    { id: 'kleden', cat: 'fysiek', name: 'Kleden uitkloppen', freq: 0.25, min: 10 },
    { id: 'opslag', cat: 'fysiek', name: 'Opslag opruimen (berging, schuur, zolder)', freq: 0.1, min: 30 },
    { id: 'reparatie', cat: 'fysiek', name: 'Reparatiewerk', freq: 0.25, min: 30 },
    { id: 'installatie', cat: 'fysiek', name: 'Installatiewerk', freq: 0.1, min: 10 },
    { id: 'techniek', cat: 'fysiek', name: 'Technisch onderhoud (laptops en apparaten)', freq: 0.1, min: 10 },
    { id: 'fiets', cat: 'fysiek', name: 'Fietsonderhoud', freq: 0.1, min: 60 },
    { id: 'vakantietassen', cat: 'fysiek', name: 'Vakantietassen pakken', freq: 0.1, min: 10 },
    { id: 'planten', cat: 'fysiek', name: 'Planten water geven', freq: 1, min: 10, show: ['planten'] },
    { id: 'tuinieren', cat: 'fysiek', name: 'Tuinieren', freq: 1, min: 10, show: ['tuin'] },
    { id: 'gras', cat: 'fysiek', name: 'Gras maaien', freq: 1, min: 10, show: ['tuin'] },
    { id: 'balkon', cat: 'fysiek', name: 'Balkon verzorgen', freq: 1, min: 10, show: ['balkon'] },
    { id: 'auto-wassen', cat: 'fysiek', name: 'Auto wassen', freq: 0.25, min: 30, show: ['auto'] },
    { id: 'kat-eten', cat: 'fysiek', name: 'Kat eten/drinken geven', freq: 7, min: 5, show: ['kat'] },
    { id: 'kattenbak', cat: 'fysiek', name: 'Kattenbak verschonen', freq: 1, min: 10, show: ['kat'] },
    { id: 'hond-uitlaten', cat: 'fysiek', name: 'Hond uitlaten', freq: 7, min: 30, show: ['hond'] },
    { id: 'hond-eten', cat: 'fysiek', name: 'Hond eten/drinken geven', freq: 7, min: 5, show: ['hond'] },
    { id: 'huisdier-eten', cat: 'fysiek', name: 'Huisdier eten/drinken geven', freq: 7, min: 5, show: ['huisdier'] },
    { id: 'huisdier-verschonen', cat: 'fysiek', name: 'Huisdier verschonen', freq: 1, min: 10, show: ['huisdier'] },
    { id: 'dierenvoer', cat: 'fysiek', name: 'Voedsel huisdieren halen', freq: 1, min: 10, show: PETS },
    { id: 'kids-aankleden', cat: 'fysiek', name: 'Kinderen aankleden', freq: 7, min: 10, show: YOUNG },
    { id: 'kids-ontbijt', cat: 'fysiek', name: 'Ontbijt maken kinderen', freq: 7, min: 10, show: YOUNG },
    { id: 'kids-tanden', cat: 'fysiek', name: 'Tandenpoetsen kinderen (ochtend)', freq: 7, min: 10, show: YOUNG },
    { id: 'kids-lunch', cat: 'fysiek', name: 'Lunch maken kinderen', freq: 7, min: 10, show: ['kids412'] },
    { id: 'kids-bed', cat: 'fysiek', name: 'Kinderen tandenpoetsen, voorlezen & naar bed brengen', freq: 7, min: 30, show: YOUNG },
    { id: 'luiers', cat: 'fysiek', name: 'Luiers verschonen', freq: 0.1, min: 10, show: ['kids04'] },
    { id: 'zindelijk', cat: 'fysiek', name: 'Zindelijk maken', freq: 0.1, min: 10, show: ['kids04'] },
    { id: 'opvang-halen', cat: 'fysiek', name: 'Kinderen van de kinderopvang halen', freq: 3, min: 30, show: ['kids04'] },
    { id: 'school-brengen', cat: 'fysiek', name: 'Kinderen naar school brengen', freq: 5, min: 30, show: ['kids412'] },
    { id: 'school-halen', cat: 'fysiek', name: 'Kinderen van school/BSO halen', freq: 5, min: 30, show: ['kids412'] },
    { id: 'zwemles', cat: 'fysiek', name: 'Kinderen naar zwemles', freq: 1, min: 90, show: ['kids412'] },
    { id: 'hobby', cat: 'fysiek', name: 'Kinderen naar hobby brengen & halen', freq: 1, min: 90, show: ['kids412'] },
    { id: 'bieb', cat: 'fysiek', name: 'Kinderen naar de bibliotheek', freq: 1, min: 30, show: ['kids412'] },
    { id: 'speelgoed', cat: 'fysiek', name: 'Speelgoed ordenen', freq: 0.25, min: 10, show: YOUNG },
    { id: 'traktaties', cat: 'fysiek', name: 'Knutselen en traktaties (o.a. verjaardagen, Sinterklaas)', freq: 0.25, min: 30, show: ['kids412'] },

    // ---------------- COGNITIEF ----------------
    { id: 'weekmenu', cat: 'cognitief', name: 'Weekmenu bedenken & boodschappenlijst maken', extra: true },
    { id: 'voorraad', cat: 'cognitief', name: 'Bijhouden wat er op raakt (wc-papier, wasmiddel, luiers)', extra: true },
    { id: 'gezinsagenda', cat: 'cognitief', name: 'Gezinsagenda bijhouden & afspraken afstemmen', extra: true },
    { id: 'bezorgservice', cat: 'cognitief', name: 'Boodschappen-bezorgservice regelen', freq: 2, min: 10, show: ['bezorgservice'] },
    { id: 'huisadministratie', cat: 'cognitief', name: 'Huisadministratie', freq: 0.25, min: 10 },
    { id: 'verjaardagen', cat: 'cognitief', name: 'Verjaardagen herinneren & regelen', freq: 0.25, min: 10 },
    { id: 'cadeaus', cat: 'cognitief', name: 'Cadeaus bedenken & kopen', extra: true },
    { id: 'dokter', cat: 'cognitief', name: 'Dokter/tandarts regelen', freq: 0.25, min: 10 },
    { id: 'monteurs', cat: 'cognitief', name: 'Monteurs inschakelen (o.a. elektra, loodgieter)', freq: 0.1, min: 10 },
    { id: 'feestdagen', cat: 'cognitief', name: 'Feestdagen organiseren (o.a. Kerst, Pasen)', freq: 0.1, min: 10 },
    { id: 'gezinsuitje', cat: 'cognitief', name: 'Gezinsuitje regelen', freq: 0.1, min: 10 },
    { id: 'vakantie', cat: 'cognitief', name: 'Vakantie boeken', freq: 0.1, min: 10 },
    { id: 'anticonceptie', cat: 'cognitief', name: 'Anticonceptie verzorgen', freq: 1, min: 5 },
    { id: 'apk', cat: 'cognitief', name: 'Auto APK', freq: 0.1, min: 10, show: ['auto'] },
    { id: 'schoonmaker-comm', cat: 'cognitief', name: 'Schoonmaker communicatie', freq: 1, min: 10, show: ['schoonmaker'] },
    { id: 'schoonmaker-betalen', cat: 'cognitief', name: 'Schoonmaker betalen', freq: 1, min: 10, show: ['schoonmaker'] },
    { id: 'opvang-regelen', cat: 'cognitief', name: 'Kinderopvang regelen', freq: 3, min: 10, show: ['kids04'] },
    { id: 'school-regelen', cat: 'cognitief', name: 'School/BSO regelen & communicatie', freq: 3, min: 10, show: ['kids412'] },
    { id: 'schoolagenda', cat: 'cognitief', name: 'Schoolagenda bijhouden', freq: 0.1, min: 10, show: ['kids412'] },
    { id: 'speelafspraken', cat: 'cognitief', name: 'Speelafspraken kinderen', freq: 1, min: 10, show: ['kids412'] },
    { id: 'ouderparticipatie', cat: 'cognitief', name: 'Ouderparticipatie school', freq: 0.1, min: 10, show: ['kids412'] },
    { id: 'kinderfeestje', cat: 'cognitief', name: 'Kinderfeestje organiseren', freq: 0.25, min: 10, show: YOUNG },
    { id: 'kinderkleding', cat: 'cognitief', name: 'Kinderkleding regelen & kast opruimen', freq: 1, min: 10, show: YOUNG },
    { id: 'puber-kleding', cat: 'cognitief', name: 'Kleding van je tiener checken & kast opruimen', show: ['kids12'] },
    { id: 'puber-tafel', cat: 'cognitief', name: 'Checken of je tiener de tafel afruimt', show: ['kids12'] },
    { id: 'puber-opruimen', cat: 'cognitief', name: 'Checken of je tiener opruimt', show: ['kids12'] },
    { id: 'puber-vaatwasser', cat: 'cognitief', name: 'Checken of je tiener de vaatwasser in- & uitruimt', show: ['kids12'] },
    { id: 'puber-kamer', cat: 'cognitief', name: 'Checken of je tiener de kamer opruimt', show: ['kids12'] },
    { id: 'huiswerk', cat: 'cognitief', name: 'Huiswerkbegeleiding', show: ['kids12'] },

    // ---------------- EMOTIONEEL ----------------
    { id: 'emotionele-steun-kids', cat: 'emotioneel', name: 'Emotionele ondersteuning kinderen bieden', freq: 7, min: 30, show: KIDS },
    { id: 'troosten', cat: 'emotioneel', name: 'Troosten bij ziekte, verdriet of nachtelijk wakker worden', show: KIDS, extra: true },
    { id: 'oudergesprekken', cat: 'emotioneel', name: 'Oudergesprekken school', freq: 0.1, min: 10, show: ['kids412'] },
    { id: 'familie', cat: 'emotioneel', name: 'Contact onderhouden met familie & schoonouders', freq: 0.1, min: 10 },
    { id: 'datenight', cat: 'emotioneel', name: 'Datenight & tijd voor elkaar plannen', freq: 1, min: 180 },
    { id: 'checkin-partner', cat: 'emotioneel', name: 'Vragen hoe het écht met de ander gaat', extra: true },
    { id: 'sfeer', cat: 'emotioneel', name: 'De sfeer bewaken als het even schuurt', extra: true },
    { id: 'gezellig', cat: 'emotioneel', name: 'Huis gezellig maken', freq: 0.1, min: 10 },
    { id: 'mantelzorg', cat: 'emotioneel', name: 'Mantelzorg', show: ['mantelzorg'] }
  ];

  // Antwoordschaal: aandeel van partner A
  var SCALE = [
    { v: 'a', share: 1, label: function (n) { return n.a; }, title: function (n) { return 'Altijd ' + n.a; } },
    { v: 'ma', share: 0.75, label: function () { return 'vooral'; }, title: function (n) { return 'Vooral ' + n.a; }, side: 'a' },
    { v: 's', share: 0.5, label: function () { return 'samen'; }, title: function () { return 'Samen / om en om'; } },
    { v: 'mb', share: 0.25, label: function () { return 'vooral'; }, title: function (n) { return 'Vooral ' + n.b; }, side: 'b' },
    { v: 'b', share: 0, label: function (n) { return n.b; }, title: function (n) { return 'Altijd ' + n.b; } }
  ];
  var SHARE = { a: 1, ma: 0.75, s: 0.5, mb: 0.25, b: 0 };

  var STORE_KEY = 'justfamily-fair-check-v1';
  var STEPS = ['start', 'fysiek', 'cognitief', 'emotioneel', 'resultaat'];

  var state = load() || {
    names: { a: '', b: '' },
    situation: DEFAULT_SITUATION.slice(),
    house: 'm',
    answers: {},
    talk: {},
    custom: [],
    step: 'start'
  };

  var root = document.querySelector('[data-fair-check]');
  if (!root) return;
  root.classList.add('fc-ready');

  // ---------------------------------------------------------------------------
  // Opslag (alleen lokaal)
  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  // ---------------------------------------------------------------------------
  // Helpers
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function names() {
    return {
      a: (state.names.a || '').trim() || 'Partner 1',
      b: (state.names.b || '').trim() || 'Partner 2'
    };
  }
  function has(id) { return state.situation.indexOf(id) !== -1; }
  function visible(task) {
    if (task.show && !task.show.some(has)) return false;
    if (task.hide && task.hide.some(has)) return false;
    return true;
  }
  function weeklyMinutes(task) {
    var min = typeof task.min === 'string' ? HOUSE[state.house][task.min] : task.min;
    return (task.freq || 0) * (min || 0);
  }
  function allTasks() {
    return TASKS.concat(state.custom.map(function (c) {
      return { id: c.id, cat: c.cat, name: c.name, freq: c.minWeek ? 1 : 0, min: c.minWeek || 0, custom: true };
    }));
  }
  function tasksFor(cat) {
    return allTasks().filter(function (t) { return t.cat === cat && visible(t); });
  }
  function catById(id) {
    for (var i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i].id === id) return CATEGORIES[i];
  }
  function fmtHours(minutes) {
    var h = minutes / 60;
    if (h < 10) return (Math.round(h * 2) / 2).toString().replace('.', ',') + ' uur';
    return Math.round(h) + ' uur';
  }
  function pct(x) { return Math.round(x * 100); }

  // ---------------------------------------------------------------------------
  // Berekening
  function score(cat) {
    var list = tasksFor(cat);
    var totalW = 0, aW = 0, answered = 0, mins = 0, aMins = 0, notApplicable = 0;
    list.forEach(function (t) {
      var ans = state.answers[t.id];
      if (!ans) return;
      if (ans === 'na') { notApplicable++; return; }
      answered++;
      var share = SHARE[ans];
      var w = cat === 'fysiek' ? weeklyMinutes(t) : 1;
      if (cat === 'fysiek' && !w) w = 5; // taken zonder tijd tellen een klein beetje mee
      totalW += w;
      aW += w * share;
      if (cat === 'fysiek') { mins += weeklyMinutes(t); aMins += weeklyMinutes(t) * share; }
    });
    return {
      total: list.length,
      answered: answered + notApplicable,
      counted: answered,
      shareA: totalW ? aW / totalW : null,
      minutes: mins,
      minutesA: aMins,
      minutesB: mins - aMins
    };
  }

  // ---------------------------------------------------------------------------
  // Render
  function render() {
    var n = names();
    root.innerHTML =
      renderStepper() +
      '<div class="fc-panel" tabindex="-1" data-fc-panel>' +
      (state.step === 'start' ? renderStart(n)
        : state.step === 'resultaat' ? renderResults(n)
        : renderCategory(state.step, n)) +
      '</div>';
    bind();
  }

  function renderStepper() {
    var labels = { start: 'Jullie', fysiek: 'Fysiek', cognitief: 'Cognitief', emotioneel: 'Emotioneel', resultaat: 'Uitkomst' };
    var current = STEPS.indexOf(state.step);
    return '<ol class="fc-stepper" aria-label="Stappen van de check">' + STEPS.map(function (s, i) {
      var cls = i === current ? 'is-current' : (i < current ? 'is-done' : '');
      var count = '';
      if (s !== 'start' && s !== 'resultaat') {
        var sc = score(s);
        count = '<small>' + sc.answered + '/' + sc.total + '</small>';
      }
      return '<li class="fc-step fc-step--' + s + ' ' + cls + '">' +
        '<button type="button" data-fc-goto="' + s + '"' + (i === current ? ' aria-current="step"' : '') + '>' +
        '<span class="fc-step-num">' + (i + 1) + '</span><span class="fc-step-label">' + labels[s] + '</span>' + count +
        '</button></li>';
    }).join('') + '</ol>';
  }

  function renderStart(n) {
    var groups = { gezin: 'Gezin & zorg', dieren: 'Huisdieren', huis: 'Huis & buiten', hulp: 'Hulp & apparaten' };
    var chips = Object.keys(groups).map(function (g) {
      return '<fieldset class="fc-chipset"><legend>' + groups[g] + '</legend><div class="fc-chips">' +
        SITUATIONS.filter(function (s) { return s.group === g; }).map(function (s) {
          return '<label class="fc-chip"><input type="checkbox" data-fc-situation value="' + s.id + '"' +
            (has(s.id) ? ' checked' : '') + '><span>' + s.label + '</span></label>';
        }).join('') + '</div></fieldset>';
    }).join('');

    var house = Object.keys(HOUSE).map(function (k) {
      return '<label class="fc-chip"><input type="radio" name="fc-house" data-fc-house value="' + k + '"' +
        (state.house === k ? ' checked' : '') + '><span>' + HOUSE[k].label + '</span></label>';
    }).join('');

    return '' +
      '<div class="fc-head">' +
        '<span class="eyebrow">Stap 1 · Jullie situatie</span>' +
        '<h3>Wie doen de check?</h3>' +
        '<p>Vul jullie namen in en vink aan wat bij jullie huishouden hoort. Dan laten we alleen de taken zien die voor jullie gelden.</p>' +
      '</div>' +
      '<div class="fc-names">' +
        '<div class="form-group fc-name fc-name--a"><label for="fc-name-a">Partner 1</label>' +
          '<input id="fc-name-a" type="text" maxlength="20" autocomplete="off" placeholder="Bijv. Sanne" value="' + esc(state.names.a) + '" data-fc-name="a"></div>' +
        '<span class="fc-amp" aria-hidden="true">&amp;</span>' +
        '<div class="form-group fc-name fc-name--b"><label for="fc-name-b">Partner 2</label>' +
          '<input id="fc-name-b" type="text" maxlength="20" autocomplete="off" placeholder="Bijv. Daan" value="' + esc(state.names.b) + '" data-fc-name="b"></div>' +
      '</div>' +
      chips +
      '<fieldset class="fc-chipset"><legend>Grootte van jullie huis</legend><div class="fc-chips">' + house + '</div></fieldset>' +
      '<div class="fc-nav">' +
        '<span class="fc-privacy">🔒 Jullie antwoorden blijven op dit apparaat. Er wordt niets verstuurd.</span>' +
        '<button type="button" class="btn btn-primary" data-fc-goto="fysiek">Start met fysieke taken &rarr;</button>' +
      '</div>';
  }

  function renderCategory(catId, n) {
    var cat = catById(catId);
    var list = tasksFor(catId);
    var sc = score(catId);
    var idx = STEPS.indexOf(catId);
    var next = STEPS[idx + 1];
    var prev = STEPS[idx - 1];
    var nextLabel = next === 'resultaat' ? 'Bekijk jullie uitkomst' : (catById(next).title);

    var rows = list.map(function (t) {
      var ans = state.answers[t.id] || '';
      var talk = !!state.talk[t.id];
      var meta = '';
      if (catId === 'fysiek') {
        var m = weeklyMinutes(t);
        meta = m ? '<span class="fc-task-meta">± ' + (m >= 60 ? fmtHours(m) : Math.round(m) + ' min') + ' per week</span>' : '';
      }
      var buttons = SCALE.map(function (o) {
        var side = o.side || (o.v === 'a' ? 'a' : o.v === 'b' ? 'b' : 's');
        return '<button type="button" class="fc-opt fc-opt--' + o.v + ' fc-side--' + side + (ans === o.v ? ' is-on' : '') + '"' +
          ' data-fc-answer="' + o.v + '" data-task="' + t.id + '" aria-pressed="' + (ans === o.v) + '" title="' + esc(o.title(n)) + '">' +
          '<span class="sr-only">' + esc(o.title(n)) + '</span><span aria-hidden="true">' + esc(o.label(n)) + '</span></button>';
      }).join('');
      return '<li class="fc-task' + (ans ? ' is-answered' : '') + (ans === 'na' ? ' is-na' : '') + (talk ? ' is-talk' : '') + '">' +
        '<div class="fc-task-name"><span>' + esc(t.name) + '</span>' + meta + '</div>' +
        '<div class="fc-task-controls">' +
          '<div class="fc-scale" role="group" aria-label="Wie doet: ' + esc(t.name) + '">' + buttons + '</div>' +
          '<div class="fc-task-extra">' +
            '<button type="button" class="fc-mini' + (ans === 'na' ? ' is-on' : '') + '" data-fc-answer="na" data-task="' + t.id + '" aria-pressed="' + (ans === 'na') + '">n.v.t.</button>' +
            '<button type="button" class="fc-mini fc-talk' + (talk ? ' is-on' : '') + '" data-fc-talk="' + t.id + '" aria-pressed="' + talk + '" title="Hierover willen we praten">💬 bespreken</button>' +
            (t.custom ? '<button type="button" class="fc-mini" data-fc-remove="' + t.id + '" title="Verwijder deze taak">✕</button>' : '') +
          '</div>' +
        '</div>' +
      '</li>';
    }).join('');

    var legend = '<div class="fc-legend" aria-hidden="true">' +
      '<span class="fc-legend-a">← ' + esc(n.a) + '</span><span>samen</span><span class="fc-legend-b">' + esc(n.b) + ' →</span></div>';

    return '' +
      '<div class="fc-head fc-head--' + catId + '">' +
        '<span class="eyebrow">Stap ' + (idx + 1) + ' · ' + cat.verb + '</span>' +
        '<h3>' + cat.title + '</h3>' +
        '<p>' + cat.intro + '</p>' +
        '<p class="fc-tip"><strong>Wie doet dit nu meestal?</strong> Kies samen één antwoord. Zien jullie het anders? Kies dan wat het dichtst in de buurt komt en zet de taak op <em>💬 bespreken</em>.</p>' +
      '</div>' +
      '<div class="fc-progress"><div class="fc-progress-bar"><span style="width:' + (sc.total ? pct(sc.answered / sc.total) : 0) + '%"></span></div>' +
        '<span>' + sc.answered + ' van ' + sc.total + ' ingevuld</span>' +
        (sc.answered < sc.total ? '<button type="button" class="fc-mini" data-fc-fill="' + catId + '">Rest op "samen" zetten</button>' : '') +
      '</div>' +
      legend +
      '<ul class="fc-tasks">' + rows + '</ul>' +
      '<form class="fc-add" data-fc-add="' + catId + '">' +
        '<label for="fc-add-' + catId + '">Mist er een taak?</label>' +
        '<div class="fc-add-row">' +
          '<input id="fc-add-' + catId + '" type="text" maxlength="80" placeholder="Bijv. ' + (catId === 'fysiek' ? 'Kliko aan de straat zetten' : catId === 'cognitief' ? 'Verzekeringen vergelijken' : 'Opa en oma bellen') + '">' +
          (catId === 'fysiek' ? '<select aria-label="Tijd per week"><option value="15">± 15 min/week</option><option value="30">± 30 min/week</option><option value="60" selected>± 1 uur/week</option><option value="120">± 2 uur/week</option><option value="240">± 4 uur/week</option></select>' : '') +
          '<button type="submit" class="btn btn-outline">Toevoegen</button>' +
        '</div>' +
      '</form>' +
      '<div class="fc-nav">' +
        '<button type="button" class="btn btn-outline" data-fc-goto="' + prev + '">&larr; Terug</button>' +
        '<button type="button" class="btn btn-primary" data-fc-goto="' + next + '">' + nextLabel + ' &rarr;</button>' +
      '</div>';
  }

  function verdict(shareA, n) {
    if (shareA === null) return { text: 'Nog niet ingevuld', tone: 'none' };
    var p = pct(shareA);
    if (p >= 40 && p <= 60) return { text: 'Redelijk in balans', tone: 'ok' };
    var who = p > 50 ? n.a : n.b;
    var share = p > 50 ? p : 100 - p;
    if (share >= 75) return { text: 'Ligt grotendeels bij ' + who, tone: 'high' };
    return { text: 'Ligt vooral bij ' + who, tone: 'mid' };
  }

  function bar(shareA, n) {
    if (shareA === null) return '<div class="fc-bar fc-bar--empty"><span>Nog geen antwoorden</span></div>';
    var a = pct(shareA), b = 100 - a;
    return '<div class="fc-bar" role="img" aria-label="' + esc(n.a) + ' ' + a + '%, ' + esc(n.b) + ' ' + b + '%">' +
      '<span class="fc-bar-a" style="width:' + a + '%">' + (a >= 12 ? a + '%' : '') + '</span>' +
      '<span class="fc-bar-b" style="width:' + b + '%">' + (b >= 12 ? b + '%' : '') + '</span></div>';
  }

  function insights(scores, n) {
    var out = [];
    var f = scores.fysiek.shareA, c = scores.cognitief.shareA, e = scores.emotioneel.shareA;
    if (f !== null && c !== null) {
      var diff = c - f;
      if (Math.abs(diff) >= 0.15) {
        var thinker = diff > 0 ? n.a : n.b;
        out.push('<strong>Het denkwerk ligt schever dan het doewerk.</strong> Bij de fysieke taken is de verdeling ' + pct(f) + '/' + (100 - pct(f)) +
          ', maar bij plannen en regelen draagt ' + esc(thinker) + ' duidelijk meer. Dat is precies de mentale last die vaak onzichtbaar blijft.');
      } else if (Math.abs(c - 0.5) > 0.15) {
        out.push('<strong>Plannen en regelen ligt vooral bij ' + esc(c > 0.5 ? n.a : n.b) + '.</strong> Ook als de ander de taak uitvoert, kost onthouden en overzicht houden energie.');
      }
    }
    if (e !== null && Math.abs(e - 0.5) > 0.15) {
      out.push('<strong>De emotionele zorg ligt vooral bij ' + esc(e > 0.5 ? n.a : n.b) + '.</strong> Troosten, aandacht en de sfeer bewaken kosten energie, ook al staan ze op geen enkel lijstje.');
    }
    var all = [f, c, e].filter(function (x) { return x !== null; });
    if (all.length && all.every(function (x) { return Math.abs(x - 0.5) <= 0.1; })) {
      out.push('<strong>Mooi in balans.</strong> Op alle drie de vlakken delen jullie de last aardig eerlijk. Bespreek vooral of het ook zo <em>voelt</em>, want dat is minstens zo belangrijk.');
    }
    var a = 0, b = 0;
    all.forEach(function (x) { if (x > 0.5) a++; else if (x < 0.5) b++; });
    if (all.length === 3 && (a === 3 || b === 3) && all.some(function (x) { return Math.abs(x - 0.5) > 0.15; })) {
      out.push('<strong>Op alle drie de vlakken weegt het zwaarder voor ' + esc(a === 3 ? n.a : n.b) + '.</strong> Een goed moment om samen te kijken welke taak als eerste kan verschuiven.');
    }
    return out;
  }

  function renderResults(n) {
    var scores = {};
    CATEGORIES.forEach(function (c) { scores[c.id] = score(c.id); });
    var answeredTotal = CATEGORIES.reduce(function (s, c) { return s + scores[c.id].answered; }, 0);

    if (!answeredTotal) {
      return '<div class="fc-head"><span class="eyebrow">Uitkomst</span><h3>Nog geen antwoorden</h3>' +
        '<p>Vul eerst samen een paar taken in, dan laten we hier zien hoe jullie de last verdelen.</p></div>' +
        '<div class="fc-nav"><span></span><button type="button" class="btn btn-primary" data-fc-goto="fysiek">Start met fysieke taken &rarr;</button></div>';
    }

    var cards = CATEGORIES.map(function (c) {
      var s = scores[c.id];
      var v = verdict(s.shareA, n);
      var detail = c.id === 'fysiek' && s.shareA !== null
        ? '<p class="fc-result-detail">± ' + fmtHours(s.minutes) + ' per week: <strong class="fc-c-a">' + esc(n.a) + ' ' + fmtHours(s.minutesA) + '</strong> · <strong class="fc-c-b">' + esc(n.b) + ' ' + fmtHours(s.minutesB) + '</strong></p>'
        : '<p class="fc-result-detail">' + s.counted + ' taken meegeteld, elke taak telt even zwaar</p>';
      return '<div class="fc-result fc-result--' + c.id + '">' +
        '<div class="fc-result-top"><span class="fc-result-kind">' + c.verb + '</span><h4>' + c.title + '</h4>' +
        '<span class="fc-verdict fc-verdict--' + v.tone + '">' + esc(v.text) + '</span></div>' +
        bar(s.shareA, n) + detail + '</div>';
    }).join('');

    var ins = insights(scores, n);
    var insightsHtml = ins.length ? '<div class="fc-insights"><h4>Wat valt op?</h4><ul>' + ins.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul></div>' : '';

    // Gesprekslijst: gemarkeerde taken + grootste tijdvreters bij één persoon
    var talkTasks = allTasks().filter(function (t) { return state.talk[t.id] && visible(t); });
    var heavy = tasksFor('fysiek').filter(function (t) {
      var a = state.answers[t.id];
      return (a === 'a' || a === 'b') && !state.talk[t.id] && weeklyMinutes(t) >= 60;
    }).sort(function (x, y) { return weeklyMinutes(y) - weeklyMinutes(x); }).slice(0, 4);

    var talkHtml = '';
    if (talkTasks.length || heavy.length) {
      talkHtml = '<div class="fc-talklist"><h4>Jullie gesprekslijst</h4>';
      if (talkTasks.length) {
        talkHtml += '<p>Deze taken hebben jullie gemarkeerd om te bespreken:</p><ul class="fc-taglist">' +
          talkTasks.map(function (t) { return '<li class="fc-tag fc-tag--' + t.cat + '">💬 ' + esc(t.name) + '</li>'; }).join('') + '</ul>';
      }
      if (heavy.length) {
        talkHtml += '<p>Grote tijdvreters die nu helemaal bij één van jullie liggen:</p><ul class="fc-taglist">' +
          heavy.map(function (t) {
            var who = state.answers[t.id] === 'a' ? n.a : n.b;
            return '<li class="fc-tag fc-tag--fysiek">' + esc(t.name) + ' <small>(' + esc(who) + ', ± ' + fmtHours(weeklyMinutes(t)) + '/week)</small></li>';
          }).join('') + '</ul>';
      }
      talkHtml += '</div>';
    }

    var questions = '<div class="fc-questions"><h4>Drie vragen om mee te beginnen</h4><ol>' +
      CATEGORIES.map(function (c) { return '<li><span class="fc-q-kind fc-q-kind--' + c.id + '">' + c.short + '</span>' + esc(c.question) + '</li>'; }).join('') +
      '</ol></div>';

    return '' +
      '<div class="fc-head">' +
        '<span class="eyebrow">Stap 5 · Jullie uitkomst</span>' +
        '<h3>Zo verdelen ' + esc(n.a) + ' &amp; ' + esc(n.b) + ' het nu</h3>' +
        '<p>Dit is geen rapportcijfer, maar een startpunt voor jullie gesprek. Eerlijk betekent niet altijd 50/50: het gaat erom dat het voor jullie allebei klopt.</p>' +
      '</div>' +
      '<div class="fc-legend fc-legend--results" aria-hidden="true"><span class="fc-legend-a">■ ' + esc(n.a) + '</span><span class="fc-legend-b">■ ' + esc(n.b) + '</span></div>' +
      '<div class="fc-results">' + cards + '</div>' +
      insightsHtml +
      '<div class="fc-results-grid">' + talkHtml + questions + '</div>' +
      '<div class="fc-nav fc-nav--results">' +
        '<button type="button" class="btn btn-outline" data-fc-goto="emotioneel">&larr; Terug</button>' +
        '<div class="fc-actions">' +
          '<button type="button" class="btn btn-outline" data-fc-copy>Kopieer samenvatting</button>' +
          '<button type="button" class="btn btn-outline" data-fc-print>Print / bewaar als pdf</button>' +
          '<button type="button" class="btn btn-yellow" data-fc-reset>Opnieuw beginnen</button>' +
        '</div>' +
      '</div>' +
      '<p class="fc-feedback" role="status" data-fc-feedback></p>';
  }

  function summaryText() {
    var n = names();
    var lines = ['Onze Just Fair Check — ' + n.a + ' & ' + n.b, ''];
    CATEGORIES.forEach(function (c) {
      var s = score(c.id);
      if (s.shareA === null) { lines.push(c.title + ': nog niet ingevuld'); return; }
      var line = c.title + ': ' + n.a + ' ' + pct(s.shareA) + '% · ' + n.b + ' ' + (100 - pct(s.shareA)) + '%';
      if (c.id === 'fysiek') line += ' (± ' + fmtHours(s.minutes) + ' per week)';
      lines.push(line);
    });
    var talk = allTasks().filter(function (t) { return state.talk[t.id] && visible(t); });
    if (talk.length) {
      lines.push('', 'Om te bespreken:');
      talk.forEach(function (t) { lines.push('- ' + t.name); });
    }
    lines.push('', 'Doe de check ook: https://justfamily.nl/just-fair-check.html');
    return lines.join('\n');
  }

  // ---------------------------------------------------------------------------
  // Events
  function go(step, focus) {
    state.step = step;
    save();
    render();
    if (focus !== false) {
      var top = root.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: top, behavior: 'smooth' });
      var panel = root.querySelector('[data-fc-panel]');
      if (panel) panel.focus({ preventScroll: true });
    }
  }

  function bind() {
    root.querySelectorAll('[data-fc-goto]').forEach(function (b) {
      b.addEventListener('click', function () { go(b.getAttribute('data-fc-goto')); });
    });
    root.querySelectorAll('[data-fc-name]').forEach(function (inp) {
      inp.addEventListener('input', function () { state.names[inp.getAttribute('data-fc-name')] = inp.value; save(); });
    });
    root.querySelectorAll('[data-fc-situation]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var i = state.situation.indexOf(cb.value);
        if (cb.checked && i === -1) state.situation.push(cb.value);
        if (!cb.checked && i !== -1) state.situation.splice(i, 1);
        save();
        updateStepper();
      });
    });
    root.querySelectorAll('[data-fc-house]').forEach(function (r) {
      r.addEventListener('change', function () { state.house = r.value; save(); });
    });
    root.querySelectorAll('[data-fc-answer]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-task');
        var v = b.getAttribute('data-fc-answer');
        state.answers[id] = state.answers[id] === v ? undefined : v;
        if (!state.answers[id]) delete state.answers[id];
        save();
        refreshTask(b.closest('.fc-task'), id);
      });
    });
    root.querySelectorAll('[data-fc-talk]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-fc-talk');
        if (state.talk[id]) delete state.talk[id]; else state.talk[id] = true;
        save();
        refreshTask(b.closest('.fc-task'), id);
      });
    });
    root.querySelectorAll('[data-fc-fill]').forEach(function (b) {
      b.addEventListener('click', function () {
        tasksFor(b.getAttribute('data-fc-fill')).forEach(function (t) { if (!state.answers[t.id]) state.answers[t.id] = 's'; });
        save();
        go(state.step, false);
      });
    });
    root.querySelectorAll('[data-fc-remove]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-fc-remove');
        state.custom = state.custom.filter(function (c) { return c.id !== id; });
        delete state.answers[id]; delete state.talk[id];
        save();
        go(state.step, false);
      });
    });
    root.querySelectorAll('[data-fc-add]').forEach(function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var inp = f.querySelector('input');
        var sel = f.querySelector('select');
        var name = (inp.value || '').trim();
        if (!name) { inp.focus(); return; }
        state.custom.push({ id: 'eigen-' + Date.now(), cat: f.getAttribute('data-fc-add'), name: name, minWeek: sel ? Number(sel.value) : 0 });
        save();
        go(state.step, false);
        var again = root.querySelector('[data-fc-add] input');
        if (again) again.focus();
      });
    });
    var copy = root.querySelector('[data-fc-copy]');
    if (copy) copy.addEventListener('click', function () {
      var fb = root.querySelector('[data-fc-feedback]');
      var text = summaryText();
      var done = function () { fb.textContent = 'Samenvatting gekopieerd. Plak hem in een appje aan elkaar.'; };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
      } else { fallbackCopy(text); done(); }
    });
    var pr = root.querySelector('[data-fc-print]');
    if (pr) pr.addEventListener('click', function () { window.print(); });
    var reset = root.querySelector('[data-fc-reset]');
    if (reset) reset.addEventListener('click', function () {
      state.answers = {}; state.talk = {}; state.custom = [];
      go('start');
    });
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'absolute'; ta.style.left = '-9999px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  // Alleen de aangeklikte rij + teller bijwerken (geen volledige her-render, zodat de scrollpositie blijft)
  function refreshTask(li, id) {
    var ans = state.answers[id] || '';
    li.classList.toggle('is-answered', !!ans);
    li.classList.toggle('is-na', ans === 'na');
    li.classList.toggle('is-talk', !!state.talk[id]);
    li.querySelectorAll('[data-fc-answer]').forEach(function (b) {
      var on = b.getAttribute('data-fc-answer') === ans;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on);
    });
    var t = li.querySelector('[data-fc-talk]');
    if (t) { t.classList.toggle('is-on', !!state.talk[id]); t.setAttribute('aria-pressed', !!state.talk[id]); }
    var sc = score(state.step);
    var bar = root.querySelector('.fc-progress-bar span');
    var txt = root.querySelector('.fc-progress > span');
    if (bar) bar.style.width = (sc.total ? pct(sc.answered / sc.total) : 0) + '%';
    if (txt) txt.textContent = sc.answered + ' van ' + sc.total + ' ingevuld';
    var fill = root.querySelector('[data-fc-fill]');
    if (fill) fill.hidden = sc.answered >= sc.total;
    updateStepper();
  }

  function updateStepper() {
    ['fysiek', 'cognitief', 'emotioneel'].forEach(function (c) {
      var el = root.querySelector('.fc-step--' + c + ' small');
      if (el) { var s = score(c); el.textContent = s.answered + '/' + s.total; }
    });
  }

  render();
})();
