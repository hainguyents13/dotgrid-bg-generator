/** Xuất PNG, SVG, khổ in và sao chép CSS. */
import { drawTo, buildSvg, cssSnippet } from "./renderer.js";

const MAX_AREA = 240e6;
const MAX_DIM = 16000;

function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function printPx(c) {
  return {
    w: Math.round((c.printW / 25.4) * c.dpi),
    h: Math.round((c.printH / 25.4) * c.dpi)
  };
}

export function exportPng(c, scale, toast) {
  const off = document.createElement("canvas");
  drawTo(off, c, scale);
  const name = "bg-" + c.w + "x" + c.h + (scale > 1 ? "@" + scale + "x" : "") + ".png";
  off.toBlob((b) => {
    download(b, name);
    toast("Đã tải PNG");
  }, "image/png");
}

export function exportSvg(c, toast) {
  download(new Blob([buildSvg(c, c.w, c.h)], { type: "image/svg+xml" }), "bg-" + c.w + "x" + c.h + ".svg");
  toast("Đã tải SVG");
}

export function exportPrintSvg(c, toast) {
  const svg = buildSvg(c, c.printW + "mm", c.printH + "mm");
  download(new Blob([svg], { type: "image/svg+xml" }), "standee-" + c.printW + "x" + c.printH + "mm.svg");
  toast("Đã tải SVG khổ " + c.printW + " x " + c.printH + " mm");
}

/** PNG khổ in, tự hạ DPI khi vượt giới hạn canvas của trình duyệt. */
export function exportPrintPng(c, toast) {
  const px = printPx(c);
  let scale = px.w / c.w;
  const limit = Math.min(Math.sqrt(MAX_AREA / (c.w * c.h)), MAX_DIM / c.w, MAX_DIM / c.h);
  let used = c.dpi;
  if (scale > limit) {
    used = Math.floor((c.dpi * limit) / (px.w / c.w));
    scale = limit;
    toast("Vượt giới hạn trình duyệt, đã hạ xuống " + used + " DPI");
  }
  const off = document.createElement("canvas");
  drawTo(off, c, scale);
  off.toBlob((b) => {
    download(b, "standee-" + c.printW + "x" + c.printH + "mm-" + used + "dpi.png");
    if (used === c.dpi) toast("Đã tải PNG khổ in");
  }, "image/png");
}

export function copyCss(c, toast) {
  const css = cssSnippet(c);
  const fallback = () => {
    const ta = document.createElement("textarea");
    ta.value = css;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      toast("Đã sao chép CSS");
    } catch (e) {
      toast("Không sao chép được, bạn tải SVG nhé");
    }
    ta.remove();
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(css).then(() => toast("Đã sao chép CSS"), fallback);
  } else {
    fallback();
  }
}
