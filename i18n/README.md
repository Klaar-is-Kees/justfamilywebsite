# Engelse versie (automatisch)

**Je past alleen de Nederlandse pagina's aan.** De Engelse site op `justfamily.nl/en/` wordt bij elke push automatisch opnieuw opgebouwd door een GitHub Action.

## Hoe het werkt

```
Nederlandse pagina's (root)  ──►  i18n/build.py  ──►  /en/  (Engelse site)
                                       ▲
                     i18n/en.json  (vertaalgeheugen: NL-tekst → EN-tekst)
                     DeepL         (alleen voor nieuwe/gewijzigde teksten)
```

1. Je wijzigt of voegt tekst toe in een Nederlandse `.html`-pagina en pusht naar `main`.
2. De Action haalt alle teksten uit de pagina's (koppen, alinea's, knoppen, alt-teksten, meta-beschrijvingen, FAQ-schema, `llms.txt`).
3. Teksten die al in `i18n/en.json` staan, worden direct gebruikt. **Nieuwe of gewijzigde teksten** worden door DeepL vertaald en aan `en.json` toegevoegd (de Action commit dat bestand terug — doe daarna even `git pull`).
4. De Engelse pagina's worden gegenereerd met Engelse URL's, `lang="en"`, canonical, hreflang, `og:locale`, een NL/EN-wisselaar en een eigen `en/sitemap.xml` en `en/llms.txt`.
5. De hele site gaat live op GitHub Pages.

Teksten die niet meer op de site staan, worden automatisch uit `en.json` opgeruimd.

## Eenmalig instellen

1. **DeepL API-sleutel** – maak een gratis account op <https://www.deepl.com/pro-api> (DeepL API Free, 500.000 tekens/maand). Kopieer de sleutel (eindigt op `:fx`).
2. Ga in de GitHub-repository naar **Settings → Secrets and variables → Actions → New repository secret**. Naam: `DEEPL_API_KEY`, waarde: je sleutel.
3. **Settings → Pages → Build and deployment → Source: GitHub Actions** (in plaats van "Deploy from a branch"). Custom domain blijft `justfamily.nl`.

Zonder sleutel werkt alles ook, maar nieuwe teksten blijven dan Nederlands op de Engelse site totdat je ze vertaalt (de Action-log toont welke).

## Een vertaling verbeteren

Open `i18n/en.json`, zoek de Nederlandse tekst (links) en pas de Engelse tekst (rechts) aan. Die blijft bewaard zolang de Nederlandse tekst niet verandert. Wijzig je de Nederlandse tekst, dan wordt hij opnieuw vertaald.

## Handige extra's in de Nederlandse HTML

| Wat | Hoe |
|---|---|
| Iets **niet** vertalen (merknaam, code) | `translate="no"` op het element |
| Iets **alleen** op de Nederlandse site tonen | `data-lang-only="nl"` op het element |
| Meldingen uit JavaScript vertaalbaar maken | zet de tekst in een `data-msg-…`-attribuut in de HTML (zie het contactformulier) |
| Nieuwe pagina | gewoon toevoegen in de root; hij verschijnt als `/en/<zelfde-naam>.html`. Wil je een Engelse bestandsnaam, voeg hem toe aan `pages` in `i18n/config.json`. Kopieer ook de taalwisselaar en de drie `hreflang`-regels uit een bestaande pagina. |
| Andere tekst/URL alleen in de Engelse versie (bijv. Engelse app-store-badges) | voeg een paar toe aan `replacements` in `config.json`, bijv. `["/assets/img/badges/appstore.png", "/assets/img/badges/appstore-en.png"]` |

## Lokaal testen

```bash
pip install beautifulsoup4
python3 i18n/build.py                       # zonder DeepL
DEEPL_API_KEY=xxx:fx python3 i18n/build.py  # met DeepL
```

De map `en/` staat in `.gitignore`: hij wordt altijd opnieuw gegenereerd, dus nooit handmatig aanpassen.
