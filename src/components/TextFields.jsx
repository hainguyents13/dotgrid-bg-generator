/** Nội dung và kiểu chữ của lớp chữ. */
import { useId } from "react";
import { GOOGLE_FONTS, weightsOf } from "../lib/google-fonts.js";
import { SelectRow } from "./controls.jsx";

const WEIGHT_LABELS = { 400: "Thường", 500: "Vừa", 600: "Đậm vừa", 700: "Đậm", 800: "Rất đậm", 900: "Đậm nhất" };

export default function TextFields({ layer, patch }) {
  const id = useId();
  const weights = weightsOf(layer.font);

  return (
    <>
      <div className="row">
        <label htmlFor={id}>Nội dung</label>
        <textarea
          id={id}
          rows={2}
          spellCheck="false"
          value={layer.text}
          onChange={(e) => patch({ text: e.target.value, name: e.target.value.split("\n")[0] || "TEXT" })}
        />
      </div>
      <SelectRow
        label="Font chữ"
        value={layer.font}
        options={GOOGLE_FONTS.map((f) => ({ value: f.family, label: f.family }))}
        onChange={(font) => {
          const next = weightsOf(font);
          patch({ font, weight: next.includes(layer.weight) ? layer.weight : next[next.length - 1] });
        }}
      />
      <SelectRow
        label="Độ đậm"
        value={String(layer.weight)}
        options={weights.map((w) => ({ value: String(w), label: (WEIGHT_LABELS[w] || w) + " " + w }))}
        onChange={(v) => patch({ weight: Number(v) })}
      />
    </>
  );
}
