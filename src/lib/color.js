/** Chuyển đổi và pha trộn màu dùng chung cho bộ dựng hình. */

export function hexToRgb(hex) {
  let h = String(hex).replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  if (Number.isNaN(n) || h.length !== 6) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

export function mix(a, b, t) {
  return { r: a.r + (b.r - a.r) * t, g: a.g + (b.g - a.g) * t, b: a.b + (b.b - a.b) * t };
}

export function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

/** Chuẩn hoá chuỗi người dùng gõ tay thành hex 6 ký tự, trả null nếu không hợp lệ. */
export function normalizeHex(input) {
  let v = String(input).trim();
  if (v && v[0] !== "#") v = "#" + v;
  if (!hexToRgb(v)) return null;
  if (v.length === 4) {
    return "#" + v.slice(1).split("").map((c) => c + c).join("");
  }
  return v.toLowerCase();
}
