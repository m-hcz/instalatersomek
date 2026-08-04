// Keeps the repeated parts of the site in sync from a single source.
//
//   node tools/sync.mjs           apply — rewrites the .html files in place
//   node tools/sync.mjs --check   verify only — exits 1 if anything is stale
//
// This is NOT a build step. It rewrites the committed source; what is committed
// stays byte-for-byte what GitHub Pages serves, and deploying is still `git push`.
// Nothing runs at deploy time and there are no dependencies — plain Node, no npm.
//
// Two mechanisms:
//
//   1. Partials. A region of a page delimited by
//          <!-- partial:header current="index" -->  …  <!-- /partial:header -->
//      is regenerated from partials/header.html. Anything you type between those
//      markers is overwritten on the next run — edit the partial instead.
//
//   2. Values. Everything in values.json is substituted inside partials, and
//      scattered occurrences elsewhere (page titles, meta descriptions, JSON-LD,
//      call-to-action buttons, prices, the site address in sitemap.xml and
//      robots.txt) are rewritten by replacing the previous value with the new one.
//      The previous values live in values.lock.json, which the script maintains —
//      commit it, and do not hand-edit it.
//
//      Because that substitution is plain text replacement, every placeholder in
//      values.json must be unique and must not sit inside another one. The script
//      checks this up front and refuses to run otherwise.
//
// Template syntax inside partials/:
//
//   {{key}}              a value from values.json, or an attribute of the marker
//   {{ph:key}}           the same, wrapped in <span class="ph"> while it still
//                        looks like a placeholder (i.e. starts with "[")
//   {{#key=value}}…{{/key}}   emit the body only when that attribute matches
//   {{>name key=value}}  include another partial, indented to the include site
//
// The phone number is stored once, in international form. Templates get three
// derived forms: {{phone}} (display, "777 123 456"), {{phoneHref}} (for tel:)
// and {{phoneWa}} (for wa.me — no "+", no spaces, or the link silently breaks).

import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const CHECK = process.argv.includes('--check')

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')
const exists = (p) => fs.existsSync(path.join(ROOT, p))

const values = JSON.parse(read('values.json'))
const lock = exists('values.lock.json') ? JSON.parse(read('values.lock.json')) : null

// --- values -------------------------------------------------------------

const isPlaceholder = (v) => typeof v === 'string' && v.startsWith('[')
const phSpan = (v) => (isPlaceholder(v) ? `<span class="ph">${v}</span>` : v)

// Substitution is plain text replacement, so two keys that hold the same string
// are indistinguishable on the page, and a placeholder nested inside another one
// gets rewritten when the outer key is filled in. Both silently corrupt pages, so
// refuse to run rather than produce damage that only shows up in the rendered site.
function assertDistinct(v) {
  const entries = Object.entries(v).filter(([k, val]) => !k.startsWith('_') && typeof val === 'string')

  const seen = new Map()
  for (const [k, val] of entries) {
    if (seen.has(val)) {
      throw new Error(
        `values.json: "${k}" and "${seen.get(val)}" both hold ${JSON.stringify(val)}. ` +
        `Give each key a placeholder of its own — otherwise filling one in rewrites the other.`
      )
    }
    seen.set(val, k)
  }

  const ph = entries.filter(([, val]) => isPlaceholder(val))
  for (const [k, val] of ph) {
    for (const [k2, val2] of ph) {
      if (k !== k2 && val2.includes(val)) {
        throw new Error(
          `values.json: the placeholder for "${k}" (${val}) sits inside the one for ` +
          `"${k2}" (${val2}). Filling in "${k}" would corrupt "${k2}".`
        )
      }
    }
  }
}

// Czech mobile formatting: +420777123456 -> "777 123 456"
function displayPhone(intl) {
  const digits = String(intl).replace(/\D/g, '')
  const local = digits.startsWith('420') ? digits.slice(3) : digits
  return local.replace(/(\d{3})(?=\d)/g, '$1 ').trim()
}

// The template's view of the values, with the derived forms added.
function view(v) {
  const out = {}
  for (const [k, val] of Object.entries(v)) if (!k.startsWith('_')) out[k] = val
  out.phone = displayPhone(v.phone)
  out.phoneHref = v.phone
  out.phoneWa = String(v.phone).replace(/^\+/, '')
  // Page titles shorten the brand to the surname alone ("… — Šomek"), which does
  // not match the brand string and so would survive a rename. Deriving it means
  // renaming the business updates the titles too. Longest-first ordering in
  // replacements() rewrites the full brand before the bare surname, so the two
  // never collide.
  out.prijmeni = String(v.brand).trim().split(/\s+/).pop()
  return out
}

assertDistinct(values)
const VIEW = view(values)

// Old -> new pairs for occurrences that live outside any partial region.
// Longest first: "+420777123456" must be rewritten before "420777123456",
// or the shorter one corrupts the middle of the longer.
function replacements() {
  if (!lock) return []
  const before = view(lock)
  const pairs = []
  for (const [k, next] of Object.entries(VIEW)) {
    const prev = before[k]
    if (prev === undefined || prev === next) continue
    // Placeholder -> real is the direction that matters, and it is lossless: the
    // wrapped form is rewritten before the bare one, so a <span class="ph"> in body
    // copy disappears while a bare occurrence in a <title> is just substituted.
    // The reverse cannot be undone here — once a value is real, an occurrence in
    // body copy and one in a <title> look identical, so the wrapper is unrecoverable.
    if (!isPlaceholder(prev) && isPlaceholder(next)) {
      console.warn(
        `warning: "${k}" is going back to a placeholder. The <span class="ph"> ` +
        `wrappers it used to have cannot be restored — use git to revert instead.`
      )
    }
    if (phSpan(prev) !== prev) pairs.push([phSpan(prev), phSpan(next)])
    pairs.push([prev, next])
  }
  return pairs.sort((a, b) => b[0].length - a[0].length)
}

// --- partials -----------------------------------------------------------

const partialCache = new Map()
function partial(name) {
  if (!partialCache.has(name)) {
    const file = `partials/${name}.html`
    if (!exists(file)) throw new Error(`missing partial: ${file}`)
    partialCache.set(name, read(file))
  }
  return partialCache.get(name)
}

function parseAttrs(raw) {
  const attrs = {}
  for (const m of String(raw).matchAll(/([\w-]+)\s*=\s*(?:"([^"]*)"|(\S+))/g)) {
    attrs[m[1]] = m[2] !== undefined ? m[2] : m[3]
  }
  return attrs
}

function render(name, attrs, seen = []) {
  if (seen.includes(name)) throw new Error(`partial include cycle: ${[...seen, name].join(' -> ')}`)
  const lookup = (k) => (k in attrs ? attrs[k] : k in VIEW ? VIEW[k] : `{{${k}}}`)
  let src = partial(name)

  // includes, indented to match the line the {{> }} sat on
  src = src.replace(/^([ \t]*)\{\{>\s*([\w-]+)([^}]*)\}\}[ \t]*$/gm, (_, indent, inc, raw) =>
    render(inc, { ...attrs, ...parseAttrs(raw) }, [...seen, name])
      .replace(/\n$/, '')
      .split('\n')
      .map((line) => (line ? indent + line : line))
      .join('\n')
  )

  src = src.replace(/\{\{#([\w-]+)=([^}]*)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, k, v, body) =>
    attrs[k] === v ? body : ''
  )
  src = src.replace(/\{\{ph:([\w-]+)\}\}/g, (_, k) => phSpan(lookup(k)))
  src = src.replace(/\{\{([\w-]+)\}\}/g, (_, k) => lookup(k))
  return src
}

// --- pages --------------------------------------------------------------

// Group 1 is the marker's own indentation, so a partial spliced into nested
// markup lines up with it instead of jumping to column 0.
const MARKER = /^([ \t]*)<!--\s*partial:([\w-]+)([^>]*?)-->[\s\S]*?<!--\s*\/partial:\2\s*-->/gm

function transform(text) {
  for (const [from, to] of replacements()) text = text.split(from).join(to)

  return text.replace(MARKER, (whole, indent, name, raw) => {
    const attrs = parseAttrs(raw)
    const body = render(name, attrs)
      .replace(/\n$/, '')
      .split('\n')
      .map((line) => (line ? indent + line : line))
      .join('\n')
    const open = whole.slice(0, whole.indexOf('-->') + 3)
    return `${open}\n${body}\n${indent}<!-- /partial:${name} -->`
  })
}

// sitemap.xml and robots.txt carry the site address, which is a value like any
// other. They have no partial markers, so only the substitution pass touches them.
const EXTRA = ['sitemap.xml', 'robots.txt']

const pages = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html')).sort()
const targets = [...pages, ...EXTRA.filter(exists)]
const stale = []

for (const page of targets) {
  const original = read(page)
  const crlf = original.includes('\r\n')
  // Work in LF so the regexes stay simple, then restore the file's own endings.
  const next = transform(crlf ? original.replace(/\r\n/g, '\n') : original)
  const out = crlf ? next.replace(/\n/g, '\r\n') : next
  if (out === original) continue
  stale.push(page)
  if (!CHECK) fs.writeFileSync(path.join(ROOT, page), out)
}

const lockStale = JSON.stringify(lock) !== JSON.stringify(values)

if (CHECK) {
  if (stale.length || lockStale) {
    if (stale.length) console.error(`out of sync: ${stale.join(', ')}`)
    if (lockStale) console.error('values.lock.json does not match values.json')
    console.error('run: node tools/sync.mjs')
    process.exit(1)
  }
  console.log(`in sync — ${pages.length} pages + ${targets.length - pages.length} other files`)
} else {
  if (lockStale) fs.writeFileSync(path.join(ROOT, 'values.lock.json'), JSON.stringify(values, null, 2) + '\n')
  console.log(stale.length ? `updated: ${stale.join(', ')}` : `no changes — ${targets.length} files already in sync`)
}
