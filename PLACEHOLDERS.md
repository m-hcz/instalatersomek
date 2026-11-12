# Placeholders — replace before launch

Every value on the site that is not yet real. Counts verified against the source on
2026-08-03; re-run the commands below rather than trusting these numbers after edits.

**Most of this is now one file.** Everything in the tables below that recurs across pages lives in
[values.json](values.json) — edit it there and run `node tools/sync.mjs`, which rewrites every
occurrence on every page, including the ones inside page titles, meta descriptions and JSON-LD.
While a value still looks like `[TAKHLE]` the script wraps it in the amber `.ph` highlight; the
moment you put a real value in, the wrapper disappears on its own. So the "Occurrences" columns
below are informational — you do not visit those places by hand.

The service area is **the whole Zlínský kraj**, not a town (decided 2026-08-06). No town, no list of
villages, no travel radius appears anywhere on the site. Watch the two region forms: `kraj` is the
nominative ("Zlínský kraj"), `krajKde` the locative **with its own preposition** ("ve Zlínském
kraji"). Czech declension means one value cannot serve both. Neither is a placeholder — they are
settled values, listed in section 2 under "real values".

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

**Nothing in this section is outstanding any more.** The e-mail
(`somi.vodo.topo@gmail.com`) and the Web3Forms key were supplied on 2026-08-06, so every contact
detail on the site is now real and the form actually sends.

Two things to know about that e-mail, neither of them blocking but both worth a decision:

- **It arrived with a leading colon** (`:somi.vodo.topo@gmail.com`), which is not a legal
  local-part character. Every `mailto:` on the site would have been `mailto::somi…` and opened
  nothing. Corrected on the same day — but it is a reminder that `email` is substituted into 25
  places by plain text replacement, so a typo there is a typo everywhere at once.
- **It is a free consumer Gmail account, and it is now the business mailbox.** The consequence in
  `ochrana-osobnich-udaju.html` has been written up: `poskytovatelEmailu` is "Google Ireland
  Limited (Gmail)" and `umisteniDat` is "EU i mimo EU" (section 3 explains both). Free Gmail comes
  with **no Art. 28 GDPR processor agreement** — Workspace does, the consumer product does not —
  so the page no longer calls anyone a processor; it names **příjemce**, the word Art. 13(1)(e)
  uses. That makes the notice accurate, but it does not make the gap go away: he is running the
  business mailbox on a service with no data-processing contract. Options are to accept it, to move
  to Workspace, or to put a mailbox on `vodotoposomek.cz`, which he already owns and which would
  match the site. **Owner's call.**

Everything else in this table was supplied on 2026-08-06 and is live: `phone` `+420608542877`,
`jmeno` "Tomáš Šomek", `sidlo`, `ico` `68340435` and `zivnostenskyUrad`. The IČO's mod-11 check
digit verifies, so it is at least not a typo; confirm the rest against the živnostenský rejstřík
entry itself, since § 435 asks for the name **as registered**.

The phone is stored **once, in international form** (`+420…`). Sync derives all three shapes it
needs: the display form `608 542 877`, the `tel:` href, and the `wa.me` form — the last without `+`
and without spaces, or the WhatsApp link silently breaks. Change it in one place only.

**`zivnostenskyUrad` is stored in the nominative** ("Živnostenský úřad Valašské Klobouky"). The
sentence in `partials/legal-id.html` was reworded to "…rejstříku, **který vede** X" for exactly that
reason — the older "…rejstříku **vedeném** X" needs the instrumental and would force the name to be
stored pre-declined. Worth confirming with the owner that this is the authority's name as it appears
in the register; sites in ORP towns usually cite the městský úřad.

This one is a value as well now — no hand-editing of `kontakt.html`:

| What | `values.json` key | Current value | Note |
|---|---|---|---|
| **Web3Forms key** | `web3formsKey` | **Done** — supplied 2026-08-06 | The form now submits for real. Worth one live test send before launch, with JavaScript on and again with it off |

The key is **public by design** and belongs in the HTML — it identifies the mailbox, it does not
authorise anything. Get one at web3forms.com by entering the address in `email`; the destination is
bound server-side, so the key cannot redirect mail anywhere else.

While it still reads `PLACEHOLDER-…`, `js/main.js` validates the form and then **sends nothing**,
showing the same "nepodařilo se odeslat" dialog a real failure produces, and logging the reason to
the console. That is deliberate: the alternative — letting the form POST natively — lands the
visitor on Web3Forms' own English error page. Replace the key and the fetch path starts working with
no other change. Verify with a real submission, since nothing before launch exercises the success
path for real.

**The two dialog test buttons are gone** — deleted 2026-08-06 from all three places they lived in:
`.form__test` in `kontakt.html`, its rules in `css/style.css`, and the `[data-test-only]` block at
the end of `js/main.js`. `grep -rn 'data-test-only\|form__test' .` returns nothing. With them go the
only way to see the "odesláno" and "chyba" dialogs without sending: **from here on, the success path
is proved by a real submission or not at all.**

`webUrl` **is no longer blocking** — see section 5. It was never the owner's to supply.

**An empty amber highlight is no longer proof the site is ready.** Seven values are drafts the
developer wrote, and they render as ordinary text — see section 3a before launching.

## 2. Content — needed for the copy to make sense

| `values.json` key | Marker | Meaning |
|---|---|---|
| `ulice` / `psc` / `obec` | — | Filled 2026-08-06. The `address` object in the JSON-LD. Same address as `sidlo`, split into fields because schema.org wants them apart |

`volaciDoba` ("PO–PÁ 7:00–19:00") is filled. It is the **calling window, not opening hours** — see
PLAN.md 5.1 for why that distinction survives into the structured data.

These are real values, not placeholders — they work as they stand, but they encode where he
works, so check them before launch:

| `values.json` key | Current value | Meaning |
|---|---|---|
| `kraj` | `Zlínský kraj` | **Nominative.** JSON-LD `areaServed`, the "Kam jezdím" row on `kontakt.html` |
| `okresy` | `okres Kroměříž, okres Uherské Hradiště, okres Vsetín, okres Zlín` | **Structured data only** — comma-separated, feeds the derived `{{areaServed}}` alongside `kraj`. Never appears in visible copy; the page still names only the kraj. Do not extend it to individual obce, that is the town-level decision in PLAN.md 5.2 |
| `krajKde` | `ve Zlínském kraji` | **Locative, preposition included.** Titles, `og:title`, the `<h1>`, meta descriptions, "Působím …", the footer |
| `krajGeojson` | `assets/data/zlinsky-kraj.geojson` | **Which region the map draws.** Reaches `js/map.js` through `data-geojson` on `[data-map]`, so moving kraj is a value change plus a new file in `assets/data/` — never a code change |
| `mapaUrl` | `https://mapy.cz/` | The "Otevřít v mapě" link, and the only way out of the map without JavaScript. Points at the country, not at his area — worth aiming at the right spot |
| `datumAktualizace` | `2026-08-06` | `lastmod` for all six URLs in `sitemap.xml` |

**Moving to a different kraj is four values, not one:** `kraj`, `krajKde`, `okresy` and
`krajGeojson` — plus the matching outline file in `assets/data/`. Leave any of them behind and the
copy, the map and the structured data disagree about where he works; forget `okresy` in particular
and the JSON-LD keeps asserting districts that belong to the region he left.

**The surname in page titles is derived, not stored.** Titles shorten the brand to "… — Šomek",
which does not match `brand` and would survive a rename, so `sync.mjs` takes the last word of
`brand` and rewrites those too. There is no `prijmeni` key to set, and there should not be — two
keys holding "Šomek" and "Instalatér Šomek" would corrupt each other.

### Findability — where the site says who it is to a machine

These three feed the crawler- and AI-facing layer. Nothing here is visible copy, but a wrong value
is worse than a missing one: structured data is read as asserted fact, not as a draft.

| `values.json` key | Marker | Meaning |
|---|---|---|
| `firmyCz` | `[PROFIL NA FIRMY.CZ]` | Profile URL. Visible on `kontakt.html` **and** in JSON-LD `sameAs` |
| `bazos` | `[INZERÁT NA BAZOŠI]` | Same, for the Bazoš listing |
| `ogImage` | `[OG IMAGE 1200x630]` | Path relative to the site root, e.g. `assets/img/og.webp` — see section 4 |

**These emit nothing while they are placeholders** — including, since 2026-08-06, the visible ones.
`sameAs` renders as `[]` and the `og:image` tag is absent entirely, because a made-up URL in
structured data is a lie told to a machine that cannot see it is a placeholder. That is the
`{{#real:key}}` / `jsonlist` machinery in `sync.mjs`.

The **"Najdete mě i tady" block on `kontakt.html` now hides itself**, heading and all, while neither
address is real: a section promising "you can also find me here" above two links that go nowhere is
worse than no section. Each row is conditional in its own right, so supplying one address shows one
row instead of waiting for both. The block is driven by `profily`, a derived flag in `sync.mjs`
(`view()`), which exists because `{{#real:key}}` tests one value and the template cannot OR two.
Nothing is left in the page to find by eye — `grep -n 'firmyCz\|bazos' values.json` is the way in.

**The catalogue entries matter more than anything in the HTML.** A question like "instalatér
Valašské Klobouky" gets answered from Firmy.cz and Google Business Profile far more often than from
a tradesperson's own site — and more so since the page copy went region-level (PLAN.md 5.2), because
a listing still carries a precise address. Name, sídlo and phone in each listing must match the
footer **to the letter**: "Tomáš Šomek", "Soukenická 781, 766 01 Valašské Klobouky",
"608 542 877". A listing that disagrees with the site creates a second, competing record of the
same business, and the machine has no way to tell which is right.

### Not values, by design

- **Page copy** — titles, meta descriptions, the JSON-LD `description` and the service catalogue,
  the service bullet lists. Prose belongs in the page; only the facts inside it are values.
- **`openingHours` and `priceRange`** — deliberately absent from the JSON-LD, and neither is a
  value waiting to be filled. He keeps no fixed hours, and no overall price band has been decided —
  the site publishes an hourly rate ("od 400 Kč / hod"), which is not the same thing as the
  `priceRange` band Google shows. The original `"$$"` was invented, which is the whole objection.
  See PLAN.md 5.1 and the comment in `partials/schema.html`. `volaciDoba` is the calling window and
  is free text — it is not convertible to `OpeningHoursSpecification` without inventing structure.
- **`canonical` and `og:url`** — generated from `webUrl` by `partials/head-meta.html`. Nothing to do.
- **Any certificate or authorisation number** — for air conditioning the owner holds none (confirmed
  2026-08-17) and the site names none, so there is nothing here waiting to be supplied. (The
  boiler-check claim on `sluzby.html`, 2026-10-03, carries no number — it points to MŽP's register
  instead. See PLAN.md 4.12.) An `fgasCert` value and a
  `partials/klima-cert.html` existed for part of 2026-08-17 and were deleted. The Klimatizace section
  is written around it: "zajistím", "ve spolupráci s firmou KLIMAKOL", no first-person installation
  verb and **no statutory citation either** — quoting the rule beside the offer implies the offerer
  meets it. If a certificate is ever obtained, adding it is a copy decision, not filling a blank.
  See PLAN.md 4.12.

## 3. Prices and legal values

Every rate is a value now, and each carries its own unit — `sazbaHod` becomes "400 Kč / hod", not
"400". **Never write the unit next to the marker in the page**, or filling the value in produces
"400 Kč / hod Kč".

`sazbaHod` ("400 Kč / hod") and `uctovaciInterval` ("po 30 minutách") were supplied on 2026-08-06
and are live. Both were given in shouting caps, the shape the placeholder markers used; they are
stored in ordinary Czech casing, because the value is printed on the page verbatim.

`poskytovatelEmailu` ("Google Ireland Limited (Gmail)") and `umisteniDat` ("EU i mimo EU") were
filled on 2026-08-06 and are live — **nothing in this section is outstanding any more.** Both follow
from the mailbox actually being `somi.vodo.topo@gmail.com`:

- **Google Ireland Limited**, not Google LLC: for users in the EEA that is the entity Google's own
  terms name as the provider.
- **"EU i mimo EU"**, not "Mimo EU": Google holds the data across a global network of data centres,
  so part of it may sit inside the EU and part outside. Either answer alone would be a claim the
  owner cannot stand behind.

The **Art. 28 gap flagged in section 1 survives this** — filling the values described the mailbox
accurately, it did not acquire a processor agreement that free Gmail has never offered. What changed
is that the page no longer implies one: the table in `ochrana-osobnich-udaju.html` now names
**příjemci** rather than **zpracovatelé**, which is the word Art. 13(1)(e) GDPR actually uses and the
one that is true of all four rows. Moving to Workspace or to a mailbox on `vodotoposomek.cz` would
close the gap properly and would mean rewriting both values and the transfer paragraph.

`ucetni` was **removed** on 2026-08-06 — he keeps his own books, so there is no further recipient,
and the row is gone from `ochrana-osobnich-udaju.html`. If a bookkeeper is ever engaged, the row has
to come back: Art. 13 GDPR requires recipients to be named.

The rate values reach **both** `sluzby.html#cena` and section 4 of `obchodni-podminky.html`
from the one key each, so the two can no longer drift apart.

**Prices are stated as final** because the owner is a neplátce DPH (§ 12 zákona o ochraně
spotřebitele). If VAT status ever changes, every rate above changes with it (PLAN.md 4.3).

## 3a. Drafted, not confirmed by the owner — a launch gate

These seven were **written by the developer on 2026-08-06 as ordinary values for a one-man trade**,
not supplied by the owner. They no longer render amber, so nothing on the page marks them as
provisional — this list and the `TODO(owner)` comments in the source are the only record.

```sh
grep -rn 'TODO(owner)' .          # every place a drafted value is printed
```

| Key | Drafted as | Why it needs confirming |
|---|---|---|
| `dopravaPausal` | `200 Kč` | Price → becomes contract content, and § 12 requires it to be final |
| `dopravaDoKm` | `15 km` | Defines the zone the flat charge covers |
| `dopravaZaKm` | `12 Kč / km` | Price, as above |
| `splatnostDnu` | `se splatností 14 dnů` | Contract term. The value carries its own preposition — see below |
| `datumUcinnosti` | `6. 8. 2026` | Should be the **launch date**, not the day the value was written |
| `retenceMesicu` | `po dobu 6 měsíců` | A **ceiling**, not a term — see the note below. An Art. 13 GDPR statement, so it must match how he actually clears the inbox. Carries its own preposition, see further below |
| `dobaOdpovedi` | `jednoho pracovního dne` | A service-availability claim (§ 4–5 zákona o ochraně spotřebitele). Phrased as a working day rather than a number of hours, deliberately — the same reasoning that keeps an arrival-time promise off the havárie note |

**Why `splatnostDnu` holds `se splatností 14 dnů` and not just `14 dnů`.** The owner chose a 14-day
term, which collides with something already in the page: the string `14 dnů` appears five times in
`obchodni-podminky.html` as the **statutory** § 1829 withdrawal period, the refund deadline, a
heading and the meta description. Sync replaces values by plain text search, so a bare `14 dnů`
would mean the *next* change to the payment term silently rewrites all five — turning a statutory
period into whatever the new term is. `assertDistinct` cannot catch it: it guards placeholders
against each other, not a real value against ordinary page copy.

**`retenceMesicu` is a ceiling, and that wording is load-bearing (2026-08-06).** No Czech statute sets
a retention period for an inquiry that produced no contract, so there is no number to look up. What
the law gives is a rule: Art. 5(1)(e) GDPR permits storage only as long as it is necessary, and
Art. 13(2)(a) expressly allows a notice to state *"the criteria used to determine that period"*
instead of a fixed one. The row therefore leads with the criterion and treats the months as a cap:

> Smažu, jakmile je zřejmé, že ze zakázky nic nebude, **nejdéle** po dobu 6 měsíců od poslední komunikace

The earlier phrasing — "Uchovávám po dobu 6 měsíců" — asserted the opposite: that he holds the data
for six months regardless, i.e. after he has stopped needing it, which is what Art. 5(1)(e) forbids.
The word `nejdéle` sits in the page, not in the value, so shortening the cap stays a one-value edit.

The 3-year limitation period in **§ 629 NOZ is deliberately not used here.** It runs on *claims*, and
where no contract was concluded there is nothing to defend; retaining every declined quote for three
years on that theory is exactly the over-retention the principle exists to prevent. The pre-contractual
liability route (§ 1729 NOZ) is too marginal for a plumbing quote to justify it either.

**Neither of these makes the number correct — only defensible.** The owner still has to confirm the
cap and actually clear the mailbox to it. A stated period he does not honour is a false statement
under Art. 13, and the shorter the cap, the less an Art. 17 erasure request has to reach.

**The preposition guard applies to both retention values, fixed 2026-08-06.** `retenceMesicu` held a bare
`6 měsíců` and the newer `retenceSluzby` would have held a bare `30 dnů`. Replaying sync's
substitution over a hypothetical change proved the second one live: `30 dnů` is also the **statutory
deadline for settling a complaint** in `obchodni-podminky.html` (§ 19 odst. 3 zákona o ochraně
spotřebitele), so shortening the Web3Forms retention to 7 days would have rewritten that clause to
`nejpozději do 7 dnů` — the owner promising a deadline the law does not impose on him, in a document
that binds him. Both now read `po dobu …`, and the same replay leaves every statutory period intact.

`retenceSluzby` (`po dobu 30 dnů`) is **not a draft** — it is a factual mirror of the *Data retention
policy* setting in the Web3Forms account. It must be changed here whenever that dropdown changes, and
it must never exceed `retenceMesicu`, or the page contradicts itself.

Carrying the preposition inside the value makes the string unique in the document, which is the same
device `krajKde` ("ve Zlínském kraji") and `uctovaciInterval` ("po 30 minutách") already use. **Do
not write "se splatností" next to the value in the page** — it is inside the value. Any future value
that could read as ordinary Czech elsewhere in a page wants the same treatment.

## 4. Assets

| File | Replace with |
|---|---|
| `assets/img/podlaha-1.webp` | **Done** — the owner's own photo (HONOR phone, 2026-03-06), resized to 1200×1600 with all EXIF stripped, then converted to WebP (305 KB). Nothing left open on this one. |
| Six reference photos (2026-10-03) | **Done** — `kotel-opop`, `napojeni-kotle`, `sprchovy-kout`, `klimatizace-lodzie`, `klimatizace-venkovni`, `klimatizace-vnitrni`. The owner's own iPhone photos, auto-rotated, resized to 1600 px on the long side and converted to WebP with all EXIF stripped (86–282 KB). Two are cropped for PLAN.md 4.4: `klimatizace-lodzie` loses a window onto a car park with a partly legible number plate, `klimatizace-venkovni` keeps the unit and drops the rest of a recognisable timber house. Captions were drafted from the photos alone — **the owner should confirm each one names the work he actually did.** Originals are not in the repo. |
| `assets/img/podlaha1.jpg` | **Delete before committing** — the 6.5 MB camera original, superseded by `podlaha-1.jpg` and referenced by nothing. Carries GPS/EXIF and has no place in a public repo. Kept for now only because it is the sole full-resolution copy; archive it outside the repo first. |
| **Three gallery photos** | `instalaterske-prace2`, `podlaha2`, `rozvody1` — **Done**: confirmed as the owner's own photos on 2026-11-12, so they stay. They carry no camera EXIF, which is why an earlier note here called them web-sourced; that inference was wrong. |
| Homepage hero | **Done** (2026-11-12) — the unlicensed `instalatersomek.webp` (Pixers watermark) is deleted; the hero now shows `instalater-hero.svg`, a cartoon plumber from Pixabay (`pixabay.com/vectors/plumber-pipe-repair-cartoon-style-9665590/`, by tanrica, labelled AI-generated), downloaded by the developer on 2026-11-12 under the Pixabay Content License: commercial use, no attribution. Its white background path is removed, nothing else. **Limits:** not as a logo, trade mark or business sign; Pixabay warrants nothing, and on any claim the image must come down at once. |
| Three illustrations | `voda`, `instalater`, `hodinovy-manzel` — clipart headers on the service blocks. Decorative (`alt=""`), so they claim nothing about his work; only the licensing is unverified. **Still open.** If they ever have to go, `klimatizace.svg` below is the worked example of the cheapest replacement: drawn in-repo, a few kB, and no third party to ask. |
| `assets/img/klimatizace.svg` | **Done** (2026-08-17) — the fourth service block's header. **Original work, so unlike the three above it carries no licensing question at all**, which is why it was drawn rather than sourced. SVG rather than WebP: it is text, so it can be corrected in an editor, and it stays sharp at any DPR. Matches the neighbours deliberately (heavy dark outline, flat colour, white ground) and reuses the blue from the water drop in `voda.webp`. The `viewBox` is cropped to the artwork — the inner coordinates are still on the original 512×512 grid, so they remain easy to reason about; do not "tidy" it back to a square, the padding would shrink the drawing inside `.service__head`'s square `object-fit: contain` box. Verified rendered at 300, 96 and 72 px against the other three. |
| **Seven brand logos** | `assets/img/znacky/` — AUX, LG, Sinclair, Carrier, Fujitsu, Olimpia Splendid, Panasonic, on the Klimatizace block. **Done** (2026-08-17), vendored, no CDN. The AUX file is `aux-logo.svg`, not `aux.svg`, and that is deliberate — `AUX` is a reserved MS-DOS device name, so Windows cannot open a file called that at any extension and `git add` aborts the whole commit on it. See CLAUDE.md. `aux`, `carrier`, `fujitsu`, `lg`, `panasonic` are the marks published on Wikimedia Commons; `olimpia-splendid` and `sinclair` come from the manufacturers' own sites. Deliberately **not** copied from `klimakol.cz` — their upload folder is theirs to serve. These are nominative use, not a dealership claim, which is what `.brands__note` under the strip states; **do not list a make he does not actually fit**, and do not delete the note (PLAN.md 4.12). Since 2026-10-03 six of the seven link to a Czech site (Carrier has none); the table is in PLAN.md 4.12. |
| **Three boiler logos** | `assets/img/znacky/atmos.svg`, `opop.svg`, `czechtherm.png`, on the Topenářství block. **Done** (2026-10-03), each taken from the maker's own site; `opop.svg` is their header logo with the white letters recoloured to the near-black printed on the boilers, `czechtherm.png` trimmed of its empty margin. The owner confirmed he fits all three. Linked to `atmos.eu`, `opop.cz`, `czechtherm.cz`. |
| `assets/img/mapa.svg` | **Done** (2026-08-06) — was missing, so the no-JavaScript fallback rendered a broken image. Now generated from `assets/data/zlinsky-kraj.geojson`, projected Web Mercator like the live map so the outline matches, in the 1000×420 box the `<img>` declares. Design tokens are written out as literals because an `<img>` gets no stylesheet, and the OSM attribution is baked in — the boundary is ODbL. Carries no place name, so switching regions stays a `values.json` change. Regenerate if the GeoJSON changes. **Never a Google Maps `<iframe>`.** |
| `assets/img/qr-kontakt.svg` | **Done** (2026-08-06) — vCard QR on `kontakt.html`, 329 B of payload, version 13 (69×69), correction level M. Generated by `tools/qr.mjs` from `values.json`; **never hand-edit it**, and run `node tools/qr.mjs` after changing `jmeno`, `brand`, `tagline`, `phone`, `email`, `ulice`, `psc`, `obec` or `webUrl`. `--check` fails if it is stale. The card is encoded directly, not as a link to a QR service — a service URL printed on a van or a business card is a dependency you cannot recall. Verified by decoding it back with an independent decoder, both from the raw matrix and from the rendered page. **Do not shrink it below 15rem**: at 69 modules plus quiet zone that is already only ~3.1 px per module |
| `assets/data/zlinsky-kraj.geojson` | **Done** — Zlínský kraj outline, OSM relation 442449 via Nominatim, simplified to ~45 m. ODbL 1.0, attribution shown on the map. Regenerate only if the region's borders change. |
| Map tiles | **Done** — `tile.openstreetmap.org`, the site's only third-party request. The OSMF row in `ochrana-osobnich-udaju.html` exists solely because of it: **remove the tile layer and that row goes too, add another provider and it needs its own row.** |
| `assets/favicon.svg` | Optional. Works as is; swap if a logo appears. |
| og:image | Add a 1200×630 image once real photos exist, then set `ogImage` to its path. The tag and the JSON-LD `image` both appear on their own. **Not the hero image** — it carries the Pixers watermark. |

## 5. Site address — done

`webUrl` is `https://vodotoposomek.cz` — the owner bought the domain on 2026-08-06, reversing the
earlier "no custom domain" decision. Before that it derived from the repository itself
(`github.com/m-hcz/instalatersomek` → the subpath), which is what it falls back to if the domain is
abandoned.

**The site's code is ready for the domain; the hosting is not.** There is no `CNAME` file, no DNS
record and no Pages setting — deliberately, the owner is doing those. Until then every absolute URL
below points at a host that does not serve the site. The one with a user-visible failure is the
form's no-JavaScript `redirect`: submit with JS off before DNS is live and the visitor lands
nowhere.

From that one value, sync fills every absolute URL in the project: the six `<loc>` in `sitemap.xml`,
the `Sitemap:` line in `robots.txt`, the form's no-JavaScript `redirect`, the `canonical` and
`og:url` on six pages, and `@id` / `url` in the JSON-LD. Those are the **only** absolute URLs;
everything else is relative. Moving between hosts is this one value plus a sync.

**Watch out when you move it:** the substitution is a plain text search, so any prose quoting the
old address gets rewritten too. Write a previous URL without its `https://` prefix, or the next sync
silently replaces it and the comment starts contradicting itself. It already happened once in
`robots.txt`, which now carries a note about it.

**`robots.txt` starts working once the domain does.** It is only ever read from the origin root: on
the old subpath a crawler fetched `m-hcz.github.io/robots.txt` — a different repository — and never
`…/instalatersomek/robots.txt`, so the file was a record of intent. On `vodotoposomek.cz` it sits at
the root and binds. Regardless of hosting, `<meta name="robots">` in the page is what keeps
`404.html` and `poptavka-odeslana.html` out of the index. Full story in the file's own header.

## 6. Final sweep

- [ ] `node tools/sync.mjs --check` exits 0 — no page is stale, and `values.lock.json` is committed
- [ ] `grep -rn 'class="ph"' --include=*.html .` returns nothing. It should empty itself: once a
      value in `values.json` no longer looks like `[TAKHLE]`, sync drops the wrapper on its own
- [ ] `grep -rn 'TODO(owner)' .` returns nothing — the seven drafted values in section 3a have been
      confirmed by the owner. **This check does not empty itself**; the comments are deleted by hand
- [ ] `vodotoposomek.cz` actually serves the site — `CNAME`, DNS and the Pages setting are done, and
      **Enforce HTTPS** is on. Until then `webUrl` promises an address that does not answer
- [ ] `grep -rn 'PLACEHOLDER' .` returns nothing
- [x] `grep -rn 'data-test-only' .` returns nothing — the two dialog test buttons and their CSS and
      JS are gone. Done 2026-08-06
- [ ] `grep -rn 'TODO(owner)' .` returns nothing. Eight of these are **published** developer notes
      annotating prices, payment terms, the retention period and the response time as unconfirmed
      drafts — anyone reading the page source sees the trader calling his own stated terms a guess.
      They go once the owner confirms the values, not before: right now they are the only reminder
- [ ] The contact form has actually delivered a message to `email`, with the real key in place.
      Nothing before launch proves the success path, only the failure one
- [ ] `grep -rn 'info@example.com' .` returns nothing — including `values.json` and
      `values.lock.json`, which grep now reaches too. The fake phone is already gone
- [ ] Delete the `.ph` rule at the bottom of `css/style.css` — with no placeholders left it
      is dead code, and keeping it means a stray marker would render invisibly
- [ ] `firmyCz` and `bazos` point at live listings, and the name, sídlo and phone in each match
      the footer to the letter. Check the rendered `sameAs` is no longer `[]`:
      `grep -n '"sameAs"' index.html kontakt.html`
- [ ] Work through the launch checklist in PLAN.md section 7
