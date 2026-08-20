/** Đọc file người dùng thả vào và tạo lớp hình tương ứng. */
import { makeLayer } from "./config.js";

function isSvgFile(file) {
  return file.type === "image/svg+xml" || /\.svg$/i.test(file.name);
}

/** SVG thiếu width/height sẽ không vẽ được lên canvas, nên lấy kích thước từ viewBox. */
function ensureSvgSize(text) {
  try {
    const doc = new DOMParser().parseFromString(text, "image/svg+xml");
    const svg = doc.documentElement;
    if (!svg || svg.nodeName.toLowerCase() !== "svg") return text;
    const wAttr = svg.getAttribute("width");
    const hAttr = svg.getAttribute("height");
    const vb = svg.getAttribute("viewBox");
    const needW = !wAttr || wAttr.indexOf("%") >= 0;
    const needH = !hAttr || hAttr.indexOf("%") >= 0;
    if ((needW || needH) && vb) {
      const p = vb.trim().split(/[\s,]+/).map(Number);
      if (p.length === 4 && p[2] > 0 && p[3] > 0) {
        svg.setAttribute("width", p[2]);
        svg.setAttribute("height", p[3]);
      }
    }
    return new XMLSerializer().serializeToString(svg);
  } catch (e) {
    return text;
  }
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      let src = reader.result;
      if (isSvgFile(file)) {
        src =
          "data:image/svg+xml;charset=utf-8," +
          encodeURIComponent(ensureSvgSize(String(src))).replace(/'/g, "%27");
      }
      resolve(makeLayer(file.name.replace(/\.[^.]+$/, ""), src));
    };
    reader.onerror = () => reject(new Error(file.name));
    if (isSvgFile(file)) reader.readAsText(file);
    else reader.readAsDataURL(file);
  });
}

/** Trả về danh sách lớp đọc được và tên các file lỗi. */
export async function layersFromFiles(fileList) {
  const files = Array.from(fileList || []).filter(
    (f) => /^image\//.test(f.type) || /\.svg$/i.test(f.name)
  );
  const layers = [];
  const failed = [];
  await Promise.all(
    files.map((file) =>
      readFile(file).then(
        (layer) => layers.push(layer),
        () => failed.push(file.name)
      )
    )
  );
  return { layers, failed };
}
