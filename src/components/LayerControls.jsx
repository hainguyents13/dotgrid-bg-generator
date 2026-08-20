/** Bảng chỉnh riêng lớp đang chọn. */
import { Group, RangeRow, ColorRow, SelectRow, CheckRow } from "./controls.jsx";

const FIT_OPTIONS = [
  { value: "contain", label: "Vừa khung" },
  { value: "cover", label: "Phủ kín khung" },
  { value: "stretch", label: "Kéo giãn" }
];

const SOURCE_OPTIONS = [
  { value: "alpha", label: "Vùng có hình" },
  { value: "lum", label: "Độ sáng" }
];

export default function LayerControls({ layer, patch, onDuplicate }) {
  if (!layer) return null;

  return (
    <Group title={"Chỉnh lớp: " + layer.name}>
      <ColorRow label="Màu hình" value={layer.color} onChange={(v) => patch({ color: v })} />
      <RangeRow label="Giữ màu gốc" min={0} max={100} suffix="%" value={layer.tint} onChange={(v) => patch({ tint: v })} />
      <RangeRow label="Độ sáng màu" min={30} max={250} suffix="%" value={layer.bright} onChange={(v) => patch({ bright: v })} />
      <SelectRow label="Cách đặt" value={layer.fit} options={FIT_OPTIONS} onChange={(v) => patch({ fit: v })} />
      <RangeRow label="Phóng to" min={5} max={300} suffix="%" value={layer.scale} onChange={(v) => patch({ scale: v })} />
      <RangeRow label="Dời ngang" min={-100} max={100} suffix="%" value={layer.x} onChange={(v) => patch({ x: v })} />
      <RangeRow label="Dời dọc" min={-100} max={100} suffix="%" value={layer.y} onChange={(v) => patch({ y: v })} />
      <SelectRow label="Bám theo" value={layer.source} options={SOURCE_OPTIONS} onChange={(v) => patch({ source: v })} />
      <CheckRow label="Đảo ngược vùng chấm" checked={layer.invert} onChange={(v) => patch({ invert: v })} />
      <RangeRow label="Ngưỡng" min={0} max={100} suffix="%" value={layer.threshold} onChange={(v) => patch({ threshold: v })} />
      <RangeRow label="Độ chuyển" min={0} max={100} suffix="%" value={layer.soft} onChange={(v) => patch({ soft: v })} />
      <RangeRow label="Độ nhiễu" min={0} max={100} suffix="%" value={layer.noise} onChange={(v) => patch({ noise: v })} />
      <div className="btn-grid" style={{ marginTop: 10 }}>
        <button onClick={() => patch({ x: 0, y: 0, scale: 80 })}>Về giữa khung</button>
        <button onClick={onDuplicate}>Nhân đôi lớp</button>
      </div>
      <p className="hint">
        Kéo thẳng hình trên khung xem trước để dời lớp đang chọn. Giữ Alt rồi lăn chuột để phóng to thu
        nhỏ, bấm đúp để đưa về giữa.
      </p>
    </Group>
  );
}
