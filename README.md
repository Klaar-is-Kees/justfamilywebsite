# Justfamily.nl — website

Statische website voor **justfamily.nl**, opgebouwd in dezelfde huisstijl als keesisklaar.nl (zelfde eigenaar, rebrand van "Klaar is Kees" naar "Just"). Geen build-stap nodig — puur HTML/CSS/JS, direct te hosten via GitHub Pages.

## Inhoud

```
justfamily/
├── index.html              → Homepage (incl. EU-privacy sectie & experts-sectie)
├── over-just.html          → Ons verhaal + team + adviseurs
├── faq.html                → Veelgestelde vragen (met FAQPage schema.org)
├── contact.html
├── privacybeleid.html      → Herschreven vanuit de Klaar is Kees-privacyverklaring
├── cookiebeleid.html
├── llms.txt                → Machine-leesbare samenvatting voor AI-crawlers (GEO)
├── robots.txt              → Staat GPTBot/ClaudeBot/PerplexityBot/etc. expliciet toe
├── sitemap.xml
├── site.webmanifest
├── CNAME                   → bevat "justfamily.nl" (voor custom domain op GitHub Pages)
└── assets/
    ├── css/style.css       → Kleuren & typografie 1-op-1 uit jullie theme.json
    ├── js/main.js          → Lottie-loader, mobiel menu, FAQ-accordion
    ├── lottie/*.json       → Alle originele Lottie-bestanden uit de database
    ├── img/
    │   ├── icons/          → Nieuw "Just"-logo + icoon (zelfde stijl: huis/klok/hart)
    │   ├── team/           → Teamfoto's
    │   ├── screens/        → Echte app-screenshots (kalender, taakverdeling)
    │   └── badges/         → Officiële App Store / Google Play badges
```

## Site live zetten via GitHub Pages

1. Maak een nieuwe (lege) GitHub-repository, bijv. `justfamily-website`.
2. Zet alle bestanden uit deze map in de root van die repository en commit/push ze.
3. Ga naar **Settings → Pages** in de repository.
4. Kies bij "Build and deployment" → Source: **Deploy from a branch**, branch `main`, map `/ (root)`.
5. Zet bij **Custom domain** `justfamily.nl` in (het CNAME-bestand staat al klaar) en wacht tot DNS/HTTPS geverifieerd zijn.
6. Zorg dat bij je domeinregistrar (waar justfamily.nl geregistreerd is) de DNS A-records naar GitHub Pages wijzen:
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```
   en eventueel een `www` CNAME naar `<jouw-github-gebruikersnaam>.github.io`.

Na de eerste keer deployen kan het tot ~24 uur duren voordat DNS en het SSL-certificaat overal actief zijn.

## Belangrijke aandachtspunten vóór publicatie

1. **App store-links zijn placeholders.** In `index.html` staan tijdelijke links naar apps.apple.com/play.google.com. Vervang deze door de echte, actuele listing-URL's van de app (zoek/vervang op `apps.apple.com/nl/app/klaar-is-kees` en `play.google.com/store/apps`).
2. **E-mailadressen zijn omgezet naar het nieuwe domein** (`info@justfamily.nl`, `elien@justfamily.nl`, `app@justfamily.nl`). Zorg dat deze mailboxen ook daadwerkelijk bestaan of doorverwijzen, vóórdat de site live gaat.
3. **De 3 nieuwe adviseurs (Niels Bartels, Veronne & Fleur van der Meijs, Arthur Kramer)** staan nu met initialen-avatars op de site (geen foto's beschikbaar). Vervang deze door echte foto's zodra je die hebt, en zorg dat elke genoemde adviseur akkoord is met vermelding op de site (naam, functie, bedrijfsnaam).
4. **Controleer de EU-dataopslag/AVG-claim feitelijk.** De tekst "jouw gegevens blijven in Europa, altijd versleuteld... volledig volgens de AVG en de Europese AI-verordening" is een concrete, controleerbare bewering. Zorg dat dit daadwerkelijk klopt met je huidige hosting/subverwerkers vóórdat de site live gaat — onjuiste compliance-claims kunnen juridisch risico opleveren.
5. **Privacybeleid & cookiebeleid zijn automatisch herschreven** (naam/domein vervangen), maar zijn **niet opnieuw juridisch gecheckt**. Laat een jurist er nog even overheen kijken, zeker het bedrijfsadres/rechtsvorm (nu overgenomen als "AI Life, Eeuwige Jeugdlaan 34, 1022 KG Amsterdam" — controleer of dit nog klopt of dat er een nieuwe entiteit is voor Just/Justfamily).
6. **Bedrijfsadres in structured data**: in `generate_common.py`-achtige JSON-LD (Organization schema, bovenaan elke pagina) staat `addressLocality: Amsterdam` — dit is afgeleid uit de postcode 1022 KG en niet expliciet bevestigd; controleer dit.
7. **OG-share-afbeelding, favicons en logo zijn nieuw/definitief.** Het officiële "Just family"-logo (aangeleverd) staat nu in `assets/img/logo/justfamily-logo.png` en wordt gebruikt in de header en footer van alle pagina's. Voor de favicon/app-icon (16–512px) wordt een losstaande, tekstvrije iconmark gebruikt (`assets/img/icons/just-icon.svg`) in dezelfde stijl — dat is bewust: het volledige logo met "Just family"-tekst is bij 16–32px onleesbaar, vandaar dat favicons altijd alleen het beeldmerk tonen (standaardpraktijk). Wil je dat de favicon exact het beeldmerk uit het nieuwe logobestand gebruikt in plaats van de losse hertekende versie, lever dan een aparte vierkante iconversie (zonder tekst, zonder overlap) aan.
8. **WhatsApp-link is een aanname.** Je gaf geen nummer of link door, dus de knop verwijst nu naar `https://wa.me/31612673437` (hetzelfde nummer als elders op de site). Klopt dit niet, of wil je liever een WhatsApp-*kanaal*/community-link gebruiken in plaats van een persoonlijk nummer? Pas dan de `SOCIAL_LINKS`-lijst bovenin `generate_common.py` aan (of vervang de `href` van de WhatsApp-link handmatig in de HTML-bestanden) en genereer opnieuw.
9. **Social-iconen** (Instagram, Facebook, Substack, WhatsApp) zijn zelf getekende SVG's in dezelfde lijnstijl als de rest van de site, te vinden in `assets/img/icons/social/`. Ze kleuren automatisch mee via CSS (`mask`), dus zijn makkelijk aan te passen van kleur.

## GEO / AI-zichtbaarheid — wat er al is ingericht

- **JSON-LD structured data** op elke pagina: `Organization`, `MobileApplication` en op de FAQ-pagina een volledig `FAQPage`-schema met de echte vragen/antwoorden.
- **`llms.txt`** in de root: een kort, machine-leesbaar overzicht van wie Just is, de belangrijkste pagina's en de kernfeiten/cijfers — zodat AI-systemen (ChatGPT, Claude, Perplexity, Google AI Overviews) de juiste informatie direct kunnen citeren.
- **`robots.txt`** staat de bekende AI-crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot, Bytespider) expliciet toe.
- **Autoriteit/bronvermelding**: de site citeert concrete, herleidbare cijfers ("50% wil eerlijk verdelen, 9% lukt dit") en noemt met naam en functie de adviseurs en samenwerkingspartners (relatietherapeuten, Deloitte, Suniverse) — dit soort verifieerbare, aan personen/organisaties gekoppelde claims wegen mee in hoe AI-systemen een bron als betrouwbaar beoordelen. Voeg voor extra autoriteit gerust links toe naar externe vermeldingen (persartikelen, LinkedIn-posts van adviseurs, de Substack van Elien) zodra die er zijn — nu zijn dat nog losse vermeldingen zonder link.

## Interactieve elementen (nieuw)

- **Sticky header** die bij scrollen krimpt en een schaduw krijgt (`assets/js/main.js`, `.site-header--scrolled` in `assets/css/style.css`)
- **Scroll-reveal animaties**: secties en kaarten faden/schuiven in zodra ze in beeld komen (`[data-reveal]`)
- **Tellende statistieken** op de homepage (50% / 9% / 1) die oplopen zodra je scrollt (`[data-count]`)
- **Interactieve taakverdeel-demo**: een schuifbalk op de homepage waarmee bezoekers zelf een verdeling tussen "jij" en "je partner" kunnen instellen, met live bijgewerkte uren/percentages
- **FAQ-accordion**: er staat steeds maar één antwoord tegelijk open
- **Werkend contactformulier** op `contact.html`: valideert naam/e-mail/bericht client-side en opent daarna de mail-app van de bezoeker met een vooringevuld bericht aan `info@justfamily.nl` (er is geen backend/serverless functie nodig, maar er wordt ook niets automatisch verzonden vanaf de site zelf)
- **Cookiebanner** onderaan elke pagina (Akkoord/Weigeren, keuze onthouden via `localStorage`, met link naar het cookiebeleid)

Alle interactiviteit is met kwetsbare bezoekers/no-JS in gedachten gebouwd: zonder JavaScript tonen de tellers gewoon de eindwaarde, blijft de FAQ werken via de native `<details>`-tags, en is de rest van de site normaal leesbaar.

## Engelse (US) versie — nieuw

De site is nu tweetalig. De Nederlandse pagina's (root, zoals voorheen) blijven de hoofdversie; de Engelse vertaling staat in de map `en/`:

```
en/
├── index.html           → vertaling van index.html
├── about.html            → vertaling van over-just.html
├── faq.html               → vertaling van faq.html (incl. FAQPage schema.org in het Engels)
├── contact.html         → vertaling van contact.html
├── privacy-policy.html  → vertaling van privacybeleid.html
└── cookie-policy.html   → vertaling van cookiebeleid.html
```

Hoe dit is opgezet:
- **Hreflang-tags** op élke pagina (NL én EN) in de `<head>`, zodat zoekmachines en AI-crawlers weten welke taalversie bij welke hoort en de Nederlandse pagina als `x-default` (hoofdversie) herkennen.
- **Taalwisselaar** (rondje "EN" / "NL") rechtsboven in de header, naast de "Download de app"-knop — linkt direct naar de vertaalde versie van de huidige pagina.
- **`sitemap.xml`** bevat nu alle 12 pagina's (6 NL + 6 EN) met onderlinge hreflang-verwijzingen.
- **`llms.txt`** vermeldt beide taalversies apart, zodat AI-systemen ook de Engelse pagina's correct kunnen citeren.
- **`assets/js/main.js`** detecteert de paginataal via `<html lang="...">` en toont dynamische teksten (contactformulier-foutmeldingen, carousel-labels) automatisch in de juiste taal — er is maar één gedeeld JS-bestand voor beide taalversies.
- Alle afbeeldingen, Lottie-animaties, CSS en het logo worden **hergebruikt** vanuit `/assets/` — die hoeven niet dubbel te worden aangeleverd.

**Let op bij de Engelse juridische pagina's:** `privacy-policy.html` en `cookie-policy.html` zijn zorgvuldige vertalingen, maar expliciet gemarkeerd als "convenience translation" met een verwijzing dat bij afwijkingen de Nederlandse versie leidend is — dat is de gebruikelijke juridische aanpak bij meertalige voorwaarden. Laat ook de Engelse tekst nog even juridisch nalopen, met name als je actief buiten Nederland gaat werven (bijv. VS/VK), omdat daar mogelijk aanvullende regels gelden (zoals CCPA in Californië) die niet in deze vertaling zijn verwerkt.

Nieuwe pagina toevoegen of tekst aanpassen? Doe dat voortaan in **beide** talen — er is geen gedeeld sjabloonsysteem meer (de originele Python-generatorscripts zijn niet langer onderdeel van deze levering), dus de NL- en EN-bestanden staan los naast elkaar.

## Crowdfundingpagina (`campagne.html`) — belangrijk, lees dit vóór je live gaat

Deze pagina doet drie dingen die een **statische GitHub Pages-site technisch niet uit zichzelf kan**: echt geld verwerken, persoonsgegevens opslaan, en een écht live teller bijhouden. Ik heb 'm zo gebouwd dat-ie met een paar losse, gratis diensten toch volledig werkt — maar er moeten een paar dingen ingesteld worden vóórdat 'ie live mag.

### 1. Betalingen via Mollie en/of Stripe

Een statische site kan geen betalingen zelf verwerken (daarvoor is een backend nodig met een geheime API-sleutel, die je nooit in een GitHub-repo mag zetten). De oplossing: **Payment Links** — kant-en-klare betaalpagina's die je zelf aanmaakt in je Mollie- of Stripe-dashboard, met een vast bedrag per pakket.

Wat je moet doen:
1. Maak in **Mollie** (of **Stripe** → "Payment Links") 4 vaste betaallinks aan: €35, €60, €750, €1.500. Maak eventueel ook een "vrij bedrag"-link voor het "Ander bedrag"-pakket.
2. Open `assets/js/crowdfunding.js` en vervang in het object `PAYMENT_LINKS` elke `VERVANG-...-LINK-...` door de echte URL die Mollie/Stripe je geeft.
3. Zodra iemand het formulier invult, verschijnen de "Betaal via Mollie"/"Betaal via Stripe"-knoppen met de juiste link voor het gekozen bedrag.

**Let op:** de betaalknoppen linken naar externe, kant-en-klare checkoutpagina's van Mollie/Stripe zelf — Just (en deze site) ziet of bewaart nooit kaart- of bankgegevens. Dat is ook precies waarom dit zonder backend kan.

**Tikkie** is nu als derde optie toegevoegd — populair in Nederland, lage drempel, werkt via iDEAL/ABN AMRO:
1. Maak in de **Tikkie-app** (of via **Tikkie Zakelijk**/de Tikkie API als je dat al gebruikt) 4 betaalverzoeken aan: €35, €60, €750, €1.500. In de gewone Tikkie-app kun je een verzoek meerdere keren laten betalen door verschillende mensen (niet per se eenmalig) — controleer dit bij het aanmaken.
2. **Check zelf het maximumbedrag** dat jouw Tikkie-account per verzoek toestaat — dat hangt af van je verificatieniveau bij ABN AMRO en kan voor de €750- of €1.500-tier ontoereikend zijn. Is dat zo, laat die knop dan voor die tiers weg en verwijs door naar de bankoverschrijving (die staat er al als alternatief).
3. Plak de 4 Tikkie-links in `assets/js/crowdfunding.js`, in het `TIKKIE_LINKS`-blok (bij `PAYMENT_LINKS.tikkie`), op dezelfde manier als bij Mollie/Stripe.
4. Tikkie (de gewone consumentenversie) heeft **geen publieke API voor individuen** om betalingen automatisch te bevestigen — dit blijft dus altijd onderdeel van de handmatige update van `campaign-data.json` (zie punt 3 hieronder), ook als je Mollie/Stripe later wél automatiseert.

### 2. Donorgegevens (naam, e-mail, bedrijf, btw, marketing-opt-in) → info@keesisklaar.nl

Het formulier heeft ook geen backend om naartoe te sturen. Ik heb 'm voorbereid voor **Formspree** (gratis tot 50 verzendingen/maand, formspree.io) — een veelgebruikte, eenvoudige dienst die formulierinzendingen rechtstreeks doormailt.

Wat je moet doen:
1. Maak een gratis account op [formspree.io](https://formspree.io) en maak een nieuw formulier aan met als ontvangend e-mailadres **info@keesisklaar.nl** (zoals gevraagd — dit stel je in bij Formspree zelf, niet in de code).
2. Je krijgt een endpoint-URL zoals `https://formspree.io/f/abcd1234`.
3. Vervang in `campagne.html` het `action="..."` attribuut van `<form id="donate-form">` door die URL.

Zonder deze stap werkt het formulier nog gewoon (validatie, bedrag kiezen, betaalknoppen tonen), maar wordt er nergens een melding van verstuurd — de JS herkent de placeholder-URL en onderdrukt dan bewust de (anders foutieve) verzending.

**Let op — AVG:** je geeft nu donorgegevens door aan een Amerikaanse derde partij (Formspree). Check hun verwerkersvoorwaarden en overweeg dit kort te vermelden in `privacybeleid.html` onder een nieuw kopje over de crowdfundingcampagne. Wil je dit liever volledig in eigen beheer (EU-only, zoals de rest van de site claimt), dan is een EU-gehoste formulierdienst (bv. formcarry.com met EU-region, of een eigen kleine serverless functie) een beter alternatief.

### 3. De "live" teller

Een écht live teller (die automatisch meetelt zodra iemand betaalt) vereist een backend die Mollie/Stripe kan bevragen — dat gaat verder dan een statische site. Ik heb een **werkbare tussenoplossing** gebouwd:

- De teller op de pagina leest `campaign-data.json` (in de hoofdmap) uit en toont dat bedrag, inclusief een animerende voortgangsbalk en een "LIVE"-stipje.
- **Jij werkt dat bestand handmatig bij**: check 1–2x per dag (of vaker rond de deadline) het totaal in je Mollie-/Stripe-dashboard én je Tikkie-app/overzicht, tel ze bij elkaar op, pas `raised`, `donors` en `updated` aan in `campaign-data.json`, en commit/push naar GitHub. Binnen enkele minuten (GitHub Pages' cache) zien bezoekers het nieuwe bedrag.
- Dit is dus "semi-live" (zo actueel als jij 'm bijhoudt), niet milliseconde-live. Voor echte real-time updates is een kleine serverless functie nodig (bv. een gratis Cloudflare Worker die de Mollie/Stripe API bevraagt) — kan ik voor je opzetten als je dat wilt, dat valt buiten een pure statische GitHub Pages-site.
- Het **doelbedrag staat nu op €25.000** als placeholder — pas `goal` in `campaign-data.json` aan naar je eigen streefbedrag.

### 4. Overige aandachtspunten

- **Deadline-aanname**: de countdown rekent naar **2 november 2026**, 23:59 (Nederlandse tijd). Klopt dat jaartal? Pas anders `data-deadline` aan op de `<div id="countdown">` in `campagne.html` (ISO-formaat, bv. `2026-11-02T23:59:59+01:00`).
- **IBAN voor rechtstreekse overschrijving** staat vermeld (AI Life — NL20 ABNA 0141910909) als alternatief voor wie liever niet via Mollie/Stripe betaalt — handig voor met name de €750/€1.500-pakketten, die vaker via factuur/overschrijving lopen.
- **Bevestigingsmail naar de donateur zelf** ontbreekt nog (nu krijgt alleen info@keesisklaar.nl een melding). Formspree kan dit met een betaald plan ("autoresponder"); anders is dit iets om handmatig op te volgen.
- **Btw-nummer wordt niet gevalideerd** (geen check op geldig format) — als dat belangrijk is voor je facturatie, laat het weten, dan voeg ik een eenvoudige formaatcheck toe.
- De pagina staat nu **alleen in het Nederlands**. Zeg het als je 'm ook in het Engels wilt.

## Kleuren & typografie (referentie)


| Naam | Hex |
|---|---|
| Primary Blue | `#5578f6` |
| Mustard Yellow | `#f9d22d` |
| Old Pink | `#eb91b7` |
| Orange | `#ea5f38` |
| Soft Black | `#39393a` |
| Teal | `#095550` |
| Sky | `#71c9e4` |
| Off-white | `#fbfaf3` |

Font: **Manrope** (Google Fonts), body-gewicht 300, koppen 700–800.
