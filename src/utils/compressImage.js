/**
 * compressImage – resizes and re-encodes a File object using the browser
 * Canvas API before it is uploaded to ImgBB.  This cuts upload time and
 * bandwidth dramatically (a 5 MB phone photo typically shrinks to ~200 KB).
 *
 * @param {File}   file         – the original File from an <input type="file">
 * @param {number} maxWidth     – maximum width in pixels (default 1200)
 * @param {number} quality      – JPEG quality, 0–1 (default 0.82)
 * @returns {Promise<Blob>}     – a compressed Blob ready to append to FormData
 */
export async function compressImage(file, maxWidth = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        // Calculate the new dimensions while keeping the aspect ratio.
        const scale = Math.min(1, maxWidth / img.width);
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas failed to produce a Blob'));
              return;
            }
            resolve(blob);
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to decode image'));
      img.src = event.target.result;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
