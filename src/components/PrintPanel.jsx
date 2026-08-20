/** Khổ in thật theo mm, gợi ý DPI và các nút xuất file khổ in. */
import { clamp } from "../lib/color.js";
import { grid } from "../lib/geometry.js";
import { printPx, exportPrintPng, exportPrintSvg } from "../lib/exporters.js";
import { Group, SelectRow } from "./controls.jsx";

const DPI_OPTIONS = [
  { value: "72", label: "72 DPI, xem màn hình" },
  { value: "100", label: "100 DPI, bạt lớn nhìn xa" },
  { value: "150", label: "150 DPI, standee, poster" },
  { value: "200", label: "200 DPI, in gần" },
  { value: "300", label: "300 DPI, in offset" }
];

export default function PrintPanel({ cfg, update, toast }) {
  const px = printPx(cfg);
  const mmPerPx = cfg.printW / cfg.w;
  const pitch = grid(cfg).pitch;
  const ratioOff =
    Math.abs(cfg.w / cfg.h - cfg.printW / cfg.printH) / (cfg.printW / cfg.printH);

  const matchRatio = () => {
    const ratio = cfg.printW / cfg.printH;
    const long = 2000;
    update(ratio >= 1 ? { w: long, h: Math.round(long / ratio) } : { h: long, w: Math.round(long * ratio) });
    toast("Khung thiết kế đã khớp tỉ lệ khổ in");
  };

  return (
    <Group title="Khổ in thật">
      <div className="row">
        <label htmlFor="printW">Khổ (mm)</label>
        <input
          type="number"
          id="printW"
          min="10"
          max="10000"
          step="1"
          value={cfg.printW}
          onChange={(e) => update({ printW: clamp(Number(e.target.value) || 10, 10, 10000) })}
        />
        <input
          type="number"
          min="10"
          max="10000"
          step="1"
          value={cfg.printH}
          onChange={(e) => update({ printH: clamp(Number(e.target.value) || 10, 10, 10000) })}
        />
      </div>
      <SelectRow
        label="Mật độ in"
        value={String(cfg.dpi)}
        options={DPI_OPTIONS}
        onChange={(v) => update({ dpi: Number(v) })}
      />
      <p className="hint">
        Tương đương {px.w.toLocaleString("vi-VN")} x {px.h.toLocaleString("vi-VN")} px ở {cfg.dpi} DPI.
        <br />
        Trên bản in thật: chấm khoảng {(cfg.dotSize * mmPerPx).toFixed(1)} mm, bước lưới khoảng{" "}
        {(pitch * mmPerPx).toFixed(1)} mm
        {cfg.pad > 0 ? ", lề khoảng " + (cfg.pad * mmPerPx).toFixed(0) + " mm" : ""}.
        {ratioOff > 0.01 && (
          <>
            <br />
            <span style={{ color: "var(--accent)" }}>
              Khung thiết kế đang lệch tỉ lệ so với khổ in, hình sẽ bị méo. Bấm nút bên dưới để khớp lại.
            </span>
          </>
        )}
      </p>
      <div className="btn-grid" style={{ marginTop: 10 }}>
        <button className="full" onClick={matchRatio}>
          Đặt khung thiết kế theo tỉ lệ khổ in
        </button>
        <button onClick={() => exportPrintPng(cfg, toast)}>PNG khổ in</button>
        <button className="primary" onClick={() => exportPrintSvg(cfg, toast)}>
          SVG khổ in
        </button>
      </div>
      <p className="hint">
        SVG mang sẵn đơn vị mm nên nhà in mở ra là đúng khổ, không phụ thuộc số pixel. Đây là lựa chọn
        nên dùng cho standee.
      </p>
    </Group>
  );
}
