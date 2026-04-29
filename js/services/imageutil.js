/**
 * Image compression utility.
 * Resizes images to fit within max dimensions and compresses as JPEG
 * to keep localStorage usage manageable.
 */
const ImageUtil = (() => {
  const MAX_WIDTH = 600;
  const MAX_HEIGHT = 840;
  const QUALITY = 0.7;

  /**
   * Takes a File or data URL and returns a compressed base64 data URL.
   */
  function compress(source) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        // Scale down proportionally
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', QUALITY));
      };
      img.onerror = reject;

      if (typeof source === 'string') {
        img.src = source;
      } else {
        const reader = new FileReader();
        reader.onload = (e) => { img.src = e.target.result; };
        reader.onerror = reject;
        reader.readAsDataURL(source);
      }
    });
  }

  return { compress };
})();
