/** Khổ trang: chọn kiểu Web (pixel) hoặc In (mm + DPI), kích thước đổi theo kiểu. */
import { clamp } from "../lib/color.js";
import { grid } from "../lib/geometry.js";
import { printPx, designSizeForPrint } from "../lib/page-size.js";
import { Group, SelectRow } from "./controls.jsx";

const WEB_PRESETS = [
  { value: "1080x1080", label: "Vuông 1080 x 1080" },
  { value: "1920x1080", label: "Ngang 1920 x 1080" },
  { value: "1200x630", label: "OG image 1200 x 630" },
  { value: "1080x1350", label: "Dọc 1080 x 1350" },
  { value: "1080x1920", label: "Story 1080 x 1920" },
  { value: "custom", label: "Tuỳ chỉnh" }
];

const PRINT_PRESETS = [
  { value: "600x1600", label: "Standee 600 x 1600" },
  { value: "800x2000", label: "Standee 800 x 2000" },
  { value: "210x297", label: "A4 210 x 297" },
  { value: "297x420", label: "A3 297 x 420" },
  { value: "1000x2000", label: "Backdrop 1000 x 2000" },
  { value: "custom", label: "Tuỳ chỉnh" }
];

const DPI_OPTIONS = [
  { value: "72", label: "72 DPI, xem màn hình" },
  { value: "100", label: "100 DPI, bạt lớn nhìn xa" },
  { value: "150", label: "150 DPI, standee, poster" },
  { value: "200", label: "200 DPI, in gần" },
  { value: "300", label: "300 DPI, in offset" }
];

function presetValue(options, key) {
  return options.some((p) => p.value === key) ? key : "custom";
}

export default function PageSizePanel({ cfg, update, setMode }) {
  const isPrint = cfg.sizeMode === "print";
  const px = printPx(cfg);
  const mmPerPx = cfg.printW / cfg.w;
  const pitch = grid(cfg).pitch;
  const scaledDown = px.w > cfg.w;

  /* Ở kiểu in, khung thiết kế luôn suy ra từ số đo mm nên không cần nút khớp tỉ lệ. */
  const updatePrint = (patch) => {
    const next = { ...cfg, ...patch };
    update({ ...patch, ...designSizeForPrint(next.printW, next.printH, next.dpi) });
  };

  return (
    <Group
      title="Khổ trang"
      extra={
        <span className="seg">
          <button
            type="button"
            className={isPrint ? "" : "on"}
            onClick={() => setMode("web")}
          >
            Web
          </button>
          <button
            type="button"
            className={isPrint ? "on" : ""}
            onClick={() => setMode("print")}
          >
            In
          </button>
        </span>
      }
    >
      {isPrint ? (
        <>
          <SelectRow
            label="Khổ in"
            value={presetValue(PRINT_PRESETS, cfg.printW + "x" + cfg.printH)}
            options={PRINT_PRESETS}
            onChange={(v) => {
              if (v === "custom") return;
              const [printW, printH] = v.split("x").map(Number);
              updatePrint({ printW, printH });
            }}
          />
          <div className="row">
            <label htmlFor="printW">Khổ (mm)</label>
            <input
              type="number"
              id="printW"
              min="10"
              max="10000"
              step="1"
              value={cfg.printW}
              onChange={(e) => updatePrint({ printW: clamp(Number(e.target.value) || 10, 10, 10000) })}
            />
            <input
              type="number"
              min="10"
              max="10000"
              step="1"
              value={cfg.printH}
              onChange={(e) => updatePrint({ printH: clamp(Number(e.target.value) || 10, 10, 10000) })}
            />
          </div>
          <SelectRow
            label="Mật độ in"
            value={String(cfg.dpi)}
            options={DPI_OPTIONS}
            onChange={(v) => updatePrint({ dpi: Number(v) })}
          />
          <p className="hint">
            Bản in {px.w.toLocaleString("vi-VN")} x {px.h.toLocaleString("vi-VN")} px ở {cfg.dpi} DPI.
            Chấm khoảng {(cfg.dotSize * mmPerPx).toFixed(1)} mm, bước lưới khoảng{" "}
            {(pitch * mmPerPx).toFixed(1)} mm
            {cfg.pad > 0 ? ", lề khoảng " + (cfg.pad * mmPerPx).toFixed(0) + " mm" : ""}.
            {scaledDown && (
              <>
                <br />
                Khung xem trước thu về {cfg.w} x {cfg.h} px cho nhẹ, bản xuất vẫn đúng khổ thật.
              </>
            )}
          </p>
        </>
      ) : (
        <>
          <SelectRow
            label="Kích thước"
            value={presetValue(WEB_PRESETS, cfg.w + "x" + cfg.h)}
            options={WEB_PRESETS}
            onChange={(v) => {
              if (v === "custom") return;
              const [w, h] = v.split("x").map(Number);
              update({ w, h, webW: w, webH: h });
            }}
          />
          <div className="row">
            <label htmlFor="canvasW">Rộng x Cao</label>
            <input
              type="number"
              id="canvasW"
              min="16"
              max="12000"
              step="1"
              value={cfg.w}
              onChange={(e) => {
                const w = clamp(Number(e.target.value) || 16, 16, 12000);
                update({ w, webW: w });
              }}
            />
            <input
              type="number"
              min="16"
              max="12000"
              step="1"
              value={cfg.h}
              onChange={(e) => {
                const h = clamp(Number(e.target.value) || 16, 16, 12000);
                update({ h, webH: h });
              }}
            />
          </div>
          <p className="hint">
            Đơn vị pixel, bước lưới {pitch}px. Chuyển sang kiểu In nếu cần khổ theo mm.
          </p>
        </>
      )}
    </Group>
  );
}
