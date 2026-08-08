/** Regenerates the placeholder images in /public/media. No dependencies —
 *  writes PNGs directly (zlib is built into Node). Run: npm run placeholders
 *  These are stand-ins; delete them when real media replaces them.
 *  (The placeholder .mp4 was generated once with ffmpeg — see README.) */
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MEDIA_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "media");

let table;
function crc32(buf) {
  if (!table) {
    table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function png(width, height, pixel) {
  const raw = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y++) {
    const row = y * (1 + width * 3);
    raw[row] = 0; // filter type: none
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixel(x, y);
      const i = row + 1 + x * 3;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: truecolor
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const hex = (s) => [s.slice(1, 3), s.slice(3, 5), s.slice(5, 7)].map((h) => parseInt(h, 16));

/** Soft tinted field, faint vertical falloff, hairline diagonals every 64px. */
function field(base, line) {
  const [br, bg, bb] = hex(base);
  const [lr, lg, lb] = hex(line);
  return (w, h) => (x, y) => {
    const t = 1 - 0.05 * (y / h);
    if ((((x - y) % 64) + 64) % 64 === 0) return [lr, lg, lb];
    return [Math.round(br * t), Math.round(bg * t), Math.round(bb * t)];
  };
}

const images = [
  ["flexure-cover.png", 1600, 800, field("#d8d2c4", "#c6c0b2")],
  ["turret-figure.png", 1200, 800, field("#c9cfc2", "#b8beb1")],
];

mkdirSync(MEDIA_DIR, { recursive: true });
for (const [name, w, h, make] of images) {
  writeFileSync(join(MEDIA_DIR, name), png(w, h, make(w, h)));
  console.log(`wrote public/media/${name} (${w}x${h})`);
}
