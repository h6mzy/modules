import {
  ImageSegmenter,
  FilesetResolver
} from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest';

let segmenter;

/**
 * Lazy init MediaPipe segmenter
 */
async function getSegmenter() {
  if (segmenter) return segmenter;

  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  );

  segmenter = await ImageSegmenter.createFromOptions(
    vision,
    {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite'
      },
      runningMode: 'IMAGE',
      outputCategoryMask: true
    }
  );

  return segmenter;
}

/**
 * Remove background from image file
 * Returns: Blob (transparent WebP)
 */
export default async function removeBackground(
  file,
  {
    maxWidth = 768,
    quality = 0.9,
    threshold = 0.5
  } = {}
) {
  const seg = await getSegmenter();

  // ---- load image ----
  const bitmap = await createImageBitmap(file);

  // ---- resize for performance ----
  const scale = Math.min(1, maxWidth / bitmap.width);

  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');

  // draw resized image
  ctx.drawImage(bitmap, 0, 0, width, height);

  // ---- run segmentation (IMPORTANT: use bitmap) ----
  const result = seg.segment(bitmap);

  const mask = result.categoryMask;
  const maskData = mask.getAsFloat32Array();

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // ---- apply mask safely ----
  const totalPixels = width * height;

  for (let i = 0; i < totalPixels; i++) {
    const alpha = maskData[i];

    const pixelIndex = i * 4;

    if (alpha < threshold) {
      // remove background
      data[pixelIndex + 3] = 0;
    } else {
      // optional: soft edge blending
      data[pixelIndex + 3] = data[pixelIndex + 3] * alpha;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // ---- export blob ----
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('removeBackground: toBlob failed'));
        return;
      }
      resolve(blob);
    }, 'image/webp', quality);
  });
}
