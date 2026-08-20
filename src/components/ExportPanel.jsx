/** Xuất file theo kiểu khổ trang đang chọn. */
import { exportPng, exportSvg, copyCss, exportPrintPng, exportPrintSvg } from "../lib/exporters.js";
import { Group } from "./controls.jsx";

export default function ExportPanel({ cfg, toast }) {
  if (cfg.sizeMode === "print") {
    return (
      <Group title="Xuất file">
        <div className="btn-grid">
          <button className="primary full" onClick={() => exportPrintSvg(cfg, toast)}>
            SVG khổ in
          </button>
          <button className="full" onClick={() => exportPrintPng(cfg, toast)}>
            PNG khổ in
          </button>
          <button className="full" onClick={() => exportSvg(cfg, toast)}>
            SVG theo pixel
          </button>
        </div>
        <p className="hint">
          SVG khổ in mang sẵn đơn vị mm nên nhà in mở ra là đúng khổ, không phụ thuộc số pixel. Đây là
          lựa chọn nên dùng cho standee.
        </p>
      </Group>
    );
  }

  return (
    <Group title="Xuất file">
      <div className="btn-grid">
        <button className="primary full" onClick={() => exportPng(cfg, 1, toast)}>
          Tải PNG
        </button>
        <button onClick={() => exportPng(cfg, 2, toast)}>PNG @2x</button>
        <button onClick={() => exportSvg(cfg, toast)}>Tải SVG</button>
        <button className="full" onClick={() => copyCss(cfg, toast)}>
          Sao chép CSS lặp vô hạn
        </button>
      </div>
      <p className="hint">
        CSS lặp chỉ gồm nền và chấm đều, không kèm hình hay vệt sáng. Muốn giữ hình thì bạn xuất PNG
        hoặc SVG nhé.
      </p>
    </Group>
  );
}
