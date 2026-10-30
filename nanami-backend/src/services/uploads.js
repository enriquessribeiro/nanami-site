import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import multer from 'multer';
import sharp from 'sharp';
import { config } from '../config.js';
import { HttpError } from '../lib/errors.js';

/**
 * Upload de imagem de produto.
 *
 * Cadeia de defesa, em ordem:
 * 1. multer em memória com limite de 5 MB e um único arquivo (nada toca o disco
 *    antes de ser validado).
 * 2. Assinatura binária (magic bytes) além do mimetype — o mimetype vem do
 *    cliente e é trivial de forjar.
 * 3. `sharp` decodifica e reescreve tudo como WebP: metadados (EXIF/GPS) são
 *    descartados, e payloads embutidos num "polyglot" morrem na recodificação.
 * 4. Nome aleatório (UUID) + extensão fixa, gravado fora do webroot.
 *
 * SVG fica de fora de propósito: é XML e pode carregar script.
 */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const MAX_PIXELS = 30_000_000; // ~30 MP: evita "decompression bomb"
const MAX_SIDE = 1600;

export const MEDIA_FILE_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/;

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_UPLOAD_BYTES,
    files: 1,
    // Limita campos do multipart também; o form do admin só manda o arquivo.
    fields: 2,
  },
  fileFilter: (req, file, callback) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return callback(new HttpError(415, 'unsupported_media', 'Envie uma imagem JPEG, PNG ou WebP.'));
    }
    return callback(null, true);
  },
}).single('image');

function detectImageType(buffer) {
  if (!buffer || buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpeg';

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'png';
  }

  // WebP: "RIFF" .... "WEBP"
  if (
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'webp';
  }

  return null;
}

export async function saveProductImage(file) {
  if (!file) throw new HttpError(400, 'missing_file', 'Selecione uma imagem.');

  const type = detectImageType(file.buffer);
  if (!type) {
    throw new HttpError(415, 'unsupported_media', 'O arquivo não é uma imagem JPEG, PNG ou WebP válida.');
  }

  let output;
  try {
    output = await sharp(file.buffer, { limitInputPixels: MAX_PIXELS })
      .rotate() // respeita a orientação do EXIF antes de descartá-lo
      .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();
  } catch {
    throw new HttpError(422, 'invalid_image', 'Não foi possível processar essa imagem.');
  }

  await fs.mkdir(config.uploadDir, { recursive: true });

  const filename = `${crypto.randomUUID()}.webp`;
  await fs.writeFile(path.join(config.uploadDir, filename), output, { mode: 0o644 });

  return filename;
}

/** Caminho absoluto só para arquivos que passam no padrão de nome. */
export function mediaFilePath(filename) {
  if (!MEDIA_FILE_PATTERN.test(filename)) return null;
  return path.join(config.uploadDir, filename);
}

/** Remoção best-effort: apagar imagem não pode derrubar a operação principal. */
export async function deleteProductImage(filename) {
  if (!filename || !MEDIA_FILE_PATTERN.test(filename)) return;
  await fs.rm(path.join(config.uploadDir, filename), { force: true }).catch(() => {});
}
