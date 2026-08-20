/** Bảng chỉnh riêng lớp đang chọn. */
import { isTextLayer } from "../lib/text-layer.js";
import { Group, RangeRow, ColorRow } from "./controls.jsx";
import TextFields from "./TextFields.jsx";

export default function LayerControls({ layer, patch, onDuplicate }) {
  if (!layer) return null;
  const isText = isTextLayer(layer);

  return (
    <Group title={"Chỉnh lớp: " + layer.name}>
      {isText && <TextFields layer={layer} patch={patch} />}
      <ColorRow label={isText ? "Màu chữ" : "Màu hình"} value={layer.color} onChange={(v) => patch({ color: v })} />
      {/* Chữ vẽ ra chỉ có một màu nên hai thanh lấy màu từ ảnh gốc không có tác dụng. */}
      {!isText && (
        <>
          <RangeRow label="Giữ màu gốc" min={0} max={100} suffix="%" value={layer.tint} onChange={(v) => patch({ tint: v })} />
          <RangeRow label="Độ sáng màu" min={30} max={250} suffix="%" value={layer.bright} onChange={(v) => patch({ bright: v })} />
        </>
      )}
      <RangeRow label="Phóng to" min={5} max={300} suffix="%" value={layer.scale} onChange={(v) => patch({ scale: v })} />
      <RangeRow label="Ngưỡng" min={0} max={100} suffix="%" value={layer.threshold} onChange={(v) => patch({ threshold: v })} />
      <RangeRow label="Độ chuyển" min={0} max={100} suffix="%" value={layer.soft} onChange={(v) => patch({ soft: v })} />
      <RangeRow label="Độ nhiễu" min={0} max={100} suffix="%" value={layer.noise} onChange={(v) => patch({ noise: v })} />
      <RangeRow
        label="Xoay tròn"
        min={-120}
        max={120}
        suffix="°/s"
        value={layer.spin}
        onChange={(v) => patch({ spin: v })}
      />
      <div className="btn-grid" style={{ marginTop: 10 }}>
        <button onClick={() => patch({ x: 0, y: 0, scale: 80, spin: 0 })}>Về giữa khung</button>
        <button onClick={onDuplicate}>Nhân đôi lớp</button>
      </div>
      <p className="hint">
        Kéo thẳng hình trên khung xem trước để dời lớp đang chọn. Giữ Alt rồi lăn chuột để phóng to thu
        nhỏ, bấm đúp để đưa về giữa.
        <br />
        Xoay tròn chỉ chạy ở khung xem trước, file xuất ra luôn giữ hình ở góc gốc.
      </p>
    </Group>
  );
}
