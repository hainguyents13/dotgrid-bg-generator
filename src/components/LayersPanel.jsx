/** Danh sách lớp hình: chọn, ẩn hiện, đổi thứ tự, xoá và vùng thả file. */
import { useRef, useState } from "react";
import { Group } from "./controls.jsx";

function LayerRow({ layer, index, total, selected, onSelect, onToggle, onMove, onRename, onDelete }) {
  return (
    <div
      className={"layer" + (selected ? " sel" : "") + (layer.visible ? "" : " off")}
      onClick={() => onSelect(layer.id)}
    >
      <button
        className="icon"
        type="button"
        title={layer.visible ? "Ẩn lớp" : "Hiện lớp"}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(layer.id);
        }}
      >
        {layer.visible ? "◉" : "○"}
      </button>
      <img className="thumb" src={layer.src} alt="" />
      <span
        className="lname"
        title="Bấm đúp để đổi tên"
        onDoubleClick={(e) => {
          e.stopPropagation();
          onRename(layer);
        }}
      >
        {layer.name}
      </span>
      <button
        className="icon"
        type="button"
        title="Đưa lên trên"
        disabled={index === total - 1}
        onClick={(e) => {
          e.stopPropagation();
          onMove(index, index + 1);
        }}
      >
        ↑
      </button>
      <button
        className="icon"
        type="button"
        title="Đưa xuống dưới"
        disabled={index === 0}
        onClick={(e) => {
          e.stopPropagation();
          onMove(index, index - 1);
        }}
      >
        ↓
      </button>
      <button
        className="icon danger"
        type="button"
        title="Xoá lớp"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(layer.id);
        }}
      >
        ×
      </button>
    </div>
  );
}

export default function LayersPanel({ layers, selectedId, onAddFiles, ...handlers }) {
  const inputRef = useRef(null);
  const [over, setOver] = useState(false);
  const total = layers.length;

  const stop = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Group
      title="Các lớp hình"
      extra={
        <span style={{ textTransform: "none", letterSpacing: 0 }}>{total ? total + " lớp" : ""}</span>
      }
    >
      <div className="layers">
        {total === 0 && <div className="empty">Chưa có hình nào</div>}
        {layers
          .map((layer, index) => ({ layer, index }))
          .reverse()
          .map(({ layer, index }) => (
            <LayerRow
              key={layer.id}
              layer={layer}
              index={index}
              total={total}
              selected={layer.id === selectedId}
              {...handlers}
            />
          ))}
      </div>

      <div
        className={"drop" + (over ? " over" : "")}
        onClick={() => inputRef.current.click()}
        onDragEnter={(e) => {
          stop(e);
          setOver(true);
        }}
        onDragOver={(e) => {
          stop(e);
          setOver(true);
        }}
        onDragLeave={(e) => {
          stop(e);
          setOver(false);
        }}
        onDrop={(e) => {
          stop(e);
          setOver(false);
          if (e.dataTransfer?.files.length) onAddFiles(e.dataTransfer.files);
        }}
      >
        Kéo file SVG hoặc PNG vào đây, hoặc bấm để chọn
      </div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple
        accept=".svg,image/svg+xml,image/png,image/jpeg,image/webp"
        onChange={(e) => {
          onAddFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {total > 0 && (
        <p className="hint">
          Lớp nằm trên trong danh sách sẽ đè lên lớp bên dưới. Bấm vào một lớp để chỉnh riêng nó.
        </p>
      )}
    </Group>
  );
}
