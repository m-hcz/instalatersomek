// =========================================================================
// Generates assets/img/qr-kontakt.svg — a QR code holding the owner's contact
// details as a vCard, so that scanning it offers to save him to contacts.
//
//   node tools/qr.mjs            # write the SVG
//   node tools/qr.mjs --check    # exit 1 if the committed SVG is stale
//
// Like tools/sync.mjs this is NOT a build step. It rewrites a committed file
// from committed inputs; deploying is still `git push`, and nothing runs at
// deploy time. Re-run it whenever a value the card carries changes — phone,
// jmeno, brand, tagline, the address parts, webUrl or email. `--check` is
// there so a stale card is caught before it is committed rather than after it
// is printed on something.
//
// The encoder below is written out in full, on purpose. The point of a QR on
// a tradesperson's van or business card is that it keeps working forever with
// nobody administering it: no generator service in the middle that could
// rate-limit scans, meter them, expire the code, redirect it somewhere else,
// or disappear and take the code with it. A third-party "QR service" URL is a
// dependency printed onto physical objects you cannot recall. This encodes the
// vCard directly, so what the scanner reads is the contact card itself and
// nothing on the internet has to still exist for it to work.
//
// Implements ISO/IEC 18004 byte mode: encoding, Reed-Solomon over GF(256),
// block interleaving, all eight data masks scored by the standard's four
// penalty rules, and BCH-coded format/version information.
// =========================================================================

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = 'assets/img/qr-kontakt.svg'

// --- QR tables ----------------------------------------------------------
// Error-correction codewords per block, and number of blocks, indexed
// [ecLevel][version]. Version 0 is unused padding. Straight out of the
// standard's tables 13-22.
const EC_CODEWORDS_PER_BLOCK = [
  [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30], // L
  [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28], // M
  [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30], // Q
  [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30], // H
]
const NUM_EC_BLOCKS = [
  [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25], // L
  [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49], // M
  [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68], // Q
  [-1, 1, 1, 2, 4, 4, 4, 5, 5, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81], // H
]
// Format-information bits for each level, in the standard's own order.
const EC_FORMAT_BITS = { L: 1, M: 0, Q: 3, H: 2 }
const EC_INDEX = { L: 0, M: 1, Q: 2, H: 3 }

/* Total module count available to data + EC, before the format/version areas
   are subtracted. Straight from the standard's formula rather than a table,
   so there is one fewer transcribed number to get wrong. */
function rawDataModules(ver) {
  let result = (16 * ver + 128) * ver + 64
  if (ver >= 2) {
    const numAlign = Math.floor(ver / 7) + 2
    result -= (25 * numAlign - 10) * numAlign - 55
    if (ver >= 7) result -= 36
  }
  return result
}

const totalCodewords = (ver) => Math.floor(rawDataModules(ver) / 8)

function dataCodewords(ver, ec) {
  return (
    totalCodewords(ver) -
    EC_CODEWORDS_PER_BLOCK[EC_INDEX[ec]][ver] * NUM_EC_BLOCKS[EC_INDEX[ec]][ver]
  )
}

function alignmentPositions(ver) {
  if (ver === 1) return []
  const size = ver * 4 + 17
  const numAlign = Math.floor(ver / 7) + 2
  const step = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (numAlign * 2 - 2)) * 2
  const result = [6]
  for (let pos = size - 7; result.length < numAlign; pos -= step) result.splice(1, 0, pos)
  return result
}

// --- GF(256) arithmetic, primitive polynomial 0x11D ----------------------
const EXP = new Uint8Array(512)
const LOG = new Uint8Array(256)
{
  let x = 1
  for (let i = 0; i < 255; i++) {
    EXP[i] = x
    LOG[x] = i
    x <<= 1
    if (x & 0x100) x ^= 0x11d
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]
}
const gfMul = (a, b) => (a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]])

/* Coefficients of the generator polynomial (x-a^0)(x-a^1)...(x-a^(degree-1)),
   highest power first, with the leading 1 left off — that is exactly the set
   rsEncode multiplies by, so storing it this way keeps the two in step.
   For degree 2 the polynomial is x^2 + 3x + 2 and this returns [3, 2]. */
function rsGenerator(degree) {
  const coef = new Uint8Array(degree)
  coef[degree - 1] = 1
  let root = 1
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      coef[j] = gfMul(coef[j], root)
      if (j + 1 < degree) coef[j] ^= coef[j + 1]
    }
    root = gfMul(root, 0x02)
  }
  return coef
}

/* Remainder of data * x^degree divided by the generator — the EC codewords. */
function rsEncode(data, degree) {
  const gen = rsGenerator(degree)
  const res = new Uint8Array(degree)
  for (const byte of data) {
    const factor = byte ^ res[0]
    res.copyWithin(0, 1)
    res[degree - 1] = 0
    for (let i = 0; i < degree; i++) res[i] ^= gfMul(gen[i], factor)
  }
  return res
}

// --- bit stream ---------------------------------------------------------
class Bits {
  constructor() { this.bits = [] }
  push(value, len) {
    for (let i = len - 1; i >= 0; i--) this.bits.push((value >>> i) & 1)
  }
}

// --- encoding -----------------------------------------------------------
/* Byte mode only. The payload is a vCard, which is mixed case with
   punctuation, so alphanumeric mode could not represent it anyway. */
function chooseVersion(byteLen, ec) {
  for (let ver = 1; ver <= 40; ver++) {
    // 8-bit character count below version 10, 16-bit from version 10 up.
    const countBits = ver < 10 ? 8 : 16
    const capacity = dataCodewords(ver, ec) * 8
    if (4 + countBits + byteLen * 8 <= capacity) return ver
  }
  throw new Error(`payload of ${byteLen} bytes does not fit any version at level ${ec}`)
}

function buildCodewords(bytes, ver, ec) {
  const capacityBits = dataCodewords(ver, ec) * 8
  const bs = new Bits()
  bs.push(0b0100, 4)                       // byte mode
  bs.push(bytes.length, ver < 10 ? 8 : 16) // character count
  for (const b of bytes) bs.push(b, 8)

  // Terminator, then pad to a byte boundary, then alternate pad codewords.
  bs.push(0, Math.min(4, capacityBits - bs.bits.length))
  while (bs.bits.length % 8 !== 0) bs.bits.push(0)

  const out = []
  for (let i = 0; i < bs.bits.length; i += 8) {
    let byte = 0
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bs.bits[i + j]
    out.push(byte)
  }
  for (let pad = 0xec; out.length < capacityBits / 8; pad ^= 0xec ^ 0x11) out.push(pad)
  return out
}

/* Split into blocks, add EC to each, then interleave — data codewords first,
   taking one from each block in turn, then the EC codewords the same way. */
function interleave(data, ver, ec) {
  const numBlocks = NUM_EC_BLOCKS[EC_INDEX[ec]][ver]
  const ecLen = EC_CODEWORDS_PER_BLOCK[EC_INDEX[ec]][ver]
  const total = totalCodewords(ver)
  const shortLen = Math.floor(total / numBlocks) - ecLen
  const numShort = numBlocks - (total % numBlocks)

  const blocks = []
  for (let i = 0, offset = 0; i < numBlocks; i++) {
    const len = shortLen + (i < numShort ? 0 : 1)
    const block = data.slice(offset, offset + len)
    offset += len
    blocks.push({ data: block, ec: rsEncode(block, ecLen) })
  }

  const result = []
  for (let i = 0; i < shortLen + 1; i++) {
    for (const b of blocks) if (i < b.data.length) result.push(b.data[i])
  }
  for (let i = 0; i < ecLen; i++) for (const b of blocks) result.push(b.ec[i])
  return result
}

// --- matrix -------------------------------------------------------------
function newMatrix(size) {
  return {
    size,
    modules: Array.from({ length: size }, () => new Uint8Array(size)),
    // Function modules (finders, timing, format, …) must not be overwritten
    // by data and must not be masked.
    reserved: Array.from({ length: size }, () => new Uint8Array(size)),
  }
}

function setFunction(m, x, y, dark) {
  if (x < 0 || y < 0 || x >= m.size || y >= m.size) return
  m.modules[y][x] = dark ? 1 : 0
  m.reserved[y][x] = 1
}

function drawFinder(m, cx, cy) {
  for (let dy = -4; dy <= 4; dy++) {
    for (let dx = -4; dx <= 4; dx++) {
      const dist = Math.max(Math.abs(dx), Math.abs(dy))
      setFunction(m, cx + dx, cy + dy, dist !== 2 && dist <= 3)
    }
  }
}

function drawAlignment(m, cx, cy) {
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      setFunction(m, cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1)
    }
  }
}

function drawFunctionPatterns(m, ver) {
  const size = m.size

  // Timing patterns run the full width and height; finders overwrite the ends.
  for (let i = 0; i < size; i++) {
    setFunction(m, 6, i, i % 2 === 0)
    setFunction(m, i, 6, i % 2 === 0)
  }

  drawFinder(m, 3, 3)
  drawFinder(m, size - 4, 3)
  drawFinder(m, 3, size - 4)

  const pos = alignmentPositions(ver)
  for (let i = 0; i < pos.length; i++) {
    for (let j = 0; j < pos.length; j++) {
      // The three corners are occupied by finder patterns.
      const corner =
        (i === 0 && j === 0) || (i === 0 && j === pos.length - 1) || (i === pos.length - 1 && j === 0)
      if (!corner) drawAlignment(m, pos[i], pos[j])
    }
  }

  // Reserve the format-information areas; the real bits go in later, once the
  // mask is chosen. The module above the bottom-left finder is always dark.
  const fmt = formatPositions(size)
  for (const [x, y] of [...fmt.a, ...fmt.b]) setFunction(m, x, y, false)
  setFunction(m, 8, size - 8, true)

  if (ver >= 7) {
    for (let i = 0; i < 18; i++) {
      const x = i % 3
      const y = Math.floor(i / 3)
      setFunction(m, size - 11 + x, y, false)
      setFunction(m, y, size - 11 + x, false)
    }
  }
}

/* BCH(15,5) with generator 0x537, then XOR with the standard's mask so the
   all-zero format never appears as all-zero modules. */
function formatBits(ec, mask) {
  const data = (EC_FORMAT_BITS[ec] << 3) | mask
  let rem = data
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537)
  return ((data << 10) | rem) ^ 0x5412
}

/* BCH(18,6) with generator 0x1F25. Only versions 7 and up carry it. */
function versionBits(ver) {
  let rem = ver
  for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25)
  return (ver << 12) | rem
}

/* The fifteen format-information module positions, both copies, listed once so
   that reserving the area and writing the bits into it cannot disagree.
   Index i is bit i of the format string, least significant first.

   Mind the gaps at (8,6) and (6,8): those two belong to the timing patterns,
   which run the full width and height underneath. Walking 0..8 straight down
   the row and column instead — the obvious way to write this — silently
   overwrites the first module of each timing pattern, and nothing decodes. */
function formatPositions(size) {
  const a = [] // first copy, wrapped around the top-left finder
  for (let i = 0; i <= 5; i++) a.push([8, i])
  a.push([8, 7], [8, 8], [7, 8])
  for (let i = 9; i < 15; i++) a.push([14 - i, 8])

  const b = [] // second copy, split between the other two finders
  for (let i = 0; i < 8; i++) b.push([size - 1 - i, 8])
  for (let i = 8; i < 15; i++) b.push([8, size - 15 + i])

  return { a, b }
}

function drawFormat(m, ec, mask) {
  const bits = formatBits(ec, mask)
  const bit = (i) => (bits >>> i) & 1
  const fmt = formatPositions(m.size)
  fmt.a.forEach(([x, y], i) => setFunction(m, x, y, bit(i)))
  fmt.b.forEach(([x, y], i) => setFunction(m, x, y, bit(i)))
  setFunction(m, 8, m.size - 8, true)
}

function drawVersion(m, ver) {
  if (ver < 7) return
  const bits = versionBits(ver)
  const size = m.size
  for (let i = 0; i < 18; i++) {
    const b = (bits >>> i) & 1
    const x = i % 3
    const y = Math.floor(i / 3)
    setFunction(m, size - 11 + x, y, b)
    setFunction(m, y, size - 11 + x, b)
  }
}

/* Two-module-wide columns, right to left, zigzagging up then down, skipping
   the vertical timing column. */
function drawCodewords(m, codewords) {
  let i = 0
  let upward = true
  for (let right = m.size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5 // skip the timing column
    for (let vert = 0; vert < m.size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j
        const y = upward ? m.size - 1 - vert : vert
        if (m.reserved[y][x]) continue
        const bitIndex = i & 7
        const byte = codewords[i >>> 3]
        m.modules[y][x] = byte === undefined ? 0 : (byte >>> (7 - bitIndex)) & 1
        i++
      }
    }
    upward = !upward
  }
}

const MASKS = [
  (x, y) => (x + y) % 2 === 0,
  (x, y) => y % 2 === 0,
  (x, y) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
]

function applyMask(m, mask) {
  for (let y = 0; y < m.size; y++) {
    for (let x = 0; x < m.size; x++) {
      if (!m.reserved[y][x] && MASKS[mask](x, y)) m.modules[y][x] ^= 1
    }
  }
}

/* The standard's four penalty rules. Lower is better. */
function penalty(m) {
  const size = m.size
  const get = (x, y) => m.modules[y][x]
  let score = 0

  // N1: runs of five or more same-coloured modules in a row or column.
  for (let axis = 0; axis < 2; axis++) {
    for (let a = 0; a < size; a++) {
      let runColour = -1
      let runLength = 0
      for (let b = 0; b < size; b++) {
        const v = axis === 0 ? get(b, a) : get(a, b)
        if (v === runColour) {
          runLength++
          if (runLength === 5) score += 3
          else if (runLength > 5) score += 1
        } else {
          runColour = v
          runLength = 1
        }
      }
    }
  }

  // N2: every 2x2 block of one colour.
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const v = get(x, y)
      if (v === get(x + 1, y) && v === get(x, y + 1) && v === get(x + 1, y + 1)) score += 3
    }
  }

  // N3: the finder-like 1:1:3:1:1 pattern with four light modules on one side.
  const PAT = [1, 0, 1, 1, 1, 0, 1]
  for (let axis = 0; axis < 2; axis++) {
    for (let a = 0; a < size; a++) {
      for (let b = 0; b + 7 <= size; b++) {
        const at = (k) => (axis === 0 ? get(b + k, a) : get(a, b + k))
        let hit = true
        for (let k = 0; k < 7; k++) if (at(k) !== PAT[k]) { hit = false; break }
        if (!hit) continue
        const clear = (from, to) => {
          for (let k = from; k < to; k++) {
            const idx = b + k
            if (idx < 0 || idx >= size) continue
            if ((axis === 0 ? get(idx, a) : get(a, idx)) !== 0) return false
          }
          return true
        }
        if (clear(-4, 0) || clear(7, 11)) score += 40
      }
    }
  }

  // N4: deviation from an even split of dark and light, per 5%.
  let dark = 0
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) dark += get(x, y)
  const total = size * size
  const k = Math.floor((Math.abs(dark * 20 - total * 10) + total - 1) / total)
  score += k * 10
  return score
}

function encodeQr(text, ec = 'M') {
  const bytes = Array.from(Buffer.from(text, 'utf8'))
  const ver = chooseVersion(bytes.length, ec)
  const codewords = interleave(buildCodewords(bytes, ver, ec), ver, ec)

  let best = null
  for (let mask = 0; mask < 8; mask++) {
    const m = newMatrix(ver * 4 + 17)
    drawFunctionPatterns(m, ver)
    drawVersion(m, ver)
    drawFormat(m, ec, mask)
    drawCodewords(m, codewords)
    applyMask(m, mask)
    const score = penalty(m)
    if (!best || score < best.score) best = { score, mask, m }
  }
  return { ...best, version: ver, ec, byteLength: bytes.length }
}

// --- vCard --------------------------------------------------------------
const isPlaceholder = (v) => typeof v === 'string' && v.startsWith('[')
/* RFC 2426 §2.4.2: backslash, semicolon, comma and newline are escaped in a
   value. Without this a comma in a street name would silently split a field. */
const esc = (s) => String(s).replace(/([\\;,])/g, '\\$1').replace(/\n/g, '\\n')

function vcard(v) {
  const parts = String(v.jmeno).trim().split(/\s+/)
  const family = parts.pop()
  const given = parts.join(' ')

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${esc(family)};${esc(given)};;;`,
    `FN:${esc(v.jmeno)}`,
    `ORG:${esc(v.brand)}`,
    `TITLE:${esc(v.tagline)}`,
    `TEL;TYPE=CELL:${v.phone}`,
  ]
  // Same rule as the {{#real:…}} blocks in the page templates: a placeholder
  // saved into someone's address book is worse than a missing field.
  if (!isPlaceholder(v.email)) lines.push(`EMAIL;TYPE=INTERNET:${esc(v.email)}`)
  lines.push(
    `ADR;TYPE=WORK:;;${esc(v.ulice)};${esc(v.obec)};;${esc(v.psc)};Česká republika`,
    `URL:${v.webUrl}`,
    'END:VCARD'
  )
  // vCard 3.0 is UTF-8 by default (RFC 2426), so the Czech diacritics need no
  // CHARSET parameter and the QR carries the raw UTF-8 bytes.
  return lines.join('\r\n') + '\r\n'
}

// --- SVG ----------------------------------------------------------------
/* An XML comment may not contain two consecutive hyphens. Breaking that rule
   does not fail loudly: the browser refuses to parse the SVG, renders nothing,
   leaves naturalWidth at 0, and the page just shows an empty box — with no
   console error and no failed request to notice. It has already happened twice
   in this repo (a "--check" in the comment below, and the design-token names
   in assets/img/mapa.svg), so it is asserted here rather than remembered. */
function assertParseableComments(svg) {
  for (const m of svg.matchAll(/<!--([\s\S]*?)-->/g)) {
    if (m[1].includes('--')) {
      throw new Error(
        'refusing to write an SVG whose comment contains "--": that is illegal in XML, ' +
        'so the file would silently fail to render.\n  offending comment: ' +
        m[0].slice(0, 120).replace(/\s+/g, ' ')
      )
    }
  }
  return svg
}

function toSvg(qr, payloadNote) {
  const QUIET = 4 // the standard's minimum quiet zone, in modules
  const size = qr.m.size
  const dim = size + QUIET * 2

  // One path for every dark module. Runs of adjacent dark modules in a row are
  // merged into a single rectangle, which roughly halves the file.
  const parts = []
  for (let y = 0; y < size; y++) {
    let run = 0
    for (let x = 0; x <= size; x++) {
      const dark = x < size && qr.m.modules[y][x] === 1
      if (dark) { run++; continue }
      if (run > 0) {
        parts.push(`M${x - run + QUIET} ${y + QUIET}h${run}v1h-${run}z`)
        run = 0
      }
    }
  }

  return assertParseableComments(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dim} ${dim}" width="${dim * 8}" height="${dim * 8}" role="img" aria-label="QR kód s kontaktem">
  <!-- Generated by tools/qr.mjs from values.json. Do not hand-edit: run
       "node tools/qr.mjs" after changing any contact value, and run it again
       with the check flag before committing.
       ${payloadNote}
       The white rectangle is not decoration. A QR needs a light background
       and the 4-module quiet zone around it to be readable at all, so the
       code must never be left transparent over a dark surface. -->
  <rect width="${dim}" height="${dim}" fill="#ffffff"/>
  <path d="${parts.join('')}" fill="#0a3252"/>
</svg>
`)
}

// --- main ---------------------------------------------------------------
const values = JSON.parse(fs.readFileSync(path.join(ROOT, 'values.json'), 'utf8'))
const payload = vcard(values)
const qr = encodeQr(payload, 'M')
const note = `vCard ${qr.byteLength} B, verze ${qr.version} (${qr.m.size}x${qr.m.size} modulu), korekce M, maska ${qr.mask}.`
const svg = toSvg(qr, note)

const outPath = path.join(ROOT, OUT)
const check = process.argv.includes('--check')
const existing = fs.existsSync(outPath) ? fs.readFileSync(outPath, 'utf8') : null

if (check) {
  if (existing === svg) {
    console.log(`up to date: ${OUT} (${note})`)
  } else {
    console.error(
      `stale: ${OUT} does not match values.json — run \`node tools/qr.mjs\`.\n` +
      `  the card would be: ${note}`
    )
    process.exit(1)
  }
} else {
  fs.writeFileSync(outPath, svg)
  console.log(`wrote ${OUT} — ${note}`)
}

export { encodeQr, vcard }
