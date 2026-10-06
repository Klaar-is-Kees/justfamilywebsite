#!/usr/bin/env python3
"""
Justfamily — Engelse site genereren uit de Nederlandse bron.

De Nederlandse pagina's in de root zijn de ENIGE bron. Dit script:
  1. leest elke Nederlandse .html-pagina,
  2. zoekt elke tekst op in het vertaalgeheugen (i18n/en.json),
  3. laat nieuwe/gewijzigde teksten automatisch vertalen door DeepL
     (alleen als de omgevingsvariabele DEEPL_API_KEY gezet is) en bewaart ze in en.json,
  4. schrijft de Engelse pagina's naar /en/ (met Engelse URL's, lang="en",
     canonical, hreflang, og:locale, taalwisselaar, JSON-LD, llms.txt en sitemap).

Gebruik:   python3 i18n/build.py            (vanuit de root van de repository)
Vereist:   pip install beautifulsoup4
"""
import html
import json
import os
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

from bs4 import BeautifulSoup, Comment, Doctype, NavigableString, Tag

ROOT = Path(__file__).resolve().parent.parent
I18N = ROOT / "i18n"
CONFIG = json.loads((I18N / "config.json").read_text(encoding="utf-8"))
MEMORY_FILE = I18N / "en.json"
OUT = ROOT / CONFIG["output_dir"]
BASE = CONFIG["base_url"].rstrip("/")
PAGES = CONFIG["pages"]  # nl-bestandsnaam -> en-bestandsnaam

# Tags die als "inline" gelden: een element dat alleen tekst + deze tags bevat
# wordt als één geheel vertaald (zodat zinnen met <strong>, <a> etc. heel blijven).
INLINE = {"a", "abbr", "b", "br", "code", "em", "i", "mark", "small", "span",
          "strong", "sub", "sup", "u", "time", "wbr"}
SKIP = {"script", "style", "noscript", "svg", "template", "code", "pre"}
ATTRS = {"alt", "title", "aria-label", "placeholder"}
META_NAMES = {"description", "twitter:title", "twitter:description"}
META_PROPS = {"og:title", "og:description"}
LETTER = re.compile(r"[A-Za-zÀ-ÿ]")


# --------------------------------------------------------------------------- #
#  Vertaalgeheugen
# --------------------------------------------------------------------------- #
def norm(s):
    return re.sub(r"\s+", " ", s).strip()


memory = json.loads(MEMORY_FILE.read_text(encoding="utf-8")) if MEMORY_FILE.exists() else {}
used = {}          # sleutel -> vertaling, in volgorde van gebruik (wordt het nieuwe en.json)
pending = {}       # sleutel -> "html" | "text"  (nog te vertalen)


def want(key, kind):
    """Registreer een tekst die vertaald moet worden (eerste pass)."""
    if not key or not LETTER.search(key):
        return
    if key in memory:
        used.setdefault(key, memory[key])
    else:
        pending.setdefault(key, kind)
        used.setdefault(key, None)


def tr(key):
    """Geef de vertaling (of de Nederlandse tekst als er (nog) geen vertaling is)."""
    if not key or not LETTER.search(key):
        return key
    val = used.get(key) or memory.get(key)
    return val if val else key


def deepl(texts, html_mode):
    key = os.environ.get("DEEPL_API_KEY", "").strip()
    host = "api-free.deepl.com" if key.endswith(":fx") else "api.deepl.com"
    out = []
    for i in range(0, len(texts), 40):
        chunk = texts[i:i + 40]
        params = [("source_lang", "NL"), ("target_lang", CONFIG.get("deepl_target_lang", "EN-GB")),
                  ("preserve_formatting", "1")]
        if html_mode:
            params.append(("tag_handling", "html"))
        if CONFIG.get("deepl_glossary_id"):
            params.append(("glossary_id", CONFIG["deepl_glossary_id"]))
        params += [("text", t) for t in chunk]
        req = urllib.request.Request(
            f"https://{host}/v2/translate",
            data=urllib.parse.urlencode(params).encode(),
            headers={"Authorization": f"DeepL-Auth-Key {key}",
                     "Content-Type": "application/x-www-form-urlencoded"})
        with urllib.request.urlopen(req, timeout=60) as r:
            data = json.loads(r.read().decode())
        out += [t["text"] for t in data["translations"]]
    return out


def translate_pending():
    if not pending:
        return
    if not os.environ.get("DEEPL_API_KEY"):
        print(f"\n⚠️  {len(pending)} nieuwe tekst(en) zonder vertaling en geen DEEPL_API_KEY gezet.")
        print("   Deze blijven voorlopig Nederlands op de Engelse site:")
        for k in pending:
            print("   -", k[:110])
        return
    for mode in ("html", "text"):
        keys = [k for k, m in pending.items() if m == mode]
        if not keys:
            continue
        print(f"DeepL: {len(keys)} nieuwe {mode}-tekst(en) vertalen…")
        for k, v in zip(keys, deepl(keys, mode == "html")):
            used[k] = v


# --------------------------------------------------------------------------- #
#  URL-mapping NL -> EN
# --------------------------------------------------------------------------- #
def en_path(path):
    """'/over-just.html' -> '/en/about.html'.  Geeft None als het geen pagina is."""
    p = path.lstrip("/")
    if p in ("", "index.html") and path.startswith("/"):
        return "/" + CONFIG["output_dir"] + "/"
    if p in PAGES:
        target = PAGES[p]
        return "/" + CONFIG["output_dir"] + "/" + ("" if target == "index.html" else target)
    if p in CONFIG.get("extra_files", {}):
        return "/" + CONFIG["output_dir"] + "/" + CONFIG["extra_files"][p]
    return None


def map_href(href):
    if not href or not href.startswith("/") or href.startswith("//"):
        return href
    path, sep, frag = href.partition("#")
    new = en_path(path)
    return (new + sep + frag) if new else href


def map_abs(url):
    if url.startswith(BASE + "/") or url == BASE:
        rest = url[len(BASE):] or "/"
        new = map_href(rest)
        return BASE + new
    return url


def nl_url(nl_file):
    return BASE + "/" + ("" if nl_file == "index.html" else nl_file)


# --------------------------------------------------------------------------- #
#  HTML-verwerking
# --------------------------------------------------------------------------- #
def skipped(tag):
    return (tag.name in SKIP or tag.get("translate") == "no"
            or tag.has_attr("data-no-translate") or tag.get("data-lang-only") == "nl")


def is_segment(tag):
    """Alleen tekst + inline tags, en er staat echte tekst in."""
    if tag.name in SKIP or tag.name in ("html", "head", "body"):
        return False
    for d in tag.descendants:
        if isinstance(d, Tag) and (d.name not in INLINE or skipped(d)):
            return False
    return bool(LETTER.search(tag.get_text()))


def walk(el, apply):
    for child in list(el.children):
        if isinstance(child, (Comment, Doctype)):
            continue
        if isinstance(child, Tag):
            if skipped(child):
                continue
            if is_segment(child):
                key = norm(child.decode_contents())
                if apply:
                    val = tr(key)
                    if val != key:
                        child.clear()
                        frag = BeautifulSoup(val, "html.parser")
                        for n in list(frag.contents):
                            child.append(n.extract())
                else:
                    want(key, "html")
            else:
                walk(child, apply)
        elif isinstance(child, NavigableString) and child.strip():
            key = norm(html.escape(str(child), quote=False))
            if apply:
                val = tr(key)
                if val != key:
                    lead = " " if str(child)[:1].isspace() else ""
                    trail = " " if str(child)[-1:].isspace() else ""
                    child.replace_with(NavigableString(lead + html.unescape(val) + trail))
            else:
                want(key, "html")


def in_skipped(tag):
    return any(isinstance(p, Tag) and skipped(p) for p in [tag, *tag.parents])


def attr_targets(soup):
    for tag in soup.find_all(True):
        if in_skipped(tag) and tag.name != "meta":
            continue
        for a in list(tag.attrs):
            if a in ATTRS or a.startswith("data-msg-"):
                yield tag, a
        if tag.name == "meta" and (tag.get("name") in META_NAMES or tag.get("property") in META_PROPS):
            yield tag, "content"


JSONLD_KEYS = {"description", "text"}


def jsonld_walk(obj, fn):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if isinstance(v, str) and (k in JSONLD_KEYS or (k == "name" and obj.get("@type") == "Question")):
                obj[k] = fn(v)
            else:
                jsonld_walk(v, fn)
    elif isinstance(obj, list):
        for v in obj:
            jsonld_walk(v, fn)


def process(soup, apply):
    walk(soup, apply)
    for tag, a in attr_targets(soup):
        v = norm(tag[a])
        if apply:
            tag[a] = tr(v)
        else:
            want(v, "text")
    for s in soup.find_all("script", type="application/ld+json"):
        data = json.loads(s.string)
        if apply:
            jsonld_walk(data, lambda v: tr(norm(v)))
            s.string = "\n" + json.dumps(data, ensure_ascii=False, indent=2) + "\n"
        else:
            jsonld_walk(data, lambda v: (want(norm(v), "text"), v)[1])


def localize(soup, nl_file, en_file):
    """Taal-, URL- en metadata-aanpassingen voor de Engelse versie."""
    if soup.html:
        soup.html["lang"] = "en"
    for t in soup.select('[data-lang-only="nl"]'):
        t.decompose()
    # taalwisselaar wijst terug naar de Nederlandse pagina
    for a in soup.select("a.lang-switch"):
        a["href"] = "/" + ("" if nl_file == "index.html" else nl_file)
        a["hreflang"] = a["lang"] = "nl"
        a["aria-label"] = "Nederlandse versie"
        a.string = "NL"
    # interne links
    for t in soup.find_all(href=True):
        if "lang-switch" in (t.get("class") or []) or t.get("hreflang"):
            continue
        if t.name == "link" and t.get("rel") == ["canonical"]:
            t["href"] = map_abs(t["href"])
        else:
            t["href"] = map_href(t["href"])
    for m in soup.find_all("meta", property="og:url"):
        m["content"] = map_abs(m["content"])
    for m in soup.find_all("meta", property="og:locale"):
        m["content"] = CONFIG.get("og_locale", "en_GB")
    for m in soup.find_all("meta", property="og:locale:alternate"):
        m["content"] = "nl_NL"
    # hreflang toevoegen als die op de NL-pagina ontbreekt
    if not soup.find("link", hreflang=True) and soup.head:
        en_url = map_abs(nl_url(nl_file))
        for lang, url in (("nl", nl_url(nl_file)), ("en", en_url), ("x-default", nl_url(nl_file))):
            soup.head.append(soup.new_tag("link", rel="alternate", hreflang=lang, href=url))
        print(f"   tip: voeg hreflang-links toe aan {nl_file} (staan nu alleen op de Engelse versie)")
    # JSON-LD: urls die naar pagina's wijzen niet aanpassen (organisatie-id blijft gelijk), wel taal
    for s in soup.find_all("script", type="application/ld+json"):
        data = json.loads(s.string)
        if isinstance(data, dict) and data.get("@type") in ("FAQPage", "WebPage", "MobileApplication"):
            data["inLanguage"] = "en"
            s.string = "\n" + json.dumps(data, ensure_ascii=False, indent=2) + "\n"


def render(soup, nl_file):
    out = str(soup)
    note = (f"<!-- AUTOMATISCH GEGENEREERD door i18n/build.py — niet handmatig aanpassen.\n"
            f"     Pas de Nederlandse pagina /{nl_file} aan; vertalingen staan in i18n/en.json. -->\n")
    out = re.sub(r"(<!DOCTYPE html>\n?)", lambda m: m.group(1) + note, out, count=1, flags=re.I)
    for a, b in CONFIG.get("replacements", []):
        out = out.replace(a, b)
    return out


# --------------------------------------------------------------------------- #
#  llms.txt & sitemap
# --------------------------------------------------------------------------- #
def llms_lines():
    src = ROOT / "llms.txt"
    return src.read_text(encoding="utf-8").splitlines() if src.exists() else []


def process_llms(apply):
    out = []
    for line in llms_lines():
        m = re.match(r"^(\s*(?:[-*>#]+\s*)?)(.*)$", line)
        prefix, body = m.group(1), m.group(2)
        key = norm(body)
        if not apply:
            want(key, "text")
            continue
        new = prefix + tr(key) if key else line
        new = re.sub(re.escape(BASE) + r"/[^\s)]*", lambda mm: map_abs(mm.group(0)), new)
        out.append(new)
    return "\n".join(out) + "\n"


def build_sitemap():
    src = ROOT / "sitemap.xml"
    if not src.exists():
        return
    xml = src.read_text(encoding="utf-8")
    xml = re.sub(r"<loc>(.*?)</loc>", lambda m: f"<loc>{map_abs(m.group(1).strip())}</loc>", xml)
    (OUT / "sitemap.xml").write_text(xml, encoding="utf-8")


# --------------------------------------------------------------------------- #
def main():
    os.chdir(ROOT)
       exclude = set(CONFIG.get("exclude", []))
    nl_files = sorted(p.name for p in ROOT.glob("*.html") if p.name not in exclude)
    for f in nl_files:
        if f not in PAGES:
            PAGES[f] = f
            print(f"ℹ️  Nieuwe pagina {f} gevonden → /{CONFIG['output_dir']}/{f} "
                  f"(voeg hem toe aan i18n/config.json voor een Engelse bestandsnaam)")

    # Pass 1: alle teksten verzamelen
    soups = {}
    for f in nl_files:
        soup = BeautifulSoup((ROOT / f).read_text(encoding="utf-8"), "html.parser")
        process(soup, apply=False)
        soups[f] = soup
    process_llms(apply=False)

    # Nieuwe teksten vertalen
    translate_pending()

    # Pass 2: vertalingen toepassen en wegschrijven
    OUT.mkdir(exist_ok=True)
    for f, soup in soups.items():
        process(soup, apply=True)
        localize(soup, f, PAGES[f])
        (OUT / PAGES[f]).write_text(render(soup, f), encoding="utf-8")
        print(f"✓ {f:22s} → {CONFIG['output_dir']}/{PAGES[f]}")
    if llms_lines():
        (OUT / "llms.txt").write_text(process_llms(apply=True), encoding="utf-8")
        print(f"✓ {'llms.txt':22s} → {CONFIG['output_dir']}/llms.txt")
    build_sitemap()
    print(f"✓ {'sitemap.xml':22s} → {CONFIG['output_dir']}/sitemap.xml")

    # Vertaalgeheugen bijwerken: alleen teksten die nog op de site staan (in volgorde van de site)
    clean = {k: v for k, v in used.items() if v}
    removed = len([k for k in memory if k not in clean])
    MEMORY_FILE.write_text(json.dumps(clean, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"\nVertaalgeheugen: {len(clean)} teksten"
          + (f", {removed} verouderde verwijderd" if removed else "")
          + (f", {sum(1 for k in pending if used.get(k))} nieuw vertaald" if pending else ""))


if __name__ == "__main__":
    sys.exit(main())
