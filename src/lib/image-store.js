/** Kho ảnh đã nạp và cache mặt nạ lưới, tra theo id lớp. Không thuộc state React. */
import { grid, fitRect } from "./geometry.js";

const images = new Map();
const masks = new Map();

export function getImage(id) {
  return images.get(id);
}

export function hasImage(id) {
  return images.has(id);
}

export function dropImage(id) {
  images.delete(id);
  masks.delete(id);
}

/** Nạp ảnh cho một lớp, trả về true nếu đọc được. */
export function attachImage(layer) {
  return new Promise((resolve) => {
    const im = new Image();
    im.onload = () => {
      images.set(layer.id, im);
      masks.delete(layer.id);
      resolve(true);
    };
    im.onerror = () => resolve(false);
    im.src = layer.src;
  });
}

/**
 * Vẽ ảnh lớp xuống đúng độ phân giải lưới để lấy mức phủ từng chấm.
 * Cache tự hết hạn khi khoá đổi nên không cần xoá thủ công.
 */
export function buildMask(c, layer) {
  const im = images.get(layer.id);
  if (!im) return null;

  const key = [c.w, c.h, c.dotSize, c.gap, c.pad, layer.fit, layer.scale, layer.x, layer.y].join("|");
  const cached = masks.get(layer.id);
  if (cached && cached.key === key) return cached.data;

  const g = grid(c);
  const iw = im.naturalWidth || im.width || 1;
  const ih = im.naturalHeight || im.height || 1;
  const r = fitRect(c, layer, iw, ih);

  const cv = document.createElement("canvas");
  cv.width = g.cols;
  cv.height = g.rows;
  const mx = cv.getContext("2d", { willReadFrequently: true });
  mx.imageSmoothingEnabled = true;
  mx.imageSmoothingQuality = "high";
  try {
    mx.drawImage(
      im,
      (r.dx - g.offX) / g.pitch,
      (r.dy - g.offY) / g.pitch,
      r.dw / g.pitch,
      r.dh / g.pitch
    );
    const data = mx.getImageData(0, 0, g.cols, g.rows);
    masks.set(layer.id, { key, data });
    return data;
  } catch (e) {
    return null;
  }
}
