# Site plan — Instalatér Šomek

Consolidated outcome of the planning sessions on 2026-08-03. Every decision below is signed off by
the owner.

**Build status:** all eight pages are built and working, with placeholder data throughout, ready to
show the customer. Replacement checklist: [PLACEHOLDERS.md](PLACEHOLDERS.md). Two spec deviations
are recorded in section 5 (system fonts instead of a self-hosted face; no mobile nav toggle).

**Language rule:** this document, all code, comments, and commit messages are in English. Czech
appears only in text that is rendered on the page, and in the names of Czech statutes.

Section 4 was verified against primary and official sources on 2026-08-03 — see section 10.

---

## 1. Locked decisions

| Area | Decision | Consequence |
|---|---|---|
| Analytics and ads | **None whatsoever** | No analytics, no Google Ads, no remarketing, no pixels, no tracking of any kind. Site sets no cookies → no consent banner, no cookie page, no consent JS. Also **no traffic data at all**, since GitHub Pages exposes no logs |
| Contact | Phone + e-mail + **form (Web3Forms)** | Public access key, honeypot, non-EU processor named in the privacy notice |
| Prices | **Not published** | The obchodní podmínky must instead describe how the price is calculated (§ 1811 NOZ) |
| Structure | **Multi-page** | Better SEO than one-page; each page targets a different search |
| Emergency callouts | **None — planned jobs only** | The § 1837 urgent-repair exemption will rarely apply → the 14-day withdrawal right covers most jobs. See 4.5 |
| References | **Photos only**, no written testimonials | Avoids the review-disclosure duty **and** keeps the site outside the DSA. See 4.4 |
| Visual style | Clean and trustworthy — blue + white | Large type, generous whitespace, phone number always within reach |
| Domain | **`vodotoposomek.cz`**, bought 2026-08-06 — reverses the earlier "github.io only" decision | Only `webUrl` was changed. `CNAME`, DNS and the Pages setting are the owner's and are **not** done. **Relative paths remain the rule** — correct under both the subpath and the domain |
| Repo / folder name | **Owner will rename later** | Internal links are all relative, so a rename breaks nothing inside the site — only links already shared externally |
| Czech copy | **Drafted by the developer, corrected by the owner** | The project is not blocked on the owner writing prose — only on him supplying facts |
| Maintenance | **All changes go through the developer** | No CMS, no in-browser editing guide, no contributor documentation needed |

### Considered and declined

Recorded so they are not proposed again. Each can be revisited on request.

- **"O mně" section with a portrait** — declined.
- **FAQ section** — declined.
- **Google Search Console** — declined; accepted consequence is zero visibility into traffic.
- **Meta CSP lockdown** — declined; the cookie-free rule stays a written convention rather than a
  browser-enforced one, so section 2 has to be respected by hand.

## 2. Invariants that must not be broken by accident

Each of these is easy to undo with one innocent-looking change, and each has a legal consequence.
With the meta CSP declined, **nothing enforces these mechanically** — they hold only if respected.

1. **The site stays cookie-free and tracker-free.** Forbidden without a new decision: Google
   Analytics or any analytics, Google Ads and remarketing tags, the Meta pixel, **Google reCAPTCHA**,
   hCaptcha, an embedded Google Maps `<iframe>`, YouTube embeds, Google Fonts via `<link>`, and
   social buttons loaded from a third-party domain. Any single one brings back the mandatory opt-in
   banner: cookies have required **prior, active, demonstrable consent since 2022-01-01**
   (§ 89 odst. 3 zákona č. 127/2005 Sb.), and before consent is given they may not be used at all.
   Replacements: **self-hosted fonts**, a **static map image linking out**, and a **honeypot instead
   of a captcha**.
2. **No consent checkbox on the form.** The legal basis for an inquiry is **Art. 6(1)(b) GDPR** —
   steps taken at the data subject's request prior to entering a contract. Consent is the wrong
   basis and is worse for the owner: revocable, and it has to be evidenced. A blanket
   *"souhlasím s obchodními podmínkami a zpracováním osobních údajů"* checkbox is itself considered
   a GDPR problem, because it bundles unrelated things into one act of consent. Next to the submit
   button there is only a link to the privacy notice.
3. **No user-generated content, ever** — no comments, no ratings, no visitor uploads. Beyond the
   review-disclosure duty, any facility for visitors to post content can make the site an
   *intermediary service* and pull it into the **DSA**. A purely static presentation site is outside
   it. See 4.4.
4. **Identification details in the footer of every page** (§ 435 NOZ) — see 4.1.

## 3. Site structure

```
index.html                    Home
sluzby.html                   Services
reference.html                References (photo gallery)
kontakt.html                  Contact + inquiry form
poptavka-odeslana.html        Thank-you page after form submit
obchodni-podminky.html        Terms and conditions
ochrana-osobnich-udaju.html   Privacy notice
404.html                      Served automatically by GitHub Pages
robots.txt, sitemap.xml
```

File names stay Czech and diacritic-free — they are user-visible URLs and carry local SEO weight.

### Page contents

**index.html** — header (name, nav, phone as a button) · hero: what he does, where, and the call to
action · service overview (3–6 tiles) · "Proč si vybrat mě" · service area · sample of work linking
to references · contact block with the havárie note · footer with identification details.

**sluzby.html** — one block per service: what it covers, typical jobs, what the customer should
prepare, and a call to action under each. Then "Jak to probíhá" and the price block at `#cena`.

Both pages are written in the **first person singular** throughout — he is one man, not a company.
Competitor copy says "Proč si vybrat **nás**"; here it is "mě". Do not let a company voice creep in.

**reference.html** — photo grid, before/after where available. Captions naming the type of work.
No town in the captions — see the service-area note in 5.2. Lightbox in vanilla JS. See the photo
rules in 4.4.

**kontakt.html** — phone and e-mail as tappable links · inquiry form · availability (working hours)
· service area · static map image linking to a maps app · identification details · links to the
legal pages.

**Form** — minimum fields: name, phone, e-mail, description of the job. Hidden honeypot field.
Submits via `fetch` to Web3Forms and **works without JavaScript** through a native POST that
redirects to `poptavka-odeslana.html`. Data collection is deliberately minimal — no address field,
that gets settled on the phone. Needs a visible error state for a failed submission, falling back to
"call this number instead".

## 4. Legal requirements — verified

### 4.1 Footer of every page — § 435 NOZ

The duty covers "informace zpřístupňované veřejnosti prostřednictvím dálkového přístupu", i.e. the
website itself, not just invoices:

- full name exactly as registered in the živnostenský rejstřík
- registered place of business (sídlo)
- **IČO**
- "Zapsán v živnostenském rejstříku vedeném [obecní živnostenský úřad]."
- DIČ, or explicitly **"Nejsem plátcem DPH."**

The statute doesn't dictate placement — the details must simply be **easy to find**, and a footer or
Kontakt page satisfies that. Compliance is policed by **živnostenské úřady**, which in practice
issue a call to remedy first. Penalty for non-compliance: **up to 50 000 Kč**, and in principle a
ban on activity of up to one year.

### 4.2 Pre-contract information — § 1811, § 1820 NOZ

Before the contract is concluded the consumer must learn: the trader's identity, **contact details
including a telephone number and e-mail address**, a description of the service, **the price or how
it will be calculated**, payment and performance terms, and what to do about defects. Because
contracts here are agreed by phone or at the customer's home, the stricter regime for distance and
off-premises contracts (§ 1820 et seq.) applies on top.

### 4.3 Prices — § 12 zákona č. 634/1992 Sb.

There is no price list, but the duty attaches to **any** price that appears anywhere on the site
("od 500 Kč", an hourly rate, a travel charge). Prices toward consumers must be shown as the
**final price including VAT** — case law is explicit that a consumer cannot be expected to work out
for themselves whether VAT still has to be added. Hence the footer must state VAT status either way.
Misleading price presentation is sanctionable by the finanční úřad (up to 500 000 Kč) and ČOI
(up to 5 000 000 Kč).

### 4.4 References page: photos, reviews, and the DSA

- **Consent is required to photograph inside a customer's home** (§ 86 NOZ — protection of privacy
  and private premises). Get it in writing, ideally a line on the job sheet. Frames must avoid
  identifiable people, documents, and anything that identifies the address.
- **Stock photography must never be presented as his own work** — a misleading commercial practice.
  Real photos, or no References page at launch.
- **Written reviews are deliberately excluded.** Had we included them, the 2023 novela (effective
  2023-01-06) would require stating **whether** reviews are verified as coming from real customers
  and **how** — the law does not force verification, but unverified reviews must be visibly labelled
  as such. ČOI fines reach **5 000 000 Kč**.
- **DSA:** a static presentation site with no user-generated content is not an intermediary service
  and falls outside the Digital Services Act. Adding reviews, comments, or any visitor upload
  facility can bring it into scope. This is an independent reason to keep the site read-only.

### 4.5 The 14-day withdrawal right — the financially critical part

A contract agreed at the customer's home is concluded **off business premises**, so the consumer may
withdraw within 14 days without reason and without penalty (§ 1818, § 1829).

**The repair exception is narrower than it used to be.** § 1837 excludes withdrawal for
*"neodkladná oprava nebo údržba provedená v místě určeném spotřebitelem na jeho žádost"* — the word
**„neodkladná" (urgent) was added by the 2023 amendment**, so an ordinary requested repair no longer
qualifies. Since there are no emergency callouts, **this exception will rarely be available.**

Two exclusions that may still apply to larger jobs:

- **výstavba nebo zásadní přestavba budovy** — construction or substantial reconstruction of a
  building is excluded from withdrawal outright.
- A service **already fully performed**, where the consumer gave prior express consent to begin and
  was told they would thereby lose the right to withdraw.

**The money point, and it is the sharpest risk on this project.** If work begins inside the 14-day
window, the trader may claim a proportionate part of the price **only if** the consumer gave
**explicit prior consent** to begin *and* was informed of the obligation to pay for what is
performed (§ 1820, § 1832, § 1834). Absent either, the consumer who withdraws **pays nothing** —
the work is done and unbillable.

→ **Off-site action, more important than anything on the website:** one signed line on the job sheet
in which the customer expressly requests that work begin immediately and acknowledges the
consequence. The site's terms must carry the matching wording plus the model withdrawal form
(nařízení vlády č. 363/2013 Sb., as in force from 2023-01-06).

### 4.6 Complaints — § 19 zákona č. 634/1992 Sb., § 2615 et seq. NOZ

- Decide on a complaint **immediately**; in complex cases **within 3 working days**, excluding time
  reasonably needed for expert assessment of the defect.
- Resolve it and inform the customer **without undue delay, at the latest within 30 days**, unless a
  longer period is agreed. **Missing the 30 days gives the customer the same rights as for a defect
  that cannot be remedied.**
- Issue **written confirmation** that a complaint was raised, stating when, what it concerns, and
  the resolution the customer wants.
- Liability for defects of the work follows § 2615 et seq. NOZ; where the work qualifies as a
  **stavba**, the period is **5 years** (§ 2629), not 24 months.
- The terms must say where a complaint is filed (phone / e-mail).

### 4.7 Out-of-court dispute resolution — § 14 zákona č. 634/1992 Sb.

The trader must inform consumers **clearly, comprehensibly and in an easily accessible manner**
about the competent ADR body **including its internet address** — for this trade, **Česká obchodní
inspekce**, `coi.gov.cz` / `adr.coi.cz`. Where the trader operates a website, the information **must
appear on the website**; where the contract refers to terms and conditions, it must appear in those
too. So it goes in both the Kontakt page footer area and the obchodní podmínky.

### 4.8 Two things that must NOT appear

- **The EU ODR platform.** Regulation (EU) 2024/3228 repealed Regulation (EU) 524/2013; the platform
  stopped accepting complaints on 2025-03-20 and **ceased operating on 2025-07-20**. MPO states that
  the trader's duty to inform about it **has ended** and that existing links **should be removed as
  soon as possible**. This is now an active removal duty, not merely "don't add it". **The separate
  § 14 ADR duty in 4.7 remains fully in force** — the two are often confused.
- **EET** — abolished on 2024-01-01. Do not mention it.

### 4.9 GDPR — Art. 13

Controller and contact · purpose (handling the inquiry) · **legal basis Art. 6(1)(b)** · categories
of data · recipients · retention · data subject rights · right to complain to **ÚOOÚ** · an explicit
statement that the site uses no cookies, no analytics and no advertising trackers.

Both processors must be named, not just the obvious one:

- **Web3Forms** — receives form submissions.
- **GitHub (Microsoft), US** — the host receives every visitor's IP address in access logs on each
  page view, whether or not a form is ever submitted.

Both involve **transfer to a third country** under standard contractual clauses (Art. 46 GDPR).

### 4.10 Accessibility — zákon č. 424/2023 Sb. (EAA)

In force from **2025-06-28**, applying to e-commerce services. **A microenterprise — fewer than 10
employees *and* annual turnover or balance sheet total up to €2 million — is exempt**, and a
one-person presentation site is outside the scope in any case. **No legal duty applies.** (For sites
that are in scope, new ones had to comply from 2025-06-28 and existing ones have until 2030-06-28.)

We still aim at roughly WCAG 2.1 AA: contrast and tap-target size directly help someone calling from
a phone in poor light.

### 4.11 Not applicable — checked and ruled out

- **DSA** — no user-generated content, so not an intermediary service (4.4).
- **Zákon č. 480/2004 Sb.** (commercial communications) — no newsletter, no marketing e-mails.
- **EAA** — microenterprise exemption (4.10).
- **EET** — abolished (4.8).
- **Cookie consent** — nothing is stored on the visitor's device (invariant 1).

### 4.12 Certifications, the gas boundary, the F-gas one and boiler checks

Only claim what is actually held. Overstating a qualification is both a misleading commercial
practice and a živnostenský úřad problem — that principle has not moved, and it is what the two
boundaries below exist to enforce.

Vodoinstalatérství and topenářství are **řemeslné živnosti**. The two neighbouring trades are not,
and each has its own line.

#### The gas boundary — moved 2026-08-17

It used to read "no gas work at all". At the owner's instruction it now runs **between the gas
pipework and the appliance**:

- **Out** — gas pipework, valves, pressure tests, revisions. A **vázaná živnost** requiring
  **TIČR authorisation**, which he does not hold.
- **In** — hanging a gas boiler and connecting its **water and heating** side.
- **The technician's** — the connection to the gas line itself, first commissioning, adjustment,
  and the *protokol o uvedení do provozu*. An authorised service technician attends on site with
  him and issues it; the customer needs it for the manufacturer's warranty.

**Both halves have to stay in the copy.** "Osadím kotel" on its own reads as an offer to work on the
gas line; "plyn nedělám" on its own is now false. The callout on `sluzby.html` and the scope
sentence in `obchodni-podminky.html` are the two places this is stated, and they have to say the
same thing — the second one is contractual, since it defines what an order can cover.

#### Air conditioning, added 2026-08-17 — the site claims no certification at all

**The owner holds no F-gas certificate, and the site names none.** Confirmed 2026-08-17. That is
the governing fact for this section and it decides the register the copy is written in. (The boiler
authorisation below is unrelated and does not reach air conditioning.)

Opening a **refrigerant circuit** — installation and every later service — is restricted to a
certified person under **Regulation (EU) 517/2014** and **zákon č. 73/2012 Sb.** So the copy does
not claim the work personally. It says **"zajistím"** and **"ve spolupráci s firmou KLIMAKOL"**,
which is a statement about what the customer gets rather than about who is qualified to do what.
`obchodni-podminky.html` matches: "Montáž a servis klimatizací zajišťuji ve spolupráci s partnerskou
firmou."

Three things must stay out of this section, in both directions:

- **No certificate claim** — no number, no "certifikovaný", no "oprávnění", nothing that implies
  authorisation. A qualification claimed but not held is a misleading commercial practice.
- **No statutory citation either.** An earlier draft carried the Regulation and the zákon as a
  neutral statement of what the law requires. It was removed on the owner's instruction: quoting the
  rule next to an offer invites the reader to assume the offerer meets it, which is the same
  implication by a longer route.
- **No first-person installation verb** — "montuji klimatizace" reintroduces the claim that the two
  points above remove.

An F-gas callout and a `partials/klima-cert.html` existed briefly on 2026-08-17 and are both gone,
along with the `fgasCert` value. Do not restore them.

Equipment and the specialist work come from **KLIMAKOL s.r.o.** (Zlín, IČO 21548498), named on the
page as a partner. That is a commercial relationship, not a qualification, and it must never be
written so that their standing reads as covering his.

#### The brand strip

The seven manufacturers' marks on the air-conditioning section are **nominative use**: they name
the brands he fits. They are not a dealership claim, and `.brands__note` under the strip says so in
as many words. Do not add a manufacturer he does not actually fit, and do not delete the note.

The files are vendored under `assets/img/znacky/`, taken from Wikimedia Commons and the
manufacturers' own sites — deliberately **not** re-hosted from `klimakol.cz`, whose upload folder is
theirs to serve rather than ours to copy.

**Changed 2026-10-03, on the owner's decisions.** The heading went from "Značky, které montuji" to
"Značky, které vám zajistím" (and the note to "zajišťuji"), removing the first-person installation
verb this section excludes. Each mark now links to the brand's Czech site, or to its official Czech
representative where there is none:

| Mark | Link | Why that one |
|---|---|---|
| AUX | `aux.cz` | No manufacturer site in Czech; the official importer (AUX CZ&SK, Olomouc). It also sells installation, so it competes for customers — accepted |
| LG | `lg.com/cz/business/klimatizace/` | Manufacturer, air-conditioning section |
| Sinclair | `sinclair-solutions.com/cs/` | Manufacturer (`sinclair.cz` redirects there) |
| Carrier | **none** | No Czech presence left: `carrierklima.cz` no longer resolves, and `carrier.com` sends Czech visitors to its US site |
| Fujitsu | `impromat-klima.cz` | Official Czech representative. The maker became GENERAL on 2026-01-01 and its CZ page now redirects to its EU site |
| Olimpia Splendid | `olimpia-splendid.cz` | Czech site of the brand, run by its distributor |
| Panasonic | `aircon.panasonic.eu/CZ_cs/` | Manufacturer, heating & cooling, Czech |

The note says the links go to "české stránky výrobců nebo jejich oficiálního zastoupení", so a link
to an importer cannot read as his affiliation with it.

#### The boiler brand strip — added 2026-10-03

`sluzby.html` Topenářství carries the same component for **ATMOS, OPOP and Czechtherm**, headed
"Kotle, které osazuji". The owner confirmed he fits all three; fitting a boiler needs no
manufacturer registration. (Its note briefly ended by limiting checks to OPOP; that went the same day
when the check callout was shortened to name all three — see below.) Logos
come from the makers' own sites; `opop.svg` is their header logo with the white letters set to the
near-black printed on the boilers. Links: `atmos.eu` (where `atmos.cz` redirects; it opens in
Czech), `opop.cz`, `czechtherm.cz`.

#### Solid-fuel boiler checks — added 2026-10-03, verified the same day

The owner asked for "revizní technik kotlů ATMOS, OPOP, Czechtherm dle zákona č. 201/2012 Sb.",
backed by manufacturers' training certificates ("…proškolil … v rozsahu nutném k provádění kontrol
… podle § 17 odst. 1 písm. h)…"). What the law actually requires, read from the consolidated text in
force from 2026-01-01:

- **§ 17 odst. 1 písm. h)** — the operator of a solid-fuel combustion source of **10–300 kW** total
  rated heat input that feeds a central-heating water system must have its *kontrola technického
  stavu a provozu* done **at least once every three years** by an *odborně způsobilá osoba*: a
  natural person **trained by the source's manufacturer, holding that manufacturer's authorisation**
  for its installation, operation and maintenance, **and entered in the database under § 17a**.
  Only where the maker is unknown, defunct or cannot supply a technician within the reference price
  may a technician authorised by another maker for the same type step in, with the maker's statement.
- **§ 17a** — MŽP runs the database (`ipo.mzp.cz`); the *manufacturer* enters its technicians within
  30 days of authorising them. Authorisations lapse on expiry, or 12 months after the maker ceases.
- **§ 16 odst. 9** — the technician must report each check to MŽP through ISPOP within 60 days of
  issuing the doklad; failure is a přestupek up to 50 000 Kč (§ 25 odst. 1 písm. i, odst. 5 písm. e).
- **§ 25 odst. 1 písm. u)** — issuing the doklad without being an authorised *odborně způsobilá
  osoba*, or with false data, is a přestupek of a podnikající fyzická osoba, **up to 100 000 Kč**.
- **MŽP's FAQ (2025-04-09), q. 13:** *"Osoba, která není uvedena v databázi odborně způsobilých osob
  …, nemůže být ani odborně způsobilou osobou a kontroly … nesmí provádět."*

**Register check, 2026-10-03** (the open-data export at `ipo.mzp.cz/ipo-vvm/stahnout-otevrena-data`,
searched for IČO 68340435): one entry — **OPOP s.r.o., č. OPO2399, valid 2026-09-03 → 2029-09-30**,
covering prohořívací, odhořívací, zplyňovací and automatic boilers and stoves with a water jacket.
**ATMOS and Czechtherm had not entered him.** Both are registered makers, so the gap is theirs to
close, probably inside their 30 days. Until each appears, naming it would claim a qualification the
law says he does not yet have.

**The owner's decision, the same day, with the above put to him:** the copy names **all three makes**.
The first version named OPOP alone, with the explanation of the duty, the authorisation number and
expiry. The owner had it replaced with one short statement:

> **Technik pro kontroly kotlů ATMOS, OPOP a Czechtherm** (tzv. revize kotlů) podle zákona
> č. 201/2012 Sb. Najdete mě v databázi odborně způsobilých osob Ministerstva životního prostředí.

The same three makes appear in the "Co dělám" bullet, the `index.html` card and the JSON-LD
service description. **What that leaves open:** until ATMOS and Czechtherm enter him, the database
sentence is false for them, and the law bars him from checking their boilers. The § 25 fine falls on
issuing the doklad, not on the website, but a qualification claimed and not held is also a misleading
commercial practice (4.12 intro). **Re-check the register** — download the export above and search
for IČO 68340435. If either entry has not appeared within a few weeks, or OPOP lapses after
2029-09-30 unrenewed, that make comes out of all four places.

What stayed from the first version:

- **Per manufacturer, never in general.** The terms (`obchodni-podminky.html`) limit the service to
  makers who authorised him **without naming them**, so the contract does not go stale each time one
  is added or lapses.
- **Not "revizní technik"** — the owner asked for it and dropped it once the reason was put to him.
  That title belongs to vyhrazená technická zařízení and TIČR, the revisions the gas callout says he
  does not do. The law's term is *kontrola*; "revize kotlů" stays in brackets, as what people call it
  and search for.
- **The statute is cited**, which reverses the air-conditioning rule for a reason: there, quoting the
  law implied a qualification he lacks; here he holds it, at least for OPOP.

## 5. Technical specification

- **CSS** — a single `css/style.css`, custom properties for the palette, mobile-first, ~3
  breakpoints. No framework.
- **JS** — as built, **two** things: gallery lightbox and form submission. The planned mobile nav
  toggle was dropped — four links wrap onto two rows unaided, so a toggle would have added
  JavaScript, ARIA state and a focus trap to solve a problem that flexbox already solves.
  Progressive enhancement throughout: the site, including the form, works fully without JavaScript.
- **Browser baseline** — current evergreen browsers (Chrome, Edge, Firefox, Safari) plus iOS and
  Android Chrome. No build step means no transpiling, so anything newer needs a fallback.
- **Fonts** — as built, a **system font stack** (`-apple-system`, `Segoe UI`, `Roboto`, …): zero
  font requests, and complete Czech diacritic coverage on every platform. Verified over HTTP that
  ě, š, č, ř, ž and ů all render. If a branded typeface is ever wanted, it **must be self-hosted
  `woff2` including the `latin-ext` subset** — never a Google Fonts `<link>`, which would leak
  visitors' IP addresses to a third country and break invariant 1.
- **Images** — WebP, always with `width`/`height` (prevents layout shift), `loading="lazy"` below
  the fold.
- **JSON-LD** `Plumber` (a LocalBusiness subtype) with `areaServed` and `telephone`. **`openingHours`
  is omitted** — see 5.1.
- **Open Graph** tags — Facebook sharing is the main organic channel for trades in the CZ market.
- **Per-page `<title>` and meta description**, each targeting one search intent. The geographic
  term is the region, not a town — `instalatér a topenář ve Zlínském kraji`. Written and in place;
  see 5.2 for what that costs.
- **Budget** — whole site under ~150 kB.
- **Paths** — relative only (`css/style.css`). Still the rule after the move to a custom domain:
  relative paths are correct under both hosts, so the site survives being served from either.
- **Enforce HTTPS** must be switched on in the repository's Pages settings.

### 5.1 No fixed hours — two consequences

The owner works by arrangement rather than to published hours. That is honest, but it costs
something in both directions and needs handling rather than ignoring.

- **Structured data:** `openingHours` is left out of the JSON-LD entirely. Inventing a plausible
  range would be a lie that Google surfaces directly in search results, and customers would then
  call outside the hours he actually keeps.
- **Conversion:** "po telefonické dohodě" alone leaves visitors with no idea when calling is
  acceptable, and a meaningful share of them simply won't call. The fix is not to publish fixed
  hours but to publish a **calling window** — "volejte kdykoli mezi 7:00 a 19:00, termín domluvíme
  podle vaší i mé situace". This is on the still-needed list in section 6.

### 5.2 Service area: the region, not a town
**Decided 2026-08-06.** The site names **Zlínský kraj** and nothing smaller — no home town, no list
of villages, no travel radius in kilometres. Two values carry it, `kraj` and `krajKde`, and they
match the outline the map already draws.

This is a deliberate trade, and it costs something. `instalatér Zlín` is a far commoner query than
any region-level phrase and carries clearer intent; Google's local pack ranks on proximity to the
searcher, which a region-level page cannot signal. Region-level copy gives that up in exchange for
not committing to a base town. If it is ever revisited, towns go back into `values.json` and into
the copy on `index.html`, `sluzby.html` and `kontakt.html` — the partials need no change.

**Revisited 2026-08-06, and settled one level short of towns.** The question was reopened because
customers do search town by town. The decision taken was *structured data only*: `okresy` in
`values.json` lists the region's four districts, and `sync.mjs` derives `{{areaServed}}` from it
plus `kraj`. That bought less than a full revert, and was chosen because it committed the page to
nothing.

**Reversed 2026-08-17 — towns are now named, visibly.** The trade above was made for findability
reasons and it was undone for the same ones: `instalatér Zlín` is the query with the volume and the
intent, and no region-level phrase substitutes for it.

`mesta` in `values.json` holds twelve towns, covering all four okresy and including the sídlo:
Zlín, Otrokovice, Vsetín, Valašské Meziříčí, Uherské Hradiště, Kroměříž, Uherský Brod, Rožnov pod
Radhoštěm, Holešov, Luhačovice, Slavičín, Valašské Klobouky. It feeds two places:

- **Visible copy** — the "Kam jezdím" block on `index.html` and the same row on `kontakt.html`.
  This is the half that ranks.
- **JSON-LD `areaServed`** — appended after the kraj and the okresy, typed `City` rather than
  `AdministrativeArea` so the assertion is "obec", not "administrative unit of unstated size".

**Twelve is a deliberate ceiling, not a starting point.** A page listing every obec in the kraj is
the doorway pattern search engines discount and a reader recognises as padding. If the list grows,
it should grow because he actually works there.

What is still **not** on the site: a **travel radius in kilometres**. That would promise a
reachability one person without a standby rota cannot hold, which is the same objection that keeps
a response time off the emergency callout (4.x) and `openingHours` out of the JSON-LD (5.1).

The largest remaining lever is the one this change did **not** touch: no `<title>` or `<h1>` names
a town. `Instalatér a topenář ve Zlínském kraji` still heads the homepage. Putting `Zlín` there
outranks everything above it — it is one edit, and it is a naming decision rather than a technical
one.

**`<meta name="keywords">` is not a placement and must not be added.** Google dropped it in 2009,
Seznam ignores it, and a town list there would rank nothing while looking to a reader like the site
is padding for robots.

### Local SEO beyond the site
A Google Business Profile and a Firmy.cz listing move the needle more for a tradesperson than
anything on the site itself — and more so now that the page copy is region-level, since a listing
still carries a precise address. `firmyCz` and `bazos` in `values.json` feed both a visible list on
`kontakt.html` and JSON-LD `sameAs`.

## 6. Business facts

### Confirmed 2026-08-03

| Fact | Value |
|---|---|
| Services | **Vodoinstalatérství**, **topenářství**, **klimatizace**, **hodinový manžel** |
| Gas work | **Pipework not offered; boiler installation is** — see 4.12 for exactly where the line falls |
| Air conditioning | Added **2026-08-17**. **Arranged in cooperation with KLIMAKOL s.r.o.**, Zlín (IČO 21548498), who specialise in it. Never presented as his own trade — see 4.12 |
| Certifications | **No F-gas certificate**, confirmed 2026-08-17, so nothing is named for air conditioning. **One boiler-check authorisation** since 2026-10-03: OPOP, č. OPO2399, valid to 2029-09-30, verified in MŽP's register. ATMOS and Czechtherm training held but not yet registered — the site names all three on the owner's decision; re-check. See 4.12 |
| VAT | **Neplátce DPH** → footer states "Nejsem plátcem DPH"; every price shown is already final |
| Working hours | **No fixed hours — by arrangement** → consequences in 5.1 |
| Payment | **Cash on completion** and **bank transfer against an invoice**. **No card** — the terms should say so, so nobody expects a terminal |

Four service blocks means four content blocks on `sluzby.html` and four sets of target search
terms — `instalatér`, `topenář`, `montáž klimatizace`, `hodinový manžel`, each qualified by the
region rather than a town.

### Still needed — blocking

- full name as registered, sídlo, **IČO**
- phone, e-mail
- the competent obecní živnostenský úřad
- years of experience
- certifications actually held (výuční list, professional qualifications)
- **a window during which it is acceptable to call** — see 5.1
- how the price is arrived at: hourly rate, travel charge, how materials are billed
- **an access key from web3forms.com** (registered to the address where inquiries should land)

**Optional:** photos of completed work, with consent per 4.4; a logo; liability insurance details;
datová schránka ID.

**Sequencing:** the skeleton and visual design can be built with placeholder copy as soon as the
service list and service area arrive. The developer drafts all Czech copy; the owner corrects it.
Identification details and the access key are filled in last.

## 7. Definition of done for launch

- [ ] All seven pages built, copy drafted and corrected by the owner
- [ ] Identification block (§ 435) in the footer of every page
- [ ] ADR / ČOI information present per § 14 — on the site **and** in the terms
- [ ] Terms and privacy notice complete; **no ODR link**, no EET mention
- [ ] Withdrawal section and the model withdrawal form present; matching wording on the job sheet
- [ ] Any price shown anywhere is a final price including VAT
- [ ] Form delivers to the owner's real inbox — verified by an actual submission
- [ ] Form works with JavaScript disabled
- [ ] Tap-to-call verified on a real phone, not an emulator
- [ ] Every link resolves on the live host, not just on localhost
- [ ] `vodotoposomek.cz` serves the site — `CNAME`, DNS and Pages setting done. Until then every
      absolute URL (`canonical`, sitemap, the form's no-JS `redirect`) points at a dead host
- [ ] Czech diacritics render correctly, including in the self-hosted font
- [ ] 404 page reached and styled
- [ ] Pages set to deploy from `main` / root, **Enforce HTTPS** on
- [ ] `sitemap.xml` submitted; Google Business Profile and Firmy.cz listings created
- [ ] Owner has read the terms and the privacy notice and agrees with what they say

## 8. Note on legal texts

Section 4 is a verified requirements checklist, not legal advice. Before the site goes live, the
terms and the privacy notice are worth a review by someone qualified — especially **4.5**, which is
where an unenforceable claim costs real money rather than a fine.

## 9. Sources

Verified 2026-08-03.

- [MPO — Skončila informační povinnost obchodníků o platformě ODR](https://mpo.gov.cz/cz/ochrana-spotrebitele/mimosoudni-reseni-spotrebitelskych-sporu-adr/skoncila-informacni-povinnost-obchodniku-o-platforme-odr--288708/)
- [MPO — Ukončení činnosti evropské platformy pro řešení sporů on-line](https://mpo.gov.cz/cz/ochrana-spotrebitele/mimosoudni-reseni-spotrebitelskych-sporu-adr/ukonceni-cinnosti-evropske-platformy-pro-reseni-sporu-on-line-se-blizi--286849/)
- [ČOI — Odstoupení od smlouvy do 14 dnů u služeb](https://coi.gov.cz/faq/5-odstoupeni-od-smlouvy-do-14-dnu-u-sluzeb-2/)
- [ČOI — V jakých případech nemohu od smlouvy odstoupit?](https://coi.gov.cz/faq/b-v-jakych-pripadech-nemohu-od-smlouvy-odstoupit-6/)
- [ČOI — Mimosoudní řešení spotřebitelských sporů (ADR)](https://coi.gov.cz/pro-podnikatele/informace-pro-prodejce-zbozi-a-sluzeb/mimosoudni-reseni-spotrebitelskych-sporu-adr/)
- [ČOI — Recenze](https://coi.gov.cz/recenze/)
- [SOS Asociace — Výjimky z možnosti odstoupení od smlouvy (§ 1837)](https://www.asociace-sos.cz/vyjimky-z-moznosti-odstoupeni-od-smlouvy/)
- [Kurzy.cz — § 14 zákona o ochraně spotřebitele, informační povinnost o ADR](https://www.kurzy.cz/zakony/634-1992-zakon-o-ochrane-spotrebitele/paragraf-14/)
- [MPO — Zákon č. 424/2023 Sb. o požadavcích na přístupnost](https://mpo.gov.cz/cz/podnikani/standardizace/pristupnost-vyrobku-a-sluzeb/zakon-c--424-2023-sb---o-pozadavcich-na-pristupnost-nekterych-vyrobku-a-sluzeb--279601/)
- [Zákony pro lidi — 424/2023 Sb.](https://www.zakonyprolidi.cz/cs/2023-424)
- [ÚOOÚ — Akt o digitálních službách (DSA)](https://uoou.gov.cz/pravni-ramec/ochrana-osobnich-udaju/pravni-predpisy/akt-o-digitalnich-sluzbach-dsa)
- [Cisek — Na koho dopadá nařízení o digitálních službách](https://www.akcisek.cz/blog/na-koho-dopada-narizeni-o-digitalnich-sluzbach)
- [epravo.cz — Cookies nově jen se souhlasem, od roku 2022](https://www.epravo.cz/top/clanky/cookies-nove-jen-se-souhlasem-poslanecka-snemovna-prijala-zprisnujici-pravidla-od-roku-2022-113207.html)
- [epravo.cz — Nové požadavky na přístupnost některých výrobků a služeb](https://www.epravo.cz/top/clanky/nove-pozadavky-na-pristupnost-nekterych-vyrobku-a-sluzeb-118899.html)
- [MPO — Novela zákona o ochraně spotřebitele a občanského zákoníku](https://mpo.gov.cz/cz/ochrana-spotrebitele/informace-pro-spotrebitele/novela-zakona-o-ochrane-spotrebitele-a-obcanskeho-zakoniku--271440/)
- [dTest pro podnikatele — Uvádíte recenze? Toto musíte splnit](https://podnikatel.dtest.cz/blog/uvadite-recenze-toto-musite-splnit/)
- [BusinessInfo.cz — Reklamace zboží a služeb](https://www.businessinfo.cz/navody/reklamace-zbozi-a-sluzeb/)
- [Nejvyšší správní soud — Ochrana spotřebitele a informace o ceně výrobků a služeb](https://sbirka.nssoud.cz/cz/ochrana-spotrebitele-a-informace-o-cene-vyrobku-a-sluzeb.p751.html)
- [Macek Legal — Povinné údaje na webových stránkách podnikatelů](http://macek.lewest.cz/povinne-udaje-na-webovych-strankach-podnikatelu.html)
- [AZ Legal — Pozor na vysoké pokuty za chybějící povinné údaje](https://azlegal.cz/mate-firemni-web-pozor-na-vysoke-pokuty-za-chybejici-povinne-udaje/)
- [Právní prostor — Souhlas zákazníka se zpracováním osobních údajů: kdy je a kdy není potřeba](https://www.pravniprostor.cz/clanky/pravo-it/souhlas-zakaznika-se-zpracovanim-osobnich-udaju-kdy-je-kdy-neni-potreba)

Added 2026-10-03, for the boiler checks in 4.12:

- [Zákony pro lidi — 201/2012 Sb., o ochraně ovzduší (version in force from 2026-01-01)](https://www.zakonyprolidi.cz/cs/2012-201)
- [MŽP — Nejčastější dotazy ke kontrole technického stavu a provozu (2025-04-09)](https://mzp.gov.cz/system/files/2025-04/OOO-FAQ_KTSP-20250409.pdf)
- [MŽP — Databáze odborně způsobilých osob](https://ipo.mzp.cz/) and its open-data export, `https://ipo.mzp.cz/ipo-vvm/stahnout-otevrena-data`
