/**
 * Extract dominant color from image URL or fallback deterministically
 */
export async function getDominantColor(imageUrl: string | undefined, fallbackText: string): Promise<string> {
  if (!imageUrl) {
    return getFallbackColor(fallbackText);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(getFallbackColor(fallbackText));
          return;
        }
        canvas.width = 1;
        canvas.height = 1;
        ctx.drawImage(img, 0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        
        // Return rgb string
        resolve(`rgb(${r}, ${g}, ${b})`);
      } catch (e) {
        // CORS or other canvas extraction issue
        resolve(getFallbackColor(fallbackText));
      }
    };

    img.onerror = () => {
      resolve(getFallbackColor(fallbackText));
    };
  });
}

function getFallbackColor(text: string): string {
  // Deterministic color selection based on string hash
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  // High saturation and brightness for visual premium glow
  return `hsl(${hue}, 85%, 55%)`;
}
