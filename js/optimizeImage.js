export default async function optimizeImage(
  file,
  {
    width = 500,
    type = 'image/webp',
    quality = 0.6
  } = {}
) {
  const bitmap = await createImageBitmap(file);

  // prevent upscaling
  const targetWidth = Math.min(width, bitmap.width);

  const scale = targetWidth / bitmap.width;

  const canvas = document.createElement('canvas');

  canvas.width = targetWidth;
  canvas.height = Math.round(bitmap.height * scale);

  const ctx = canvas.getContext('2d');

  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('Image processing failed'));
        return;
      }

      resolve(blob);
    }, type, quality);
  });
}
