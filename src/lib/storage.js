/** Lưu cấu hình vào localStorage, bỏ phần lớp hình khi dữ liệu quá lớn. */

const KEY = "dotbg:last";
const MAX_CHARS = 3500000;

export function saveConfig(cfg) {
  try {
    const full = JSON.stringify(cfg);
    localStorage.setItem(KEY, full.length > MAX_CHARS ? JSON.stringify({ ...cfg, layers: [] }) : full);
  } catch (e) {
    /* hết dung lượng thì bỏ qua */
  }
}

export function loadConfig() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!Array.isArray(saved.layers)) saved.layers = [];
    return saved;
  } catch (e) {
    return null;
  }
}
