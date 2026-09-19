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

## GEO / AI-zichtbaarheid — wat er al is ingericht

- **JSON-LD structured data** op elke pagina: `Organization`, `MobileApplication` en op de FAQ-pagina een volledig `FAQPage`-schema met de echte vragen/antwoorden.
- **`llms.txt`** in de root: een kort, machine-leesbaar overzicht van wie Just is, de belangrijkste pagina's en de kernfeiten/cijfers — zodat AI-systemen (ChatGPT, Claude, Perplexity, Google AI Overviews) de juiste informatie direct kunnen citeren.
- **`robots.txt`** staat de bekende AI-crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot, Bytespider) expliciet toe.
- **Autoriteit/bronvermelding**: de site citeert concrete, herleidbare cijfers ("50% wil eerlijk verdelen, 9% lukt dit") en noemt met naam en functie de adviseurs en samenwerkingspartners (relatietherapeuten, Deloitte, Suniverse) — dit soort verifieerbare, aan personen/organisaties gekoppelde claims wegen mee in hoe AI-systemen een bron als betrouwbaar beoordelen. Voeg voor extra autoriteit gerust links toe naar externe vermeldingen (persartikelen, LinkedIn-posts van adviseurs, de Substack van Elien) zodra die er zijn — nu zijn dat nog losse vermeldingen zonder link.

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
