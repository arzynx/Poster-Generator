import { useId, useRef, useState } from "react";

export function Step({ n, color, title, subtitle, children }) {
  return (
    <section className="card step">
      <header className="step-head">
        <span className={`step-num ${color}`}>{n}</span>
        <div>
          <h2>{title}</h2>
          {subtitle && <p className="step-sub">{subtitle}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

export function TextField({ label, value, onChange, maxLength, placeholder, multiline, rows = 4 }) {
  const id = useId();
  const Tag = multiline ? "textarea" : "input";
  const left = maxLength - value.length;
  return (
    <div className="field">
      <div className="field-top">
        <label htmlFor={id}>{label}</label>
        <span className={`count ${left < 10 ? "low" : ""}`}>{left}</span>
      </div>
      <Tag
        id={id}
        type={multiline ? undefined : "text"}
        rows={multiline ? rows : undefined}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function Slider({ label, value, min, max, step, onChange, format }) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="slider">
      <div className="field-top">
        <label htmlFor={id}>{label}</label>
        <span className="slider-value">{format(value)}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ "--fill": `${pct}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export function PhotoDrop({ fileName, onFile, onRemove }) {
  const inputRef = useRef(null);
  const [over, setOver] = useState(false);

  const pick = (file) => {
    if (file && file.type.startsWith("image/")) onFile(file);
  };

  return (
    <div
      className={`drop ${over ? "over" : ""} ${fileName ? "has-file" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        pick(e.dataTransfer.files[0]);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          pick(e.target.files[0]);
          e.target.value = "";
        }}
      />
      {fileName ? (
        <>
          <span className="drop-file" title={fileName}>{fileName}</span>
          <div className="drop-actions">
            <button type="button" className="btn small" onClick={() => inputRef.current.click()}>
              Replace
            </button>
            <button type="button" className="btn small ghost" onClick={onRemove}>
              Remove
            </button>
          </div>
        </>
      ) : (
        <button type="button" className="drop-cta" onClick={() => inputRef.current.click()}>
          <span className="drop-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="15" rx="3" />
              <circle cx="9" cy="11" r="2" />
              <path d="m21 16-5-5-9 9" />
            </svg>
          </span>
          <strong>Drop your photo here</strong>
          <span>or click to browse</span>
        </button>
      )}
    </div>
  );
}
