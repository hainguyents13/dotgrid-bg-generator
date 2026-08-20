/** Nhân dựng hình: duyệt từng chấm, vẽ ra canvas và sinh SVG hoặc CSS. */
import { hexToRgb, rgbToHex, mix, clamp } from "./color.js";
import { grid, innerBox, frameR, pointInFrame, framePath, fitRect, rand } from "./geometry.js";
import { buildMask, getImage, getTinted } from "./image-store.js";
import { isSolidText } from "./text-layer.js";

/**
 * Duyệt mọi chấm trong lưới và gọi cb với toạ độ cùng màu cuối cùng.
 * `angles` là góc xoay tạm của từng lớp, chỉ khung xem trước truyền vào.
 */
export function eachDot(c, cb, angles = null) {
  const g = grid(c);
  const box = innerBox(c);
  const fr = frameR(c);
  const bg = hexToRgb(c.bg) || { r: 13, g: 13, b: 13 };
  const dot = hexToRgb(c.dot) || { r: 31, g: 31, b: 31 };
  const base = mix(bg, dot, c.opacity / 100);

  const active = [];
  c.layers.forEach((L, k) => {
    if (!L.visible || isSolidText(L)) return;
    const data = buildMask(c, L, angles ? angles[L.id] || 0 : 0);
    if (!data) return;
    active.push({
      L,
      data: data.data,
      col: hexToRgb(L.color) || { r: 232, g: 50, b: 45 },
      thr: L.threshold / 100,
      soft: L.soft / 100 + 0.001,
      gain: L.bright / 100,
      salt: (k + 1) * 977
    });
  });

  for (let j = 0; j < g.rows; j++) {
    for (let i = 0; i < g.cols; i++) {
      const x = g.offX + i * g.pitch;
      const y = g.offY + j * g.pitch;
      if (fr > 0) {
        const s = c.dotSize;
        if (
          !pointInFrame(x, y, box, fr) ||
          !pointInFrame(x + s, y, box, fr) ||
          !pointInFrame(x, y + s, box, fr) ||
          !pointInFrame(x + s, y + s, box, fr)
        ) {
          continue;
        }
      }

      let col = base;

      const p = (j * g.cols + i) * 4;
      for (let a = 0; a < active.length; a++) {
        const it = active[a];
        const d = it.data;
        const cov = d[p + 3] / 255;
        let m = clamp((cov - it.thr) / it.soft, 0, 1);
        if (m > 0 && m < 1 && it.L.noise > 0) {
          const nn = (rand(i + it.salt, j + it.salt, c.seed) - 0.5) * (it.L.noise / 100) * 1.4;
          m = clamp(m + nn, 0, 1);
        }
        if (m > 0) {
          let target = it.col;
          if (it.L.tint > 0) {
            const src = {
              r: clamp(d[p] * it.gain, 0, 255),
              g: clamp(d[p + 1] * it.gain, 0, 255),
              b: clamp(d[p + 2] * it.gain, 0, 255)
            };
            target = it.L.tint >= 100 ? src : mix(it.col, src, it.L.tint / 100);
          }
          col = mix(col, mix(bg, target, c.opacity / 100), m);
        }
      }

      cb(x, y, rgbToHex(col.r, col.g, col.b));
    }
  }
}

/** Duyệt các lớp chữ vẽ nguyên nét cùng khung đặt của chúng. */
function eachSolid(c, cb) {
  c.layers.forEach((L) => {
    if (!L.visible || !isSolidText(L)) return;
    const im = getImage(L.id);
    if (!im) return;
    const iw = im.naturalWidth || im.width || 1;
    const ih = im.naturalHeight || im.height || 1;
    cb(L, fitRect(c, L, iw, ih));
  });
}

/** Vẽ chữ nguyên nét đè lên lưới chấm, đã tô sẵn màu của lớp. */
function drawSolid(g2, c, angles) {
  eachSolid(c, (L, r) => {
    const art = getTinted(L.id, L.color);
    if (!art) return;
    const angle = angles ? angles[L.id] || 0 : 0;
    g2.save();
    if (c.clipOutside) {
      framePath(g2, innerBox(c), frameR(c));
      g2.clip();
    }
    if (angle) {
      g2.translate(r.dx + r.dw / 2, r.dy + r.dh / 2);
      g2.rotate((angle * Math.PI) / 180);
      g2.drawImage(art, -r.dw / 2, -r.dh / 2, r.dw, r.dh);
    } else {
      g2.drawImage(art, r.dx, r.dy, r.dw, r.dh);
    }
    g2.restore();
  });
}

/** Vẽ toàn bộ background lên một canvas bất kỳ ở tỉ lệ cho trước. */
export function drawTo(target, c, scale, angles = null) {
  const g2 = target.getContext("2d");
  target.width = Math.round(c.w * scale);
  target.height = Math.round(c.h * scale);
  g2.setTransform(scale, 0, 0, scale, 0, 0);
  g2.fillStyle = c.bg;
  if (c.clipOutside) {
    framePath(g2, innerBox(c), frameR(c));
    g2.fill();
  } else {
    g2.fillRect(0, 0, c.w, c.h);
  }
  const r = (c.radius / 100) * c.dotSize;
  eachDot(c, (x, y, color) => {
    g2.fillStyle = color;
    if (r > 0.2 && g2.roundRect) {
      g2.beginPath();
      g2.roundRect(x, y, c.dotSize, c.dotSize, r);
      g2.fill();
    } else {
      g2.fillRect(x, y, c.dotSize, c.dotSize);
    }
  }, angles);
  drawSolid(g2, c, angles);
  g2.setTransform(1, 0, 0, 1, 0, 0);
}

/** Sinh SVG với kích thước khai báo tự do, gộp chấm cùng màu vào một group. */
export function buildSvg(c, widthAttr, heightAttr) {
  const r = (c.radius / 100) * c.dotSize;
  const groups = {};
  eachDot(c, (x, y, color) => {
    if (!groups[color]) groups[color] = [];
    groups[color].push('<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '"/>');
  });
  let body = "";
  Object.keys(groups).forEach((color) => {
    body += '<g fill="' + color + '">' + groups[color].join("") + "</g>";
  });
  const box = innerBox(c);
  const fr = frameR(c);
  const bgRect = c.clipOutside
    ? '<rect x="' + box.x + '" y="' + box.y + '" width="' + box.w + '" height="' + box.h + '"' +
      (fr > 0 ? ' rx="' + fr + '"' : "") + ' fill="' + c.bg + '"/>'
    : '<rect width="100%" height="100%" fill="' + c.bg + '"/>';
  let overlay = "";
  eachSolid(c, (L, rect) => {
    const art = getTinted(L.id, L.color);
    if (!art) return;
    overlay +=
      '<image href="' + art.toDataURL("image/png") +
      '" x="' + rect.dx.toFixed(1) + '" y="' + rect.dy.toFixed(1) +
      '" width="' + rect.dw.toFixed(1) + '" height="' + rect.dh.toFixed(1) +
      '" preserveAspectRatio="none"/>';
  });
  if (overlay && c.clipOutside) {
    overlay =
      '<clipPath id="frame"><rect x="' + box.x + '" y="' + box.y + '" width="' + box.w +
      '" height="' + box.h + '"' + (fr > 0 ? ' rx="' + fr + '"' : "") + "/></clipPath>" +
      '<g clip-path="url(#frame)">' + overlay + "</g>";
  }

  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + widthAttr + '" height="' + heightAttr +
    '" viewBox="0 0 ' + c.w + " " + c.h + '">' + bgRect +
    '<g shape-rendering="crispEdges">' +
    "<style>rect{width:" + c.dotSize + "px;height:" + c.dotSize + "px" +
    (r > 0.2 ? ";rx:" + r.toFixed(2) + "px" : "") + "}</style>" +
    body + "</g>" + overlay + "</svg>"
  );
}

/** CSS lặp vô hạn, chỉ gồm nền và lưới chấm đều. */
export function cssSnippet(c) {
  const pitch = c.dotSize + c.gap;
  const r = (c.radius / 100) * c.dotSize;
  const bg = hexToRgb(c.bg);
  const dot = hexToRgb(c.dot);
  const col = rgbToHex(
    bg.r + ((dot.r - bg.r) * c.opacity) / 100,
    bg.g + ((dot.g - bg.g) * c.opacity) / 100,
    bg.b + ((dot.b - bg.b) * c.opacity) / 100
  );
  const tile =
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + pitch + '" height="' + pitch + '">' +
    '<rect width="' + c.dotSize + '" height="' + c.dotSize + '"' +
    (r > 0.2 ? ' rx="' + r.toFixed(2) + '"' : "") + ' fill="' + col + '"/></svg>';
  return (
    ".dotted-bg {\n" +
    "  background-color: " + c.bg + ";\n" +
    '  background-image: url("data:image/svg+xml,' +
    encodeURIComponent(tile).replace(/'/g, "%27") + '");\n' +
    "  background-size: " + pitch + "px " + pitch + "px;\n" +
    "}"
  );
}
