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
        //'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite'
          'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmentation/float32/latest/selfie_segmentation.tflite'
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

  // create canvases
  const imgCanvas = document.createElement('canvas');
  const maskCanvas = document.createElement('canvas');
  
  imgCanvas.width = width;
  imgCanvas.height = height;
  maskCanvas.width = width;
  maskCanvas.height = height;
  
  const imgCtx = imgCanvas.getContext('2d');
  const maskCtx = maskCanvas.getContext('2d');
  
  // draw original image
  imgCtx.drawImage(bitmap, 0, 0, width, height);
  
  // get mask
  const mask = result.categoryMask;
  const maskData = mask.getAsFloat32Array();
  
  // render mask as grayscale image
  const maskImage = maskCtx.createImageData(width, height);
  const data = maskImage.data;
  
  for (let i = 0; i < maskData.length; i++) {
    const v = maskData[i] * 255;
  
    data[i * 4] = v;     // R
    data[i * 4 + 1] = v; // G
    data[i * 4 + 2] = v; // B
    data[i * 4 + 3] = 255;
  }
  
  maskCtx.putImageData(maskImage, 0, 0);
  
  // show both on page
  document.body.appendChild(imgCanvas);
  document.body.appendChild(maskCanvas);

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
