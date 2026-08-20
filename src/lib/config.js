/** Cấu hình mặc định và khuôn một lớp hình. */

export const DEFAULT_CONFIG = {
  /* "web" đo bằng pixel, "print" suy khung thiết kế từ khổ mm và DPI. */
  sizeMode: "web",
  w: 1080,
  h: 1080,
  /* Kích thước pixel người dùng đặt ở kiểu Web, giữ lại để quay về sau khi sang kiểu In. */
  webW: 1080,
  webH: 1080,
  bg: "#0d0d0d",
  dot: "#1f1f1f",
  dotSize: 4,
  gap: 7,
  radius: 0,
  opacity: 100,
  pad: 0,
  frameRadius: 0,
  clipOutside: false,
  /* Hạt giống cho nhiễu viền của từng lớp hình. */
  seed: 7,
  printW: 600,
  printH: 1600,
  dpi: 150,
  layers: []
};

let uid = 0;

export function nextId() {
  uid += 1;
  return "L" + Date.now().toString(36) + uid;
}

export function makeLayer(name, src) {
  return {
    id: nextId(),
    name,
    src,
    visible: true,
    color: "#e8322d",
    tint: 100,
    bright: 100,
    fit: "contain",
    scale: 80,
    x: 0,
    y: 0,
    source: "alpha",
    invert: false,
    threshold: 30,
    soft: 25,
    noise: 40
  };
}
