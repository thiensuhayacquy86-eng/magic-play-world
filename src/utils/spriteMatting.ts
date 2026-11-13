export interface ProcessedSprite {
  canvas: HTMLCanvasElement;
  dataUrl: string;
  width: number;
  height: number;
}

const spriteCache = new Map<string, ProcessedSprite>();
const pendingCache = new Map<string, Promise<ProcessedSprite | null>>();

function isNearWhite(r: number, g: number, b: number): boolean {
  const minC = Math.min(r, g, b);
  const maxC = Math.max(r, g, b);
  return minC > 224 && maxC - minC < 26;
}

function isSoftEdgeWhite(r: number, g: number, b: number): boolean {
  const minC = Math.min(r, g, b);
  const maxC = Math.max(r, g, b);
  return minC > 202 && maxC - minC < 32;
}

/**
 * Loads a studio white-background 3D render and strips connected exterior
 * white pixels using a border BFS flood-fill + anti-aliased edge feathering.
 * Optionally also clears enclosed pure-white arch holes (useful for basket handles).
 */
export function loadTransparentSprite(
  src: string,
  options: { clearEnclosedWhiteHoles?: boolean } = {}
): Promise<ProcessedSprite | null> {
  const cacheKey = `${src}|${options.clearEnclosedWhiteHoles ? 'holes' : 'edge'}`;
  const cached = spriteCache.get(cacheKey);
  if (cached) return Promise.resolve(cached);

  const pending = pendingCache.get(cacheKey);
  if (pending) return pending;

  const promise = new Promise<ProcessedSprite | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';

    img.onload = () => {
      try {
        // Scale down to crisp sprite working size (max 420px) for fast matting & rendering
        const maxDim = 420;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(null);
          return;
        }

        ctx.drawImage(img, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        const visited = new Uint8Array(w * h);
        const queue = new Int32Array(w * h);
        let head = 0;
        let tail = 0;

        const enqueueIfWhite = (x: number, y: number) => {
          if (x < 0 || x >= w || y < 0 || y >= h) return;
          const idx = y * w + x;
          if (visited[idx]) return;
          const p = idx * 4;
          if (isNearWhite(data[p], data[p + 1], data[p + 2])) {
            visited[idx] = 1;
            queue[tail++] = idx;
          }
        };

        // Seed all 4 borders
        for (let x = 0; x < w; x++) {
          enqueueIfWhite(x, 0);
          enqueueIfWhite(x, h - 1);
        }
        for (let y = 0; y < h; y++) {
          enqueueIfWhite(0, y);
          enqueueIfWhite(w - 1, y);
        }

        // For basket handle arch: seed pure bright white spots in upper 48% where the handle loop sits
        if (options.clearEnclosedWhiteHoles) {
          const maxArchY = Math.floor(h * 0.48);
          for (let y = Math.floor(h * 0.14); y < maxArchY; y += 4) {
            for (let x = Math.floor(w * 0.25); x < Math.floor(w * 0.75); x += 4) {
              const idx = y * w + x;
              const p = idx * 4;
              if (data[p] > 242 && data[p + 1] > 242 && data[p + 2] > 242) {
                enqueueIfWhite(x, y);
              }
            }
          }
        }

        while (head < tail) {
          const idx = queue[head++];
          const p = idx * 4;
          data[p + 3] = 0; // Transparent

          const x = idx % w;
          const y = (idx - x) / w;
          enqueueIfWhite(x + 1, y);
          enqueueIfWhite(x - 1, y);
          enqueueIfWhite(x, y + 1);
          enqueueIfWhite(x, y - 1);
        }

        // Gentle 1-pixel edge feather pass to remove white fringe halo
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const idx = y * w + x;
            if (visited[idx]) continue;
            const p = idx * 4;
            const hasTransparentNeighbor =
              visited[idx - 1] ||
              visited[idx + 1] ||
              visited[idx - w] ||
              visited[idx + w];
            if (hasTransparentNeighbor && isSoftEdgeWhite(data[p], data[p + 1], data[p + 2])) {
              const lum = (data[p] + data[p + 1] + data[p + 2]) / 3;
              const fade = Math.max(0, Math.min(1, (242 - lum) / 42));
              data[p + 3] = Math.round(data[p + 3] * fade);
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);

        // Trim transparent margins tightly so collision/sizing math is exact
        let minX = w;
        let minY = h;
        let maxX = 0;
        let maxY = 0;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            if (data[(y * w + x) * 4 + 3] > 20) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        const trimW = Math.max(1, maxX - minX + 1);
        const trimH = Math.max(1, maxY - minY + 1);
        const trimmed = document.createElement('canvas');
        trimmed.width = trimW;
        trimmed.height = trimH;
        const tCtx = trimmed.getContext('2d');
        if (tCtx) {
          tCtx.drawImage(canvas, minX, minY, trimW, trimH, 0, 0, trimW, trimH);
        }

        const result: ProcessedSprite = {
          canvas: trimmed,
          dataUrl: trimmed.toDataURL('image/png'),
          width: trimW,
          height: trimH,
        };
        spriteCache.set(cacheKey, result);
        resolve(result);
      } catch {
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);
    img.src = src;
  });

  pendingCache.set(cacheKey, promise);
  return promise;
}
