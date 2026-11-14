const sharp = require('sharp');

const MAX_PHOTO_DATA_LENGTH = 350000;

async function normalizePhoto(value) {
  const invalid = () => Object.assign(new Error('Choose a valid JPEG, PNG or WebP photo under 250 KB after resizing.'), { status: 400 });
  if (typeof value !== 'string' || value.length > MAX_PHOTO_DATA_LENGTH) throw invalid();
  const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!match) throw invalid();
  try {
    const input = Buffer.from(match[2], 'base64');
    if (input.toString('base64') !== match[2]) throw invalid();
    const image = sharp(input, { limitInputPixels: 16000000, failOn: 'warning' });
    const metadata = await image.metadata();
    if (metadata.format !== match[1] || (metadata.pages || 1) > 1) throw invalid();
    // Re-encode raster data and discard metadata. Never store the original upload.
    const output = await image.rotate().resize(384, 384, { fit: 'cover' })
      .flatten({ background: '#ffffff' }).jpeg({ quality: 85 }).toBuffer();
    return `data:image/jpeg;base64,${output.toString('base64')}`;
  } catch {
    throw invalid();
  }
}

module.exports = { normalizePhoto };
