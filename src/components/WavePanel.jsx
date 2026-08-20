/** Vệt sáng nhấn ở đáy khung. */
import { Group, RangeRow, ColorRow, Switch } from "./controls.jsx";

export default function WavePanel({ cfg, update }) {
  return (
    <Group
      title="Vệt sáng dưới đáy"
      extra={<Switch checked={cfg.waveOn} onChange={(v) => update({ waveOn: v })} />}
    >
      <div className={cfg.waveOn ? "" : "disabled-block"}>
        <ColorRow label="Màu nhấn" value={cfg.wave} onChange={(v) => update({ wave: v })} />
        <RangeRow label="Chiều cao" min={5} max={90} suffix="%" value={cfg.waveHeight} onChange={(v) => update({ waveHeight: v })} />
        <RangeRow label="Độ nhấp nhô" min={0} max={40} suffix="%" value={cfg.waveAmp} onChange={(v) => update({ waveAmp: v })} />
        <RangeRow label="Độ chuyển" min={0} max={60} suffix="%" value={cfg.waveFeather} onChange={(v) => update({ waveFeather: v })} />
        <RangeRow label="Độ nhiễu" min={0} max={100} suffix="%" value={cfg.waveNoise} onChange={(v) => update({ waveNoise: v })} />
        <div className="row">
          <label>Dáng vệt</label>
          <button
            className="mini"
            style={{ flex: 1 }}
            onClick={() => update({ seed: Math.floor(Math.random() * 9999) })}
          >
            Đổi dáng ngẫu nhiên
          </button>
        </div>
      </div>
    </Group>
  );
}
