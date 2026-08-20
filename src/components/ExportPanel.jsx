/** Xuất PNG, SVG và CSS lặp. */
import { exportPng, exportSvg, copyCss } from "../lib/exporters.js";
import { Group } from "./controls.jsx";

export default function ExportPanel({ cfg, toast }) {
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
