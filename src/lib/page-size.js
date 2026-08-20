/** Quy đổi giữa khổ in thật (mm + DPI) và khung thiết kế tính bằng pixel. */

/** Khung xem trước không vượt cạnh này để lưới chấm còn vẽ kịp mỗi lần chỉnh. */
export const MAX_DESIGN_EDGE = 2400;

export function mmToPx(mm, dpi) {
  return Math.round((mm / 25.4) * dpi);
}

export function printPx(c) {
  return { w: mmToPx(c.printW, c.dpi), h: mmToPx(c.printH, c.dpi) };
}

/**
 * Khung thiết kế cho khổ in: đúng tỉ lệ mm, thu nhỏ khi số pixel thật quá lớn.
 * Bản xuất vẫn dùng số đo mm và DPI thật nên không mất độ nét.
 */
export function designSizeForPrint(printW, printH, dpi) {
  const w = (printW / 25.4) * dpi;
  const h = (printH / 25.4) * dpi;
  const k = Math.min(1, MAX_DESIGN_EDGE / Math.max(w, h));
  return { w: Math.max(16, Math.round(w * k)), h: Math.max(16, Math.round(h * k)) };
}
