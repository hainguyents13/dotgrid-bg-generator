/** Dựng lớp chữ: vẽ nội dung ra canvas rồi dùng canvas đó làm nguồn cho mặt nạ lưới. */
import { LAYER_DEFAULTS, nextId } from "./config.js";
import { loadFont, DEFAULT_FONT } from "./google-fonts.js";

/** Cỡ chữ khi dựng canvas nguồn, đủ lớn để mặt nạ lưới không bị răng cưa. */
const RENDER_SIZE = 320;
const LINE_HEIGHT = 1.15;
const PAD = 16;

export function makeTextLayer() {
  return {
    ...LAYER_DEFAULTS,
    id: nextId(),
    kind: "text",
    name: "TEXT",
    text: "TEXT",
    font: DEFAULT_FONT.family,
    weight: DEFAULT_FONT.weights[DEFAULT_FONT.weights.length - 1],
    align: "center",
    /* Bật thì chữ được vẽ nguyên nét thay vì rã thành chấm. */
    solid: false,
    /* Chữ vẽ ra đã là khối đặc nên lấy luôn màu của lớp. */
    tint: 0
  };
}

export function isTextLayer(layer) {
  return layer?.kind === "text";
}

/** Lớp chữ vẽ nguyên nét, không tham gia lưới chấm. */
export function isSolidText(layer) {
  return isTextLayer(layer) && !!layer.solid;
}

/** Vẽ chữ trắng trên nền trong suốt, canvas ôm sát nội dung kể cả phần dấu. */
export async function renderTextCanvas(layer) {
  const weight = layer.weight || 400;
  await loadFont(layer.font, weight, RENDER_SIZE);

  const font = weight + " " + RENDER_SIZE + 'px "' + layer.font + '", sans-serif';
  const lines = String(layer.text || " ").split("\n");
  const lineH = RENDER_SIZE * LINE_HEIGHT;

  const measure = document.createElement("canvas").getContext("2d");
  measure.font = font;
  const metrics = lines.map((line) => measure.measureText(line));

  /* Đo theo hộp bao thật để dấu tiếng Việt và phần đuôi chữ không bị cắt. */
  const width = Math.max(
    1,
    ...metrics.map((m) => Math.max(m.width, (m.actualBoundingBoxLeft || 0) + (m.actualBoundingBoxRight || 0)))
  );
  const ascent = Math.max(...metrics.map((m) => m.actualBoundingBoxAscent || 0), RENDER_SIZE * 0.8);
  const descent = Math.max(...metrics.map((m) => m.actualBoundingBoxDescent || 0), RENDER_SIZE * 0.2);

  const cv = document.createElement("canvas");
  cv.width = Math.ceil(width) + PAD * 2;
  cv.height = Math.ceil(ascent + (lines.length - 1) * lineH + descent) + PAD * 2;

  const g = cv.getContext("2d");
  g.font = font;
  g.fillStyle = "#ffffff";
  g.textAlign = "left";
  g.textBaseline = "alphabetic";

  /* Canh từng dòng bên trong khối chữ, không canh theo mép canvas. */
  const align = layer.align || "center";
  lines.forEach((line, i) => {
    const slack = width - metrics[i].width;
    const offset = align === "left" ? 0 : align === "right" ? slack : slack / 2;
    g.fillText(line, PAD + offset, PAD + ascent + i * lineH);
  });
  return cv;
}

/** Dấu vân của mọi lớp chữ, dùng để biết khi nào phải dựng lại canvas. */
export function textSignature(layers) {
  return layers
    .filter(isTextLayer)
    .map((L) => [L.id, L.text, L.font, L.weight, L.align].join("~"))
    .join("|");
}
