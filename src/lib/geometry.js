/** Tính khung, lưới chấm và đường vệt sáng từ cấu hình. */
import { clamp } from "./color.js";

export function rand(x, y, seed) {
  const s = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

export function innerBox(c) {
  let p = Math.min(c.pad, Math.floor(Math.min(c.w, c.h) / 2) - 1);
  p = Math.max(0, p);
  return { x: p, y: p, w: Math.max(1, c.w - 2 * p), h: Math.max(1, c.h - 2 * p) };
}

export function frameR(c) {
  const b = innerBox(c);
  return clamp(c.frameRadius, 0, Math.min(b.w, b.h) / 2);
}

export function pointInFrame(px, py, b, r) {
  if (px < b.x || py < b.y || px > b.x + b.w || py > b.y + b.h) return false;
  if (r <= 0) return true;
  const cx = px < b.x + r ? b.x + r : px > b.x + b.w - r ? b.x + b.w - r : px;
  const cy = py < b.y + r ? b.y + r : py > b.y + b.h - r ? b.y + b.h - r : py;
  if (cx === px || cy === py) return true;
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= r * r;
}

export function framePath(g2, b, r) {
  g2.beginPath();
  if (g2.roundRect) g2.roundRect(b.x, b.y, b.w, b.h, r);
  else g2.rect(b.x, b.y, b.w, b.h);
}

export function grid(c) {
  const pitch = c.dotSize + c.gap;
  const b = innerBox(c);
  const cols = Math.max(1, Math.floor((b.w + c.gap) / pitch));
  const rows = Math.max(1, Math.floor((b.h + c.gap) / pitch));
  return {
    pitch,
    cols,
    rows,
    offX: b.x + (b.w - (cols * pitch - c.gap)) / 2,
    offY: b.y + (b.h - (rows * pitch - c.gap)) / 2
  };
}

/** Vị trí ảnh của một lớp bên trong khung, theo kiểu đặt và mức phóng to. */
export function fitRect(c, layer, iw, ih) {
  const b = innerBox(c);
  const s = layer.scale / 100;
  let dw;
  let dh;
  if (layer.fit === "cover") {
    const k = Math.max(b.w / iw, b.h / ih);
    dw = iw * k;
    dh = ih * k;
  } else if (layer.fit === "stretch") {
    dw = b.w;
    dh = b.h;
  } else {
    const k = Math.min(b.w / iw, b.h / ih);
    dw = iw * k;
    dh = ih * k;
  }
  dw *= s;
  dh *= s;
  return {
    dx: b.x + (b.w - dw) / 2 + (layer.x / 100) * b.w,
    dy: b.y + (b.h - dh) / 2 + (layer.y / 100) * b.h,
    dw,
    dh
  };
}

export function waveYAt(x, c) {
  const base = c.h * (1 - c.waveHeight / 100);
  const amp = (c.waveAmp / 100) * c.h * 0.5;
  const s = c.seed;
  const f1 = ((0.9 + rand(1, 1, s) * 1.4) * Math.PI * 2) / c.w;
  const f2 = ((2.2 + rand(2, 2, s) * 2.6) * Math.PI * 2) / c.w;
  const f3 = ((4.5 + rand(3, 3, s) * 3.0) * Math.PI * 2) / c.w;
  const p1 = rand(4, 4, s) * 10;
  const p2 = rand(5, 5, s) * 10;
  const p3 = rand(6, 6, s) * 10;
  const v =
    Math.sin(x * f1 + p1) * 0.55 + Math.sin(x * f2 + p2) * 0.3 + Math.sin(x * f3 + p3) * 0.15;
  return base - v * amp;
}
