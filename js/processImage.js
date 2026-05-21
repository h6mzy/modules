async function processImage(file, {
  width = 500,
  type = 'image/webp',
  quality = 0.6
} = {}) {
  const bitmap = await createImageBitmap(file);
  const scale = width / bitmap.width;
  const canvas = document.createElement('canvas');

  canvas.width = width;
  canvas.height = Math.round(bitmap.height * scale);

  const ctx = canvas.getContext('2d');

  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  return new Promise(resolve => {
    canvas.toBlob(blob => {
      resolve(blob);
    }, type, quality);
  });
}
