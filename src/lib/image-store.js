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
 * Khung đang xoay thì dựng lại mỗi lần và không đụng tới cache của trạng thái tĩnh.
 */
export function buildMask(c, layer, angle = 0) {
  const im = images.get(layer.id);
  if (!im) return null;

  const key = [c.w, c.h, c.dotSize, c.gap, c.pad, layer.scale, layer.x, layer.y].join("|");
  const cached = masks.get(layer.id);
  if (!angle && cached && cached.key === key) return cached.data;

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
  const gx = (r.dx - g.offX) / g.pitch;
  const gy = (r.dy - g.offY) / g.pitch;
  const gw = r.dw / g.pitch;
  const gh = r.dh / g.pitch;

  try {
    if (angle) {
      mx.translate(gx + gw / 2, gy + gh / 2);
      mx.rotate((angle * Math.PI) / 180);
      mx.drawImage(im, -gw / 2, -gh / 2, gw, gh);
      mx.setTransform(1, 0, 0, 1, 0, 0);
    } else {
      mx.drawImage(im, gx, gy, gw, gh);
    }
    const data = mx.getImageData(0, 0, g.cols, g.rows);
    if (!angle) masks.set(layer.id, { key, data });
    return data;
  } catch (e) {
    return null;
  }
}
