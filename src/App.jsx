/** Trạng thái cấu hình, danh sách lớp và ghép các bảng điều khiển lại. */
import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_CONFIG, nextId } from "./lib/config.js";
import { attachImage, dropImage, hasImage } from "./lib/image-store.js";
import { layersFromFiles } from "./lib/file-input.js";
import { saveConfig, loadConfig } from "./lib/storage.js";
import SizePanel from "./components/SizePanel.jsx";
import PrintPanel from "./components/PrintPanel.jsx";
import DotsPanel from "./components/DotsPanel.jsx";
import LayersPanel from "./components/LayersPanel.jsx";
import LayerControls from "./components/LayerControls.jsx";
import WavePanel from "./components/WavePanel.jsx";
import ExportPanel from "./components/ExportPanel.jsx";
import CanvasStage from "./components/CanvasStage.jsx";

export default function App() {
  const [cfg, setCfg] = useState(DEFAULT_CONFIG);
  const [selectedId, setSelectedId] = useState(null);
  /* Ảnh nằm ngoài state React nên cần một mốc để ép vẽ lại khi ảnh vừa nạp xong. */
  const [revision, setRevision] = useState(0);
  const [message, setMessage] = useState("");
  const toastTimer = useRef(null);

  const toast = useCallback((text) => {
    setMessage(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setMessage(""), 1800);
  }, []);

  const update = useCallback((patch) => setCfg((c) => ({ ...c, ...patch })), []);

  const patchLayer = useCallback(
    (id, patch) =>
      setCfg((c) => ({
        ...c,
        layers: c.layers.map((L) => (L.id === id ? { ...L, ...patch } : L))
      })),
    []
  );

  const addLayers = useCallback(async (newLayers) => {
    const ok = [];
    for (const layer of newLayers) {
      if (await attachImage(layer)) ok.push(layer);
    }
    if (!ok.length) return;
    setCfg((c) => ({ ...c, layers: c.layers.concat(ok) }));
    setSelectedId(ok[ok.length - 1].id);
    setRevision((n) => n + 1);
  }, []);

  /* Khôi phục phiên trước, chỉ giữ lại các lớp còn nạp được ảnh. */
  useEffect(() => {
    const saved = loadConfig();
    if (!saved) return;
    let cancelled = false;
    (async () => {
      await Promise.all(saved.layers.map((L) => attachImage(L)));
      if (cancelled) return;
      const layers = saved.layers.filter((L) => hasImage(L.id));
      setCfg({ ...DEFAULT_CONFIG, ...saved, layers });
      if (layers.length) setSelectedId(layers[layers.length - 1].id);
      setRevision((n) => n + 1);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = setTimeout(() => saveConfig(cfg), 700);
    return () => clearTimeout(id);
  }, [cfg]);

  const handleAddFiles = useCallback(
    async (fileList) => {
      const { layers, failed } = await layersFromFiles(fileList);
      failed.forEach((name) => toast("Không đọc được " + name));
      await addLayers(layers);
    },
    [addLayers, toast]
  );

  const selected = cfg.layers.find((L) => L.id === selectedId) || null;

  const layerHandlers = {
    onSelect: setSelectedId,
    onToggle: (id) => setCfg((c) => ({
      ...c,
      layers: c.layers.map((L) => (L.id === id ? { ...L, visible: !L.visible } : L))
    })),
    onMove: (from, to) =>
      setCfg((c) => {
        if (to < 0 || to >= c.layers.length) return c;
        const layers = c.layers.slice();
        const [item] = layers.splice(from, 1);
        layers.splice(to, 0, item);
        setSelectedId(item.id);
        return { ...c, layers };
      }),
    onRename: (layer) => {
      const v = prompt("Tên lớp", layer.name);
      if (v && v.trim()) patchLayer(layer.id, { name: v.trim() });
    },
    onDelete: (id) => {
      dropImage(id);
      setCfg((c) => {
        const layers = c.layers.filter((L) => L.id !== id);
        setSelectedId((cur) => (cur === id ? (layers.length ? layers[layers.length - 1].id : null) : cur));
        return { ...c, layers };
      });
    }
  };

  const duplicateLayer = async () => {
    if (!selected) return;
    const copy = { ...selected, id: nextId(), name: selected.name + " bản sao" };
    if (!(await attachImage(copy))) return;
    setCfg((c) => {
      const layers = c.layers.slice();
      layers.splice(c.layers.findIndex((L) => L.id === selected.id) + 1, 0, copy);
      return { ...c, layers };
    });
    setSelectedId(copy.id);
    setRevision((n) => n + 1);
  };

  return (
    <>
      <div className="head">
        <h1>Trình tạo background chấm vuông</h1>
        <p>
          Thả nhiều file vector vào, xếp lớp và chỉnh riêng từng hình, rồi xuất PNG, SVG hoặc lấy CSS.
        </p>
      </div>

      <div className="wrap">
        <div className="panel">
          <SizePanel cfg={cfg} update={update} />
          <PrintPanel cfg={cfg} update={update} toast={toast} />
          <DotsPanel cfg={cfg} update={update} />
          <LayersPanel
            layers={cfg.layers}
            selectedId={selectedId}
            onAddFiles={handleAddFiles}
            {...layerHandlers}
          />
          <LayerControls
            layer={selected}
            patch={(patch) => patchLayer(selected.id, patch)}
            onDuplicate={duplicateLayer}
          />
          <WavePanel cfg={cfg} update={update} />
          <ExportPanel cfg={cfg} toast={toast} />
        </div>

        <CanvasStage
          cfg={cfg}
          revision={revision}
          layer={selected}
          patchLayer={(patch) => patchLayer(selected.id, patch)}
          message={message}
          onAddFiles={handleAddFiles}
        />
      </div>
    </>
  );
}
