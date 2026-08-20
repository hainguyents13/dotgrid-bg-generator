/** Khổ ảnh thiết kế: preset và số đo pixel. */
import { clamp } from "../lib/color.js";
import { Group, SelectRow } from "./controls.jsx";

const PRESETS = [
  { value: "1080x1080", label: "Vuông 1080 x 1080" },
  { value: "1920x1080", label: "Ngang 1920 x 1080" },
  { value: "1200x630", label: "OG image 1200 x 630" },
  { value: "1080x1350", label: "Dọc 1080 x 1350" },
  { value: "1080x1920", label: "Story 1080 x 1920" },
  { value: "800x2000", label: "Standee 800 x 2000" },
  { value: "custom", label: "Tuỳ chỉnh" }
];

export default function SizePanel({ cfg, update }) {
  const key = cfg.w + "x" + cfg.h;
  const preset = PRESETS.some((p) => p.value === key) ? key : "custom";

  return (
    <Group title="Khổ ảnh">
      <SelectRow
        label="Kích thước"
        value={preset}
        options={PRESETS}
        onChange={(v) => {
          if (v === "custom") return;
          const [w, h] = v.split("x").map(Number);
          update({ w, h });
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
          onChange={(e) => update({ w: clamp(Number(e.target.value) || 16, 16, 12000) })}
        />
        <input
          type="number"
          min="16"
          max="12000"
          step="1"
          value={cfg.h}
          onChange={(e) => update({ h: clamp(Number(e.target.value) || 16, 16, 12000) })}
        />
      </div>
    </Group>
  );
}
