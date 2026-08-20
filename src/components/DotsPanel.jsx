/** Màu nền, màu chấm và hình dạng lưới. */
import { Group, RangeRow, ColorRow, CheckRow } from "./controls.jsx";

export default function DotsPanel({ cfg, update }) {
  return (
    <Group title="Nền và chấm">
      <ColorRow label="Màu nền" value={cfg.bg} onChange={(v) => update({ bg: v })} />
      <ColorRow label="Màu chấm" value={cfg.dot} onChange={(v) => update({ dot: v })} />
      <RangeRow label="Cỡ chấm" min={1} max={24} value={cfg.dotSize} onChange={(v) => update({ dotSize: v })} />
      <RangeRow label="Khoảng cách" min={1} max={48} value={cfg.gap} onChange={(v) => update({ gap: v })} />
      <RangeRow label="Bo góc chấm" min={0} max={50} suffix="%" value={cfg.radius} onChange={(v) => update({ radius: v })} />
      <RangeRow label="Độ đậm" min={5} max={100} suffix="%" value={cfg.opacity} onChange={(v) => update({ opacity: v })} />
      <RangeRow label="Lề trong" min={0} max={300} suffix="px" value={cfg.pad} onChange={(v) => update({ pad: v })} />
      <RangeRow label="Bo góc khung" min={0} max={400} suffix="px" value={cfg.frameRadius} onChange={(v) => update({ frameRadius: v })} />
      <CheckRow
        label="Nền trong suốt ngoài khung"
        checked={cfg.clipOutside}
        onChange={(v) => update({ clipOutside: v })}
      />
    </Group>
  );
}
