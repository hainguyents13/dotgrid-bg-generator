/** Các hàng điều khiển dùng lại trong bảng bên trái. */
import { useEffect, useId, useState } from "react";
import { clamp, normalizeHex } from "../lib/color.js";

export function RangeRow({ label, value, min, max, step = 1, suffix = "", onChange }) {
  const id = useId();
  return (
    <div className="row">
      <label htmlFor={id}>{label}</label>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="val">{value + suffix}</span>
    </div>
  );
}

/**
 * Ô số cho phép xoá trống trong lúc gõ.
 * Nếu ép giá trị hợp lệ ngay từng phím thì người dùng không xoá hết số cũ được.
 */
export function NumberField({ value, min, max, onChange, id }) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  return (
    <input
      type="number"
      id={id}
      min={min}
      max={max}
      step="1"
      value={draft}
      onChange={(e) => {
        const next = e.target.value;
        setDraft(next);
        const n = Number(next);
        if (next !== "" && Number.isFinite(n) && n >= min && n <= max) onChange(n);
      }}
      onBlur={() => {
        const n = Number(draft);
        if (draft === "" || !Number.isFinite(n)) {
          setDraft(String(value));
          return;
        }
        const fixed = clamp(Math.round(n), min, max);
        setDraft(String(fixed));
        onChange(fixed);
      }}
    />
  );
}

export function ColorRow({ label, value, onChange }) {
  const id = useId();
  return (
    <div className="row">
      <label htmlFor={id}>{label}</label>
      <input type="color" id={id} value={value} onChange={(e) => onChange(e.target.value)} />
      <input
        type="text"
        spellCheck="false"
        value={value}
        onChange={(e) => {
          const hex = normalizeHex(e.target.value);
          onChange(hex || e.target.value);
        }}
      />
    </div>
  );
}

export function SelectRow({ label, value, options, onChange }) {
  const id = useId();
  return (
    <div className="row">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CheckRow({ label, checked, onChange }) {
  return (
    <div className="row">
      <label style={{ flex: 1 }}>
        <span className="check">
          <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
          {" " + label}
        </span>
      </label>
    </div>
  );
}

export function Group({ title, extra, children, className = "" }) {
  return (
    <div className={"group " + className}>
      <p className="group-title">
        <span>{title}</span>
        {extra}
      </p>
      {children}
    </div>
  );
}
