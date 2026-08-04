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
footers, the § 435 identification block and the mobile call bar live in `partials/`.

Values that recur across pages — phone, e-mail, IČO, town — live in `values.json`. Change one there
and run sync; it rewrites every occurrence, including the ones no partial covers (page titles, meta
descriptions, JSON-LD, call-to-action buttons). `values.lock.json` records what was last applied;
commit it, never hand-edit it.

```sh
node tools/sync.mjs            # apply
node tools/sync.mjs --check    # exits 1 if any page is stale; use before committing
```

Two things that will bite:

- **Czech declension.** One town name is not enough. `mesto` is the nominative for titles;
  `mestoKde` is the locative **and carries its own preposition** ("ve Frýdku-Místku" vs
  "v Havířově"), so never write `v` next to it. Same trap for any value dropped into prose.
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

## No user-generated content, ever

No comments, no ratings, no visitor uploads, no review widgets. Two independent reasons: written
reviews trigger a disclosure duty about whether and how they are verified (ČOI fines reach 5 000 000
Kč), and any facility for visitors to post content can make the site an *intermediary service* under
the **DSA**. A purely static presentation site is outside the DSA entirely — keep it that way.

## Domain: nothing to do

There is no custom domain and none is planned. **Do not create a `CNAME` file** and do not touch
anything DNS- or domain-related. The repository/folder may be renamed by the owner at some point;
all internal links are relative, so a rename breaks nothing inside the site.

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
```

**Python is not installed here** — `python -m http.server` hits a Windows Store stub and fails, so
don't reach for it out of habit.

Serve over HTTP rather than opening `index.html` via `file://` — `fetch()` and some CSS `url()`
resolution fail under the `file:` origin, so `file://` can show bugs that don't exist and hide ones
that do.

Useful checks (all pass as of 2026-08-04):

```sh
# every internal link and asset resolves
grep -oh '\(href\|src\)="[^"#]*"' *.html | sed 's/.*="//;s/"//' \
  | grep -v '^https\?:\|^tel:\|^mailto:\|^sms:' | sort -u | while read f; do [ -e "$f" ] || echo "MISS $f"; done

# no third-party <script>/<link>/<iframe> in the markup
grep -n '<script[^>]*src="http\|<link[^>]*href="http\|<iframe' *.html

# every remote origin the browser actually contacts. Expected, and nothing else:
#   tile.openstreetmap.org   map tiles      (listed in the privacy notice)
#   api.web3forms.com        form submit    (listed in the privacy notice)
# Anything new here is a third party that has to be added to the privacy notice
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

There will **never** be a custom domain — that is a settled decision, not a deferred one — so the
site is permanently served from a **subpath**: `https://<user>.github.io/instalatersomek/`.

Root-absolute paths (`/css/style.css`, `<img src="/assets/logo.svg">`) resolve correctly on
`localhost:8000` but **404 on the live site**, because `/css/style.css` means
`<user>.github.io/css/style.css` — outside the repo. This is the most common way this kind of site
breaks in production only.

**Always use relative paths** — `css/style.css`, `./sluzby.html`, `assets/img/logo.webp`. This holds
for `href`/`src`, CSS `url()`, and JS `fetch()` alike.

## `.nojekyll`

Committed at the repo root, intentionally empty. Without it GitHub Pages runs the repo through
Jekyll, which **silently omits** files and directories whose names begin with `_` or `.`. The
failure looks like a missing asset with no error anywhere. Do not delete it.
