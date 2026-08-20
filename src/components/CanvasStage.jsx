/** Khung xem trước: vẽ canvas, kéo thả lớp và nhận file thả vào. */
import { useEffect, useRef, useState } from "react";
import { clamp } from "../lib/color.js";
import { grid } from "../lib/geometry.js";
import { drawTo } from "../lib/renderer.js";

export default function CanvasStage({ cfg, revision, layer, patchLayer, message, onAddFiles }) {
  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const [over, setOver] = useState(false);

  /* Vẽ lại sau mỗi thay đổi cấu hình, gộp trong một khung hình để kéo slider không giật. */
  useEffect(() => {
    const id = requestAnimationFrame(() => drawTo(canvasRef.current, cfg, 1));
    return () => cancelAnimationFrame(id);
  }, [cfg, revision]);

  const g = grid(cfg);
  const dotCount = Math.ceil(cfg.w / g.pitch) * Math.ceil(cfg.h / g.pitch);

  const onPointerDown = (e) => {
    if (!layer) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    dragRef.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      startX: layer.x,
      startY: layer.y,
      kx: rect.width ? canvas.width / rect.width : 1,
      ky: rect.height ? canvas.height / rect.height : 1
    };
    canvas.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.id || !layer) return;
    patchLayer({
      x: clamp(Math.round(d.startX + (((e.clientX - d.x) * d.kx) / cfg.w) * 100), -100, 100),
      y: clamp(Math.round(d.startY + (((e.clientY - d.y) * d.ky) / cfg.h) * 100), -100, 100)
    });
  };

  const endDrag = (e) => {
    if (dragRef.current && e.pointerId === dragRef.current.id) dragRef.current = null;
  };

  /* React gắn wheel ở chế độ passive nên phải tự đăng ký để chặn cuộn trang khi zoom. */
  useEffect(() => {
    const canvas = canvasRef.current;
    const onWheel = (e) => {
      if (!layer || (!e.altKey && !e.ctrlKey && !e.metaKey)) return;
      e.preventDefault();
      patchLayer({ scale: clamp(Math.round(layer.scale - e.deltaY * 0.1), 5, 300) });
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [layer, patchLayer]);

  const stop = (e) => e.preventDefault();

  return (
    <div>
      <div
        className={"stage" + (over ? " over" : "")}
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
        <canvas
          id="preview"
          ref={canvasRef}
          style={{ cursor: layer ? "grab" : "default", touchAction: layer ? "none" : "auto" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onDoubleClick={() => layer && patchLayer({ x: 0, y: 0 })}
        />
      </div>
      <div className="meta">
        <span>
          {cfg.w} x {cfg.h} px · bước lưới {g.pitch}px · {dotCount.toLocaleString("vi-VN")} chấm
        </span>
        <span className={"toast" + (message ? " show" : "")}>{message}</span>
      </div>
    </div>
  );
}
