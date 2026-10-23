import { useEffect, useRef } from "react";
import { drawPoster, isInPhoto, photoGeometry } from "../poster/draw.js";
import { TEMPLATE } from "../poster/layout.js";

const PREVIEW_WIDTH = 1080;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export default function PosterCanvas({ template, photo, data, fontsReady, onChange }) {
  const width = PREVIEW_WIDTH;
  const height = Math.round((PREVIEW_WIDTH * TEMPLATE.height) / TEMPLATE.width);
  const canvasRef = useRef(null);
  const drag = useRef(null);
  // The wheel listener is attached once, so it reads the latest values from a ref.
  const latest = useRef({ photo, data, onChange });
  latest.current = { photo, data, onChange };

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    drawPoster(ctx, { template, photo, data, preview: true });
  }, [template, photo, data, fontsReady]);

  const toTemplate = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * TEMPLATE.width,
      y: ((e.clientY - rect.top) / rect.height) * TEMPLATE.height,
      perPx: TEMPLATE.width / rect.width,
    };
  };

  const onPointerDown = (e) => {
    const p = toTemplate(e);
    if (!photo || !isInPhoto(p.x, p.y)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startX: e.clientX, startY: e.clientY, panX: data.panX, panY: data.panY, perPx: p.perPx };
  };

  const onPointerMove = (e) => {
    const canvas = canvasRef.current;
    if (!drag.current) {
      const p = toTemplate(e);
      canvas.style.cursor = photo && isInPhoto(p.x, p.y) ? "grab" : "default";
      return;
    }
    canvas.style.cursor = "grabbing";
    const d = drag.current;
    const g = photoGeometry(photo, data.zoom, 0, 0);
    const dx = (e.clientX - d.startX) * d.perPx;
    const dy = (e.clientY - d.startY) * d.perPx;
    onChange({
      panX: g.maxX > 0 ? clamp(d.panX + dx / g.maxX, -1, 1) : 0,
      panY: g.maxY > 0 ? clamp(d.panY + dy / g.maxY, -1, 1) : 0,
    });
  };

  const endDrag = () => {
    drag.current = null;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const onWheel = (e) => {
      const { photo, data, onChange } = latest.current;
      const p = toTemplate(e);
      if (!photo || !isInPhoto(p.x, p.y)) return;
      e.preventDefault();
      onChange({ zoom: clamp(data.zoom - e.deltaY * 0.0015, 1, 3) });
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="poster-canvas"
      width={width}
      height={height}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      role="img"
      aria-label="Live poster preview"
    />
  );
}
