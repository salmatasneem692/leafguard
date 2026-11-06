import { PreprocessingMetrics } from '../types/index.ts';

/**
 * Preprocesses an image to MobileNetV2 specification:
 * 1. Resizes input image to 224 x 224 x 3
 * 2. Ensures RGB color channel order (stripping alpha channel)
 * 3. Normalizes pixel values using MobileNetV2 formula: (pixel / 127.5) - 1.0 in range [-1.0, 1.0]
 * 4. Computes scientific vegetation index (Excess Green: 2G - R - B) to validate leaf presence
 * 5. Estimates sharpness via variance of Laplacian approximation
 */
export async function preprocessLeafImage(
  imageSource: string | File | Blob
): Promise<{
  processedDataUrl: string;
  metrics: PreprocessingMetrics;
  normalizedTensorData: Float32Array; // shape [1, 224, 224, 3]
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const originalWidth = img.naturalWidth || img.width;
        const originalHeight = img.naturalHeight || img.height;

        if (originalWidth === 0 || originalHeight === 0) {
          reject(new Error('Invalid image dimensions (0x0). Please provide a valid leaf image.'));
          return;
        }

        // Create 224x224 canvas for MobileNetV2 target resolution
        const targetSize = 224;
        const canvas = document.createElement('canvas');
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          reject(new Error('Unable to create 2D canvas context for preprocessing.'));
          return;
        }

        // Draw image resized with smooth bicubic scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetSize, targetSize);

        const imgData = ctx.getImageData(0, 0, targetSize, targetSize);
        const data = imgData.data; // RGBA array of length 224 * 224 * 4 = 200,704

        let sumR = 0;
        let sumG = 0;
        let sumB = 0;
        const pixelCount = targetSize * targetSize;
        const normalizedTensorData = new Float32Array(pixelCount * 3);

        // Preprocess pixel by pixel to MobileNetV2 format [-1.0, 1.0]
        let tensorIdx = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          sumR += r;
          sumG += g;
          sumB += b;

          // MobileNetV2 normalization: (x / 127.5) - 1.0
          normalizedTensorData[tensorIdx++] = r / 127.5 - 1.0;
          normalizedTensorData[tensorIdx++] = g / 127.5 - 1.0;
          normalizedTensorData[tensorIdx++] = b / 127.5 - 1.0;
        }

        const meanR = sumR / pixelCount;
        const meanG = sumG / pixelCount;
        const meanB = sumB / pixelCount;

        // Calculate standard deviations
        let varR = 0;
        let varG = 0;
        let varB = 0;
        for (let i = 0; i < data.length; i += 4) {
          varR += Math.pow(data[i] - meanR, 2);
          varG += Math.pow(data[i + 1] - meanG, 2);
          varB += Math.pow(data[i + 2] - meanB, 2);
        }
        const stdR = Math.sqrt(varR / pixelCount);
        const stdG = Math.sqrt(varG / pixelCount);
        const stdB = Math.sqrt(varB / pixelCount);

        // Excess Green Index (ExG): 2*G - R - B (standard vegetation index in remote sensing / agronomy)
        const greenIndex = 2 * meanG - meanR - meanB;

        // Sharpness / blur calculation using 3x3 Laplacian kernel on luminance
        let laplacianSum = 0;
        const kernel = [0, 1, 0, 1, -4, 1, 0, 1, 0];
        for (let y = 1; y < targetSize - 1; y += 4) {
          for (let x = 1; x < targetSize - 1; x += 4) {
            let conv = 0;
            let k = 0;
            for (let ky = -1; ky <= 1; ky++) {
              for (let kx = -1; kx <= 1; kx++) {
                const pIdx = ((y + ky) * targetSize + (x + kx)) * 4;
                const lum = 0.299 * data[pIdx] + 0.587 * data[pIdx + 1] + 0.114 * data[pIdx + 2];
                conv += lum * kernel[k++];
              }
            }
            laplacianSum += Math.abs(conv);
          }
        }
        const blurScore = Math.min(100, Math.round((laplacianSum / (55 * 55)) * 2));

        // Downsampled 8x8 slice of normalized values for UI tensor inspection
        const tensorSample: number[][] = [];
        const step = Math.floor(targetSize / 8);
        for (let r = 0; r < 8; r++) {
          const rowVals: number[] = [];
          for (let c = 0; c < 8; c++) {
            const idx = (r * step * targetSize + c * step) * 3;
            // take green channel normalized value rounded
            rowVals.push(Number(normalizedTensorData[idx + 1].toFixed(2)));
          }
          tensorSample.push(rowVals);
        }

        // Leaf Validation checks
        let isValidLeaf = true;
        let validationMessage: string | undefined;

        // Check if image is mostly pure white/black or non-vegetative
        if (meanR > 248 && meanG > 248 && meanB > 248) {
          isValidLeaf = false;
          validationMessage = 'Image appears to be blank white canvas with no leaf detected.';
        } else if (meanR < 10 && meanG < 10 && meanB < 10) {
          isValidLeaf = false;
          validationMessage = 'Image is too dark to extract leaf morphological features.';
        } else if (greenIndex < -45 && meanR > 180 && meanB > 180) {
          // Extremely unnatural high non-plant hues
          isValidLeaf = false;
          validationMessage = 'Low vegetation index detected. The uploaded image might not be a plant leaf.';
        } else if (blurScore < 5) {
          validationMessage = 'Image is significantly blurred. Accuracy may be reduced.';
        }

        const processedDataUrl = canvas.toDataURL('image/jpeg', 0.92);

        resolve({
          processedDataUrl,
          normalizedTensorData,
          metrics: {
            originalDimensions: { width: originalWidth, height: originalHeight },
            resizedDimensions: { width: 224, height: 224 },
            meanRGB: [Number(meanR.toFixed(1)), Number(meanG.toFixed(1)), Number(meanB.toFixed(1))],
            stdRGB: [Number(stdR.toFixed(1)), Number(stdG.toFixed(1)), Number(stdB.toFixed(1))],
            greenIndex: Number(greenIndex.toFixed(1)),
            blurScore,
            isValidLeaf,
            validationMessage,
            tensorSample,
          },
        });
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Image preprocessing failed.'));
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image. Please ensure the file is a valid JPG, JPEG, or PNG image.'));
    };

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(imageSource);
    }
  });
}
