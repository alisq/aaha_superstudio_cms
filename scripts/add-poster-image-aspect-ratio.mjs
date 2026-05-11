/**
 * Reads poster (prefer thumbnail — matches submissionTeaser lazy img) dimensions
 * and writes poster_image_aspect_ratio (width / height) into each submission.
 *
 * Run from repo root: node scripts/add-poster-image-aspect-ratio.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const jsonPath = path.join(root, 'src/data/submissions.json');
const publicDir = path.join(root, 'public');

function readPngDims(buf) {
  if (buf.length < 24) return null;
  if (buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4e || buf[3] !== 0x47) return null;
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  if (!w || !h) return null;
  return { w, h };
}

function readJpegDims(buf) {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let o = 2;
  while (o + 9 < buf.length) {
    if (buf[o] !== 0xff) {
      o++;
      continue;
    }
    const marker = buf[o + 1];
    const segLen = buf.readUInt16BE(o + 2);
    if (segLen < 2) return null;
    // Start of Frame markers (baseline / extended / progressive)
    if (
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      marker === 0xc9 ||
      marker === 0xcb ||
      marker === 0xcd
    ) {
      const h = buf.readUInt16BE(o + 5);
      const w = buf.readUInt16BE(o + 7);
      if (!w || !h) return null;
      return { w, h };
    }
    o += 2 + segLen;
  }
  return null;
}

function readImageDims(filePath) {
  const lower = filePath.toLowerCase();
  const stat = fs.statSync(filePath);
  const maxFirst = Math.min(stat.size, 4 * 1024 * 1024);

  const fd = fs.openSync(filePath, 'r');
  try {
    const buf = Buffer.alloc(maxFirst);
    const n = fs.readSync(fd, buf, 0, maxFirst, 0);
    const slice = buf.subarray(0, n);

    const tryPng = () => readPngDims(slice);
    const tryJpeg = () => readJpegDims(slice);

    if (lower.endsWith('.png')) return tryPng() || tryJpeg();
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return tryJpeg() || tryPng();
    return tryPng() || tryJpeg();
  } finally {
    fs.closeSync(fd);
  }
}

function thumbPathFromPoster(rel) {
  return rel.replace(/^files\//, 'files/thumbs/');
}

function resolvePosterPaths(relFromRoot) {
  const rel = relFromRoot.replace(/^\//, '');
  const fullAbs = path.join(publicDir, rel);
  const thumbAbs = path.join(publicDir, thumbPathFromPoster(rel));
  return { fullAbs, thumbAbs };
}

const raw = fs.readFileSync(jsonPath, 'utf8');
const data = JSON.parse(raw);

const warnings = [];
for (const s of data) {
  const poster = s.poster_image;
  if (!poster || typeof poster !== 'string') {
    warnings.push('Missing poster_image on a row');
    s.poster_image_aspect_ratio = null;
    continue;
  }
  const { fullAbs, thumbAbs } = resolvePosterPaths(poster);
  const useAbs = fs.existsSync(thumbAbs) ? thumbAbs : fullAbs;
  if (!fs.existsSync(useAbs)) {
    warnings.push(`No file for ${poster}`);
    s.poster_image_aspect_ratio = null;
    continue;
  }
  const dims = readImageDims(useAbs);
  if (!dims) {
    warnings.push(`Could not read dimensions: ${path.relative(root, useAbs)}`);
    s.poster_image_aspect_ratio = null;
    continue;
  }
  const ratio = dims.w / dims.h;
  s.poster_image_aspect_ratio = Math.round(ratio * 10000) / 10000;
}

if (warnings.length) {
  console.warn(warnings.join('\n'));
}

const nulls = data.filter((s) => s.poster_image_aspect_ratio == null).length;
console.log(`Wrote poster_image_aspect_ratio for ${data.length - nulls}/${data.length} submissions (${nulls} null).`);

fs.writeFileSync(jsonPath, `${JSON.stringify(data, null, 4)}\n`, 'utf8');
