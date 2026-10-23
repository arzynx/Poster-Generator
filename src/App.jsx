import { useCallback, useEffect, useMemo, useState } from "react";
import PosterCanvas from "./components/PosterCanvas.jsx";
import FunkyBackground from "./components/FunkyBackground.jsx";
import { PhotoDrop, Slider, Step, TextField } from "./components/Controls.jsx";
import { drawPoster } from "./poster/draw.js";
import { PLATFORMS, PLACEHOLDERS } from "./poster/layout.js";
import { burstConfetti } from "./confetti.js";
import { buildCaption } from "./caption.js";
import templateUrl from "./assets/poster-template.png";
import logoUrl from "./assets/cc-logo.png";


const DEFAULT_BADGES = [
  { label: "Core Builder", desc: "Shipping projects & features" },
  { label: "Community Lead", desc: "Guiding & mentoring peers" },
  { label: "Innovator", desc: "Experimenting with new tech" },
  { label: "Code Crafter", desc: "Writing clean, scalable code" },
];

const INITIAL = {
  name: "",
  role: "",
  bio: "",
  badges: DEFAULT_BADGES,
  zoom: 1,
  panX: 0,
  panY: 0,
  vignette: 0,
};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

const PLATFORM_GLYPH = { instagram: "IG", linkedin: "in", whatsapp: "WA" };

const CHEERS = ["Let's make you famous.", "Looking good so far!", "Halfway there, keep going!", "Almost poster-perfect!", "Ready to post. Go get 'em!"];

export default function App() {
  const [data, setData] = useState(INITIAL);
  const [template, setTemplate] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoName, setPhotoName] = useState("");
  const [fontsReady, setFontsReady] = useState(false);
  const [platformId, setPlatformId] = useState("instagram");
  const platform = PLATFORMS.find((p) => p.id === platformId);
  const [status, setStatus] = useState({ text: "", tone: "" });
  const [busy, setBusy] = useState(false);

  const update = useCallback((patch) => setData((d) => ({ ...d, ...patch })), []);
  const setBadge = (i, patch) => update({ badges: data.badges.map((b, j) => (j === i ? { ...b, ...patch } : b)) });

  useEffect(() => {
    loadImage(templateUrl).then(setTemplate);
    Promise.all([400, 600, 700, 800].map((w) => document.fonts.load(`${w} 16px Montserrat`))).then(() => setFontsReady(true));
  }, []);

  const onFile = async (file) => {
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      setPhoto(img);
      setPhotoName(file.name);
      update({ zoom: 1, panX: 0, panY: 0 });
    } catch {
      flash("That file couldn't be opened as an image.", "error");
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const flash = (text, tone = "") => setStatus({ text, tone });

  const caption = useMemo(() => buildCaption(data, platform.tone), [data, platform]);

  const done = [photo, data.name.trim(), data.role.trim(), data.bio.trim()].filter(Boolean).length;

  const download = async () => {
    setBusy(true);
    flash("Painting your poster…");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = platform.width;
      canvas.height = platform.height;
      drawPoster(canvas.getContext("2d"), { template, photo, data });
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      const slug = (data.name.trim() || "member").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `code-crate-${slug}-${platform.id}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      flash(`Your ${platform.label} poster is downloaded. Nice one!`, "ok");
      burstConfetti();
    } catch (err) {
      console.error(err);
      flash("Export failed. See the console for details.", "error");
    } finally {
      setBusy(false);
    }
  };

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      flash("Caption copied to clipboard.", "ok");
    } catch {
      flash("Clipboard blocked. Select the caption and press Ctrl+C.", "error");
    }
  };

  return (
    <div className="app">
      <FunkyBackground />
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <img src={logoUrl} alt="" />
          </span>
          <div>
            <strong>Poster Studio</strong>
            <span>by Code Crate</span>
          </div>
        </div>
        <div className="meter" aria-label={`${done} of 4 essentials filled`}>
          <div className="meter-dots">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={i < done ? "on" : ""} />
            ))}
          </div>
          <span className="meter-text">{CHEERS[done]}</span>
        </div>
      </header>

      <main className="layout">
        <div className="editor">
          <Step n="1" color="mint" title="Strike a pose" subtitle="Add your photo, then drag it on the poster to frame it.">
            <PhotoDrop
              fileName={photoName}
              onFile={onFile}
              onRemove={() => {
                setPhoto(null);
                setPhotoName("");
              }}
            />
            <div className={`photo-tools ${photo ? "" : "disabled"}`} inert={!photo || undefined}>
              <Slider label="Zoom" value={data.zoom} min={1} max={3} step={0.01} onChange={(zoom) => update({ zoom })} format={(v) => `${Math.round(v * 100)}%`} />
              <Slider label="Vignette" value={data.vignette} min={0} max={100} step={1} onChange={(vignette) => update({ vignette })} format={(v) => (v ? `${v}%` : "Off")} />
              <button type="button" className="btn small ghost" onClick={() => update({ zoom: 1, panX: 0, panY: 0, vignette: 0 })}>
                Reset photo
              </button>
            </div>
          </Step>

          <Step n="2" color="peach" title="Tell your story" subtitle="Keep it short and sweet. It fills the space beside your photo.">
            <TextField label="Name" value={data.name} maxLength={40} placeholder={PLACEHOLDERS.name} onChange={(name) => update({ name })} />
            <TextField label="Role / Title" value={data.role} maxLength={50} placeholder={PLACEHOLDERS.role} onChange={(role) => update({ role })} />
            <TextField label="About" value={data.bio} maxLength={220} placeholder={PLACEHOLDERS.bio} multiline onChange={(bio) => update({ bio })} />
          </Step>

          <Step n="3" color="butter" title="Show off a little" subtitle="Four highlight badges. Leave one empty to hide it.">
            <div className="badges">
              {data.badges.map((b, i) => (
                <div className="badge-card" key={i}>
                  <span className="badge-num">#{i + 1}</span>
                  <input aria-label={`Badge ${i + 1} title`} className="badge-title" value={b.label} maxLength={22} placeholder="Badge title" onChange={(e) => setBadge(i, { label: e.target.value })} />
                  <input aria-label={`Badge ${i + 1} description`} value={b.desc} maxLength={48} placeholder="One short line" onChange={(e) => setBadge(i, { desc: e.target.value })} />
                </div>
              ))}
            </div>
          </Step>

          <Step n="4" color="lilac" title="Ship it" subtitle="Where are you posting? We'll tailor the poster and caption for it.">
            <div className="platforms" role="radiogroup" aria-label="Platform">
              {PLATFORMS.map((p) => (
                <button key={p.id} type="button" role="radio" aria-checked={platformId === p.id} className={`platform ${p.id}`} onClick={() => setPlatformId(p.id)}>
                  <span className="platform-icon" aria-hidden="true">{PLATFORM_GLYPH[p.id]}</span>
                  <strong>{p.label}</strong>
                  <small>{p.hint}</small>
                </button>
              ))}
            </div>
            <button type="button" className="btn primary big" onClick={download} disabled={busy || !template}>
              {busy ? "Rendering…" : `Download for ${platform.label}`}
            </button>
            <p className={`status ${status.tone}`} aria-live="polite">
              {status.text}
            </p>
            <div className="field">
              <div className="field-top">
                <label htmlFor="caption">{platform.label} caption</label>
                <button type="button" className="btn small" onClick={copyCaption}>
                  Copy
                </button>
              </div>
              <textarea id="caption" className="caption" rows={12} readOnly value={caption} />
            </div>
          </Step>
        </div>

        <aside className="preview">
          <div className="preview-card">
            <div className="preview-label">
              <span className="live-dot" /> Live preview
            </div>
            <PosterCanvas template={template} photo={photo} data={data} fontsReady={fontsReady} onChange={update} />
            {photo && <p className="preview-hint">Drag to reposition · scroll to zoom</p>}
          </div>
        </aside>
      </main>
    </div>
  );
}
