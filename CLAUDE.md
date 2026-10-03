# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static website for **Instalatér Šomek** — a Czech self-employed tradesperson (OSVČ with a
živnostenský list) doing plumbing and general around-the-house work. Published on GitHub Pages.

**Status: built with placeholder data, awaiting the owner's real details.** All eight pages exist
and work. Every value that is not yet real is marked — **[PLACEHOLDERS.md](PLACEHOLDERS.md) is the
replacement checklist**, and nothing goes live until it is empty.

**[PLAN.md](PLAN.md) is the specification** — page inventory, legal content matrix (verified against
official sources, with citations), technical requirements, and the launch checklist. Read it before
changing anything structural. The sections below cover only the constraints that are easy to violate
by accident.

Czech page copy is **drafted by the developer and corrected by the owner** — don't wait on him for
prose, only for facts (services, towns, prices, identification details). All post-launch changes go
through the developer; there is no CMS and no need for contributor-facing documentation.

**Declined by the owner — do not re-propose:** an "O mně" section with a portrait, an FAQ section,
Google Search Console, and a meta-CSP lockdown. The site therefore has **no traffic measurement of
any kind**, and the cookie-free rule below is enforced by convention alone.

## Language

All code, comments, documentation, commit messages, and conversation are in **English**. Czech
appears **only** in text rendered on the page, and in the names of Czech statutes when cited.

Page copy is Czech: `<html lang="cs">`, `<meta charset="utf-8">`, and diacritics written as literal
UTF-8 characters, never HTML entities. File names are Czech but diacritic-free (`sluzby.html`) —
they are user-visible URLs.

## Hard constraints

These define the project; they are not stylistic preferences.

- **Hand-written HTML / CSS / JS only.** No build step, no bundler, no transpiler, no CSS
  preprocessor, no framework, no npm dependencies. What is committed is byte-for-byte what is served.
- **No backend.** GitHub Pages executes nothing server-side.
- **Third-party code is vendored**, not fetched from a CDN.
- If a task appears to require a toolchain, **say so and stop** rather than introducing one. Adding
  a build step changes what "deploy" means and is the owner's call.

`tools/sync.mjs` is **not** a build step and does not weaken any of the above — see the next
section. It rewrites the committed source; deploying is still `git push`, the repo still contains
byte-for-byte what is served, and nothing runs at deploy time.

## Repeated content is generated — edit the source, not the page

Approved by the owner on 2026-08-04, when the alternative (Jekyll) was rejected for breaking
"committed is what is served".

Anything between `<!-- partial:name … -->` and `<!-- /partial:name -->` **is overwritten** by the
next `node tools/sync.mjs`. Editing a page inside those markers is wasted work — the header, both
footers, the § 435 identification block, the mobile call bar, the `canonical`/`og:url` tags, the
JSON-LD and the catalogue links all live in `partials/`.

Two template features exist specifically so that unfinished values emit **nothing** rather than
something false: `{{#real:key}}…{{/real:key}}` drops its body while the value still looks like
`[TAKHLE]`, and `{{jsonlist:a,b}}` builds a JSON array of only the real ones. Structured data is
read by machines as asserted fact, so a placeholder URL in `sameAs` or in `og:image` is a lie,
not a visible TODO. Use them for anything a crawler consumes.

Values that recur across pages — phone, e-mail, IČO, town — live in `values.json`. Change one there
and run sync; it rewrites every occurrence, including the ones no partial covers (page titles, meta
descriptions, JSON-LD, call-to-action buttons). `values.lock.json` records what was last applied;
commit it, never hand-edit it.

```sh
node tools/sync.mjs            # apply
node tools/sync.mjs --check    # exits 1 if any page is stale; use before committing
```

Three things that will bite:

- **The renderer does not skip comments.** It scans a partial as text, so writing
  `{{#real:key}}` inside an HTML comment — to document it — opens a real conditional that pairs
  with the next closing marker and silently drops everything between. `partials/klima-cert.html`
  lost its whole callout to this once; its comment now describes the marker instead of quoting it.
- **Czech declension.** One form of a place name is not enough. `kraj` is the nominative
  ("Zlínský kraj"); `krajKde` is the locative **and carries its own preposition** ("ve Zlínském
  kraji"), so never write `v`/`ve` next to it. Same trap for any value dropped into prose.
- **Placeholder → real is one-way.** While a value still looks like `[TAKHLE]`, sync wraps it in
  `<span class="ph">`; supply a real value and the wrapper disappears by itself. Going back cannot
  restore the wrappers — a bare value in body copy and one in a `<title>` are indistinguishable.
  Use git to revert. The script warns when you try.

## The site is cookie-free — do not break this

No analytics was a deliberate decision, and it is what keeps the site free of a consent banner, a
cookie policy page, and consent-management JS. In the Czech Republic cookies have been **opt-in
since 2022-01-01** (§ 89 odst. 3 zákona o elektronických komunikacích).

The trigger is **storing or reading something on the visitor's device**, not merely contacting
another server. That is why the OSM map tiles are compatible with this: they set no cookie. It is
also why the items below are not — each one stores something, and any **one** of them re-imposes
the banner on its own. None may be added without a new decision:

| Do not add | Use instead |
|---|---|
| Any analytics at all; Google Ads, remarketing tags, the Meta pixel | nothing |
| Google reCAPTCHA / hCaptcha | honeypot field + provider-side spam filtering |
| Google Maps `<iframe>` | the vendored Leaflet map — see below |
| Google Fonts via `<link>` | self-hosted `woff2`, **including the `latin-ext` subset** |
| YouTube embeds, social buttons from a third-party domain | a plain link |

A third party that sets no cookie still needs naming in `ochrana-osobnich-udaju.html`, because its
IP address is personal data under the GDPR. Banner and privacy notice are separate duties.

## The map — the one third party the site loads

`index.html` and `kontakt.html` carry a **Leaflet** map (1.9.4, BSD-2-Clause, vendored under
`assets/vendor/leaflet/`, never a CDN). It draws the outline of Zlínský kraj from
`assets/data/zlinsky-kraj.geojson` over **OpenStreetMap tiles**.

**The map draws the kraj; the copy names the kraj and then its main towns.** The 2026-08-06 rule
was "never a town" — that was **reversed on 2026-08-17** for findability, since `instalatér Zlín`
is the query with the volume and no region-level phrase substitutes for it. PLAN.md 5.2 has the
whole arc.

`mesta` in `values.json` holds twelve towns and feeds two places: the visible "Kam jezdím" block on
`index.html` and `kontakt.html`, and JSON-LD `areaServed`, where `sync.mjs` appends them after
`kraj` and `okresy` typed as `City`. `okresy` stays structured-data-only — between a kraj and a
town list it would just be noise on the page.

Three things that did not change with it:

- **Twelve towns is a ceiling.** Listing every obce in the kraj is the doorway pattern engines
  discount and readers read as padding. Grow the list only where he actually works.
- **No travel radius in kilometres**, ever — same objection as a promised response time.
- **Never add `<meta name="keywords">`.** Google dropped it in 2009 and Seznam ignores it; towns
  there rank nothing. The three placements that work are a heading, body copy, and `areaServed`.

Watch the declension: `mesta` is nominative, so it may only follow a colon or a dash. A preposition
("do Zlín, Otrokovice") is broken Czech, and one comma-separated value cannot carry two cases —
the same trap as `kraj`/`krajKde`.

Those tiles are the **only** third-party request the site makes. The owner decided this on
2026-08-04, knowing the cost:

- Each visitor's IP reaches the OSM Foundation. **OSMF is therefore listed among the recipients in
  `ochrana-osobnich-udaju.html`** — that row and the tile layer live and die together.
- Verified 2026-08-04: `tile.openstreetmap.org` sends **no `Set-Cookie`**, so no consent banner is
  triggered. If that ever changes, the banner question reopens for the whole site.
- OSMF sits in the UK, which has an adequacy decision under Art. 45 GDPR (renewed 2025-12-19,
  valid to 2031-12-27), so the transfer needs no further safeguard. Noted in the page.

**The OSMF tile policy is a real constraint, not a formality.** Permitted is normal interactive
viewing that fetches only the current viewport. Prohibited — and *"blocked without prior notice"* —
is any pre-emptive fetching: pre-seeding, offline/download-area features, automated bbox scans
(they call out z≥14). Never add any of that. Commercial sites are explicitly warned that access may
be withdrawn, which is why `js/map.js` calls `region.bringToFront()`: if tiles ever stop, the kraj
outline still renders over an empty background instead of leaving a grey box.

Attribution to OpenStreetMap must stay visible — required both by the tile policy and by ODbL,
since the boundary is OSM-derived too. The boundary is simplified to ~45 m, which is why `maxZoom`
is capped a few levels above the fitted zoom; further in it would visibly diverge from the real
border, and street-level detail is what the mapy.cz link is for.

The map is **progressive enhancement** like everything else: `partials/map.html` holds a static
image and a link to mapy.cz, and `js/map.js` only replaces it once Leaflet and the GeoJSON have
both loaded. With JS off, or if the fetch fails, the fallback simply stays.

## The contact form

Submits to **Web3Forms**. Its access key is **public by design** and belongs in the HTML — it is an
identifier, not a credential. It cannot read past submissions, cannot change the account, and cannot
redirect mail: the destination address is bound server-side. The only abuse vector is spam to the
owner's own inbox, mitigated by the honeypot and, if needed, by rotating the key.

A static site cannot hold a secret at all. **Nothing genuinely secret may ever enter this repo** —
if a feature needs a real credential, it does not belong on GitHub Pages.

**No consent checkbox.** The legal basis is Art. 6(1)(b) GDPR (steps prior to entering a contract),
not consent. Next to the submit button there is only a link to the privacy notice. Most Czech
templates get this wrong; consent is revocable and would have to be evidenced.

The form must work **without JavaScript** via a native POST redirecting to `poptavka-odeslana.html`.

## Legal text that must appear

Full detail, verified against official sources with citations, is in [PLAN.md](PLAN.md) section 4.
The parts that constrain everyday work:

**Footer of every page, per § 435 NOZ** — the duty explicitly covers information made publicly
available by remote access, i.e. the site itself: full name as registered, sídlo, **IČO**, the
živnostenský rejstřík registration line, and either DIČ or an explicit "Nejsem plátcem DPH."
Enforced by živnostenské úřady; up to 50 000 Kč.

**ADR information, per § 14 zákona o ochraně spotřebitele** — ČOI as the competent body, *including
its web address*, must appear **on the site and in the terms**. This duty is very much alive and is
routinely confused with the dead ODR one below.

**Any price shown anywhere must be a final price including VAT** (§ 12 zákona o ochraně
spotřebitele) — this applies to a stray "od 500 Kč" in body copy, not just to a price list.

Two things appear in nearly every Czech template online and are now **wrong** — never copy them in:
the **EU ODR platform** link (Regulation (EU) 2024/3228 repealed the old rules; the platform ceased
operating 2025-07-20 and MPO says existing links must be removed) and any mention of **EET**
(abolished 2024-01-01).

## Qualification boundaries the copy must not drift across

Vodoinstalatérství and topenářství are řemeslné živnosti. The two trades next to them are not, and
claiming a qualification he does not hold is both a misleading commercial practice and a
živnostenský úřad problem. Full detail in [PLAN.md](PLAN.md) 4.12.

**Solid-fuel boiler checks — the one qualification the site names, and only per manufacturer.**
Added 2026-10-03. Under § 17 odst. 1 písm. h) zákona č. 201/2012 Sb. only a technician trained
**and** authorised by the boiler's maker **and** listed in MŽP's register (`ipo.mzp.cz`) may do the
three-yearly check; MŽP's FAQ says plainly that someone not in the register is not qualified. So the
copy names makes, never "kotle" in general. **The owner's decision, 2026-10-03:** name ATMOS, OPOP
and Czechtherm, although the register that day listed him for **OPOP only** (č. OPO2399, valid to
2029-09-30) — he holds the other two makers' training certificates and expects them to enter him.
Until they do, the callout's "najdete mě v databázi" is not true for those two, and he must not issue
a check certificate for their boilers. Re-check the register (PLAN.md 4.12 says how); if an entry
never appears or lapses, that make comes out. **Never "revizní technik"** — the owner's call
too, once the reason was put to him: it is the TIČR title for vyhrazená technická zařízení, which
the gas callout says he does not hold. The statute *is* cited here, unlike for air conditioning.

**Gas — the line moved on 2026-08-17 and is now finer than "no".** Out: pipework, valves, pressure
tests, revisions (vázaná živnost, TIČR). In: hanging a boiler and plumbing its water and heating
side. The technician's: the gas connection itself, first commissioning, and the *protokol o uvedení
do provozu*. Both halves have to stay in the copy — "osadím kotel" alone reads as an offer to work
on the gas line, and "plyn nedělám" alone is now false. Stated in two places that must agree:
the callout on `sluzby.html` and the scope sentence in `obchodni-podminky.html`, the second of
which is contractual.

**Air conditioning — the owner holds no F-gas certificate, and the site names none.** Confirmed
2026-08-17. Opening a refrigerant circuit is restricted to a certified person (Regulation (EU)
517/2014), so the copy never claims the work personally: it says **"zajistím"** and **"ve
spolupráci s firmou KLIMAKOL"** (Zlín), and `obchodni-podminky.html` says the same. Three things
stay out — a certificate number or any word implying authorisation; **the statutory citation
itself**, removed on the owner's instruction because quoting the rule beside an offer implies the
offerer meets it; and a first-person installation verb like "montuji klimatizace". An F-gas callout,
`partials/klima-cert.html` and the `fgasCert` value all existed briefly that day and were deleted —
do not restore them. Klimakol is a commercial partner, never phrased so their standing reads as
covering his.

The seven manufacturers' marks under that section are **nominative use, not a dealership claim**,
and `.brands__note` says so. Vendored under `assets/img/znacky/` from Wikimedia Commons and the
manufacturers' own sites — not from `klimakol.cz`, whose upload folder is theirs to serve. Do not
add a make he does not actually fit, and do not delete the note. Its heading is "Značky, které vám
zajistím" — it read "…které montuji" until 2026-10-03, a first-person installation verb the rule
above excludes.

**Topenářství has a second strip** (2026-10-03): ATMOS, OPOP and Czechtherm, headed "Kotle, které
osazuji". It lists makes he **fits**, which needs no registration. The check claim lives only in the
callout above it.

Both strips link each mark to the brand's Czech site, or to its official Czech representative
where the maker has none (aux.cz is the AUX importer, impromat-klima.cz represents Fujitsu, now
renamed GENERAL). **Carrier is deliberately unlinked**: it has no Czech presence left. The notes
say where the links go.

## No user-generated content, ever

No comments, no ratings, no visitor uploads, no review widgets. Two independent reasons: written
reviews trigger a disclosure duty about whether and how they are verified (ČOI fines reach 5 000 000
Kč), and any facility for visitors to post content can make the site an *intermediary service* under
the **DSA**. A purely static presentation site is outside the DSA entirely — keep it that way.

## Domain: the site's code is ready, the hosting is not

The owner bought **`vodotoposomek.cz`** on 2026-08-06, reversing the earlier "no custom domain ever"
decision. `webUrl` in `values.json` now holds it, and sync has pushed it through every absolute URL
in the project.

**That is all that was asked for, and all that has been done.** There is deliberately **no `CNAME`
file** in this repository, no DNS record and no change to the Pages settings — the owner is doing
that. Do not create any of them unless explicitly asked.

The consequence, which matters until that happens: `canonical`, `og:url`, the sitemap `<loc>`s, the
`Sitemap:` line and the form's no-JavaScript `redirect` all point at a host that does not yet serve
the site. The redirect is the one with a user-visible failure mode — submit the form with JS off
before DNS is live and the visitor lands nowhere. Either finish the domain setup or set `webUrl`
back to `https://m-hcz.github.io/instalatersomek` until you do.

Because the address no longer derives from the repository name, renaming the repo no longer changes
the public URL. Internal links are relative regardless, so a rename still breaks nothing inside the
site.

## Photos on the References page

Two rules with legal weight, not aesthetic preference (detail in [PLAN.md](PLAN.md) section 4):

- Photographing inside a customer's home requires **their consent** (§ 86 NOZ). Frames must not show
  identifiable people, documents, or anything that identifies the address.
- **Never use stock photography as if it were his own work** — that is a misleading commercial
  practice. Real photos, or no References page.

## Commands

There is no build, no lint, and no test suite. The local workflow is serving the directory and
keeping the generated regions in sync:

```sh
npx serve .                    # Node 24 is installed on this machine
node tools/sync.mjs            # after editing partials/ or values.json
node tools/sync.mjs --check    # before committing — exits 1 if a page is stale
node tools/qr.mjs              # after changing any value the contact QR carries
node tools/qr.mjs --check      # before committing — exits 1 if the QR is stale
```

`tools/qr.mjs` regenerates `assets/img/qr-kontakt.svg`, the vCard QR on `kontakt.html`. It is the
same kind of tool as `sync.mjs` — it rewrites a committed file from committed inputs, so it is not
a build step either. It carries its own QR encoder rather than calling a QR service, and that is
deliberate: a service URL printed on a van or a business card is a dependency you cannot recall if
the provider starts metering scans, redirects the code, or shuts down. **It reads `values.json`, so
it goes stale exactly when a contact value changes and nothing else notices** — run `--check`
alongside the sync one.

**Python is not installed here** — `python -m http.server` hits a Windows Store stub and fails, so
don't reach for it out of habit.

Serve over HTTP rather than opening `index.html` via `file://` — `fetch()` and some CSS `url()`
resolution fail under the `file:` origin, so `file://` can show bugs that don't exist and hide ones
that do.

Useful checks. **All four pass as of 2026-08-06**, with nothing expected or tolerated in the output.
The first one used to report the two catalogue placeholders, `[PROFIL NA FIRMY.CZ]` and `[INZERÁT NA
BAZOŠI]`; the "Najdete mě i tady" block now hides itself while neither address is real, so those
`href`s are no longer in the page at all and a `MISS` line means a genuine broken link again. The
one real miss it ever caught, `assets/img/mapa.svg`, was generated from the committed GeoJSON on
that date.

```sh
# every internal link and asset resolves
grep -oh '\(href\|src\)="[^"#]*"' *.html | sed 's/.*="//;s/"//' \
  | grep -v '^https\?:\|^tel:\|^mailto:\|^sms:' | sort -u | while read f; do [ -e "$f" ] || echo "MISS $f"; done

# no third-party <script>/<link>/<iframe> in the markup. rel="canonical" is filtered
# out: it is an absolute URL by necessity, but it points at this site and fetches nothing.
grep -n '<script[^>]*src="http\|<link[^>]*href="http\|<iframe' *.html | grep -v 'rel="canonical"'

# every remote origin named anywhere in the source. Only two of them are actually
# fetched by the browser, and both are in the privacy notice:
#   tile.openstreetmap.org   map tiles
#   api.web3forms.com        form submit
# The rest are inert and need no privacy-notice row — they are <a> targets the visitor
# has to click (mapy.cz, wa.me, coi.cz, adr.coi.cz, uoou.gov.cz, openstreetmap.org,
# leafletjs.com, msharp.cz, klimakol.cz, ipo.mzp.cz, and the brand-strip links on sluzby.html:
# aux.cz, lg.com, sinclair-solutions.com, impromat-klima.cz, olimpia-splendid.cz,
# aircon.panasonic.eu, atmos.eu, opop.cz, czechtherm.cz), this site's own origin in canonical/og:url/JSON-LD (vodotoposomek.cz),
# or a vocabulary identifier that is never dereferenced (schema.org, in @context).
# Anything beyond that list is a third party that has to be added to the privacy notice
# first — and if it sets a cookie, it brings the consent banner with it.
grep -ohE 'https?://[a-z0-9.-]+' js/*.js css/style.css *.html \
  | sed 's|https\?://||' | sort -u
```

## Deploying

Push to `main`. GitHub Pages serves the repository root — no build, no deploy step, no Actions
workflow. Repo settings → **Pages** → Source: *Deploy from a branch* → `main` / `/ (root)`.

Run `node tools/sync.mjs --check` first. Nothing on the server regenerates the pages, so an
unsynced page deploys exactly as stale as it is committed.

## The GitHub Pages path trap

Until the domain above actually serves the site, it is still reached at a **subpath**:
`https://m-hcz.github.io/instalatersomek/`. Root-absolute paths (`/css/style.css`,
`<img src="/assets/logo.svg">`) resolve correctly on `localhost` but **404 there**, because
`/css/style.css` means `m-hcz.github.io/css/style.css` — outside the repo. This is the most common
way this kind of site breaks in production only.

**Always use relative paths** — `css/style.css`, `./sluzby.html`, `assets/img/logo.webp`. This holds
for `href`/`src`, CSS `url()`, and JS `fetch()` alike. The rule does not relax once the domain is
live: relative paths are correct under both, and they are what lets the site be served from either
without touching a single link.

**`robots.txt` is only ever read from the origin root**, and that is the one thing the domain
genuinely fixes. On the subpath a crawler fetches `m-hcz.github.io/robots.txt` — a different
repository — and never `…/instalatersomek/robots.txt`, so the committed file was a record of intent
rather than an effective setting. On `vodotoposomek.cz` it sits at the root and binds. Its own header
tells that story. Either way, anything that must bind a crawler regardless of hosting goes in the
page: `<meta name="robots">` is what keeps `404.html` and `poptavka-odeslana.html` out of the index.

The handful of places that genuinely need an absolute URL — `sitemap.xml`, `canonical`, `og:url`,
the form's no-JS `redirect`, JSON-LD `@id` — all derive from the single `webUrl` value, so moving
between the two is one edit plus a sync.

One trap when you do move it: `webUrl` is substituted by plain text search, so **prose that quotes
the old address gets rewritten too.** Mentioning a previous URL in a comment means writing it
without the `https://` prefix, or the next sync silently replaces it and the comment starts
contradicting itself. `robots.txt` has a note where this already happened once.

## Never name a file after a DOS device — `assets/img/znacky/aux-logo.svg`

The AUX logo is `aux-logo.svg` while its six neighbours are plain brand names. That is not
untidiness and must not be "fixed".

**`AUX` is a reserved MS-DOS device name**, as are `CON`, `PRN`, `NUL`, `COM1`–`COM9` and
`LPT1`–`LPT9`. Windows refuses to open a file with one of those stems **whatever the extension**,
so `aux.svg` is unopenable through the ordinary Win32 API. The failure is nastier than a plain
error because the file can still be *created* by anything that writes through an extended-length
path, and MSYS tools read it happily — so `ls` in Git Bash lists it at its real size while
PowerShell's `Test-Path` returns `False` for the same path.

What it actually cost here: `git add` opens files through Win32, so it failed on that one path
and aborted with `fatal: adding files failed` — **blocking every commit in the repository**, not
just that file. The site itself was fine, since Pages serves from Linux; the damage was entirely
to the Windows working copy.

Worth knowing generally, because this project is developed on Windows and served from Linux: a
filename that is illegal here is often perfectly legal there, so this class of bug reaches the
repo without anything on the site ever looking wrong.

## `.nojekyll`

Committed at the repo root, intentionally empty. Without it GitHub Pages runs the repo through
Jekyll, which **silently omits** files and directories whose names begin with `_` or `.`. The
failure looks like a missing asset with no error anywhere. Do not delete it.
