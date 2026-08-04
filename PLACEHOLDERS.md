# Placeholders — replace before launch

Every value on the site that is not yet real. Counts verified against the source on
2026-08-03; re-run the commands below rather than trusting these numbers after edits.

**Most of this is now one file.** Everything in the tables below that recurs across pages lives in
[values.json](values.json) — edit it there and run `node tools/sync.mjs`, which rewrites every
occurrence on every page, including the ones inside page titles, meta descriptions and JSON-LD.
While a value still looks like `[TAKHLE]` the script wraps it in the amber `.ph` highlight; the
moment you put a real value in, the wrapper disappears on its own. So the "Occurrences" columns
below are informational — you do not visit those places by hand.

Watch the two town forms: `mesto` is the nominative for titles, `mestoKde` is the locative **with
its own preposition** ("ve Frýdku-Místku", "v Havířově"). Czech declension means one value cannot
serve both.

Two kinds of marker, both greppable:

- **`<span class="ph">[…]</span>`** — visible on the page, highlighted amber. Anything a
  visitor can see that is still fake.
- **`<!-- TODO(placeholder) -->`** — invisible: attributes, meta tags, config values.

```sh
grep -rn 'class="ph"' --include=*.html .          # visible placeholders
grep -rn 'TODO(placeholder)' .                    # developer notes
grep -rn 'PLACEHOLDER' .                          # config values that break things
```

---

## 1. Blocking — the site must not go live with these

| What | `values.json` key | Current value | Occurrences |
|---|---|---|---|
| **Phone** | `phone` | `+420777123456` | 29 visible, 40 in `href`/JSON-LD, plus the `sms:` and `wa.me` links |
| **E-mail** | `email` | `info@example.com` | 25 |
| **Full name** | `jmeno` | `[JMÉNO A PŘÍJMENÍ]` | 8 — the § 435 block on every page |
| **Sídlo** | `sidlo` | `[ULICE ČP, PSČ, OBEC]` | 8 — same block |
| **IČO** | `ico` | `[00000000]` | 8 — same block |
| **Živnostenský úřad** | `zivnostenskyUrad` | `[OBECNÍ ŽIVNOSTENSKÝ ÚŘAD]` | 8 — same block |

Store the phone **once, in international form** (`+420…`). Sync derives all three shapes it needs:
the display form `777 123 456`, the `tel:` href, and the `wa.me` form — the last without `+` and
without spaces, or the WhatsApp link silently breaks. **`777 123 456` is a placeholder pattern, not
a real number**; a live site carrying a stranger's number sends your customers to them.

These two are values as well now — no hand-editing of `kontakt.html`:

| What | `values.json` key | Current value | Note |
|---|---|---|---|
| **Web3Forms key** | `web3formsKey` | `PLACEHOLDER-WEB3FORMS-KEY` | The form silently does nothing useful until this is set |
| **Site address** | `webUrl` | `PLACEHOLDER-URL` | Feeds the form's no-JavaScript `redirect`, `sitemap.xml` and `robots.txt` — see section 5 |

## 2. Content — needed for the copy to make sense

| `values.json` key | Marker | Meaning |
|---|---|---|
| `mesto` | `[MĚSTO]` | Home town, **nominative** — titles, `og:title`, the `<h1>` |
| `mestoKde` | `[VE MĚSTĚ]` | Home town, **locative, preposition included** — "Působím …", "zakázky …", meta descriptions |
| `mestoAOkoli` | `[MĚSTO A OKOLÍ]` | `areaServed` in the JSON-LD |
| `mestoASeznamObci` | `[MĚSTO A SEZNAM OBCÍ]` | The "Kam jezdím" row on `kontakt.html` |
| `seznamObci` | `[SEZNAM OBCÍ]` | The villages, listed in prose on `index.html` |
| `dojezdKm` | `[DOJEZD XX KM]` | Radius travelled |
| `volaciDoba` | `[PO–PÁ 7:00–19:00]` | **The calling window**, not opening hours — see PLAN.md 5.1 |
| `dobaOdpovedi` | `[XX HODIN / JEDNOHO PRACOVNÍHO DNE]` | Promised response time, on `poptavka-odeslana.html` |
| `ulice` / `psc` / `obec` | `[ULICE ČP]` / `[PSČ]` / `[OBEC]` | The `address` object in the JSON-LD. Same address as `sidlo`, split into fields because schema.org wants them apart |

**The two town forms are not interchangeable.** Czech declines, so `mesto` is "Frýdek-Místek" while
`mestoKde` is "ve Frýdku-Místku" — and since the preposition itself changes ("ve Frýdku", but
"v Havířově") it is part of the value. Never write a `v` in the page next to `mestoKde`.

These three are real values, not placeholders — they work as they stand, but they encode where he
is, so check them before launch:

| `values.json` key | Current value | Meaning |
|---|---|---|
| `krajGeojson` | `assets/data/zlinsky-kraj.geojson` | **Which region the map draws.** Reaches `js/map.js` through `data-geojson` on `[data-map]`, so moving kraj is a value change plus a new file in `assets/data/` — never a code change |
| `mapaUrl` | `https://mapy.cz/` | The "Otevřít v mapě" link, and the only way out of the map without JavaScript. Points at the country, not at his area — worth aiming at the right spot |
| `datumAktualizace` | `2026-08-03` | `lastmod` for all six URLs in `sitemap.xml` |

**The surname in page titles is derived, not stored.** Titles shorten the brand to "… — Šomek",
which does not match `brand` and would survive a rename, so `sync.mjs` takes the last word of
`brand` and rewrites those too. There is no `prijmeni` key to set, and there should not be — two
keys holding "Šomek" and "Instalatér Šomek" would corrupt each other.

### Not values, by design

- **Page copy** — titles, meta descriptions, the JSON-LD `description` and `priceRange`, the
  service bullet lists. Prose belongs in the page; only the facts inside it are values.
- **`og:url` and `og:image`** — the tags are not in the HTML at all yet. They need adding by hand
  once the address and a real photo exist; `webUrl` cannot fill a tag that does not exist.

## 3. Prices and legal values

Every rate is a value now, and each carries its own unit — `sazbaHod` becomes "400 Kč / hod", not
"400". **Never write the unit next to the marker in the page**, or filling the value in produces
"400 Kč / hod Kč".

| `values.json` key | Marker | Meaning |
|---|---|---|
| `sazbaHod` | `[SAZBA XXX KČ/HOD]` | Hourly rate |
| `uctovaciInterval` | `[PO XX MINUTÁCH]` | Billing increment after the first whole hour |
| `dopravaPausal` | `[PAUŠÁL XXX KČ]` | Flat travel charge inside the near zone |
| `dopravaDoKm` | `[PÁSMO XX KM]` | Where that flat charge stops applying |
| `dopravaZaKm` | `[XX KČ/KM]` | Per-kilometre rate beyond it |
| `splatnostDnu` | `[SPLATNOST XX DNŮ]` | Invoice due period |
| `datumUcinnosti` | `[DATUM]` | Effective date, both legal pages |
| `retenceMesicu` | `[XX MĚSÍCŮ]` | Retention for unsuccessful inquiries |
| `poskytovatelEmailu` | `[POSKYTOVATEL E-MAILU]` | Named processor — must be accurate |
| `umisteniDat` | `[EU / MIMO EU]` | Where that processor stores the data |
| `ucetni` | `[ÚČETNÍ]` | Delete the row in `ochrana-osobnich-udaju.html` if there is no bookkeeper |

The four rate values reach **both** `sluzby.html#cena` and section 4 of `obchodni-podminky.html`
from the one key each, so the two can no longer drift apart.

**Prices are stated as final** because the owner is a neplátce DPH (§ 12 zákona o ochraně
spotřebitele). If VAT status ever changes, every rate above changes with it (PLAN.md 4.3).

## 4. Assets

| File | Replace with |
|---|---|
| `assets/img/podlaha-1.webp` | **Done** — the owner's own photo (HONOR phone, 2026-03-06), resized to 1200×1600 with all EXIF stripped, then converted to WebP (305 KB). Nothing left open on this one. |
| `assets/img/podlaha1.jpg` | **Delete before committing** — the 6.5 MB camera original, superseded by `podlaha-1.jpg` and referenced by nothing. Carries GPS/EXIF and has no place in a public repo. Kept for now only because it is the sole full-resolution copy; archive it outside the repo first. |
| **Five gallery photos** | `instalaterske-prace`, `-prace2`, `-prace-detail`, `podlaha2`, `rozvody1` — in the reference grid at the owner's instruction, but none carries camera EXIF, so they are web-sourced, not his. The reference page states these are his own jobs; **swap them for his own photos before launch** (PLAN.md 4.4 — passing off stock as own work is a misleading commercial practice). |
| **`assets/img/instalatersomek.webp`** | In the homepage hero. Carries a visible **Pixers watermark** and is unlicensed — replace or license before launch. Highest priority of the image items: it is the first thing a visitor sees. |
| Three illustrations | `voda`, `instalater`, `hodinovy-manzel` — clipart headers on the service blocks. Decorative (`alt=""`), so they claim nothing about his work; only the licensing is unverified. |
| `assets/img/mapa.svg` | Now only the no-JavaScript fallback behind the Leaflet map, so it is no longer blocking — but it is still a hand-drawn placeholder and a visitor with JS off sees it. Replace with a real static crop of the area eventually. **Never a Google Maps `<iframe>`.** |
| `assets/data/zlinsky-kraj.geojson` | **Done** — Zlínský kraj outline, OSM relation 442449 via Nominatim, simplified to ~45 m. ODbL 1.0, attribution shown on the map. Regenerate only if the region's borders change. |
| Map tiles | **Done** — `tile.openstreetmap.org`, the site's only third-party request. The OSMF row in `ochrana-osobnich-udaju.html` exists solely because of it: **remove the tile layer and that row goes too, add another provider and it needs its own row.** |
| `assets/favicon.svg` | Optional. Works as is; swap if a logo appears. |
| og:image | Not present. Add a 1200×630 image once real photos exist. |

## 5. Site address — last, once the URL is known

Set `webUrl` and run sync: it reaches `sitemap.xml` (6 × `PLACEHOLDER-URL`), the `robots.txt`
sitemap line and the form's no-JavaScript `redirect` in one go. `sync.mjs` processes those two
non-HTML files precisely for this. Only `og:url` in `index.html` is still to be added by hand,
because the tag is not in the page yet.

These are the **only** absolute URLs in the project; everything else is relative and needs no
change if the repository is renamed. Leave the `robots.txt` `Sitemap:` line commented out until
the address is real — an uncommented line pointing at `PLACEHOLDER-URL` is worse than none.

## 6. Final sweep

- [ ] `node tools/sync.mjs --check` exits 0 — no page is stale, and `values.lock.json` is committed
- [ ] `grep -rn 'class="ph"' --include=*.html .` returns nothing. It should empty itself: once a
      value in `values.json` no longer looks like `[TAKHLE]`, sync drops the wrapper on its own
- [ ] `grep -rn 'PLACEHOLDER' .` returns nothing
- [ ] `grep -rn '777123456\|777 123 456\|info@example.com' .` returns nothing — including
      `values.json` and `values.lock.json`, which grep now reaches too
- [ ] Delete the `.ph` rule at the bottom of `css/style.css` — with no placeholders left it
      is dead code, and keeping it means a stray marker would render invisibly
- [ ] Work through the launch checklist in PLAN.md section 7
