import { TEMPLATE, PHOTO, INFO, COLORS, PLACEHOLDERS, SOCIAL_BAR, SOCIALS } from "./layout.js";

const font = (weight, size) => `${weight} ${size}px Montserrat, sans-serif`;

// Where the photo lands for a given zoom/pan. pan values run -1..1 across the
// overflow, so a centred photo is always 0,0 whatever the zoom.
export function photoGeometry(img, zoom, panX, panY) {
  const cover = Math.max(PHOTO.w / img.naturalWidth, PHOTO.h / img.naturalHeight) * zoom;
  const w = img.naturalWidth * cover;
  const h = img.naturalHeight * cover;
  const maxX = (w - PHOTO.w) / 2;
  const maxY = (h - PHOTO.h) / 2;
  return {
    w,
    h,
    maxX,
    maxY,
    x: PHOTO.x + (PHOTO.w - w) / 2 + panX * maxX,
    y: PHOTO.y + (PHOTO.h - h) / 2 + panY * maxY,
  };
}

export function isInPhoto(tx, ty) {
  return tx >= PHOTO.x && tx <= PHOTO.x + PHOTO.w && ty >= PHOTO.y && ty <= PHOTO.y + PHOTO.h;
}

// The poster always fills the whole canvas at its own 2:3 ratio.
export function drawPoster(ctx, { template, photo, data, preview = false }) {
  const s = ctx.canvas.width / TEMPLATE.width;
  ctx.save();
  ctx.setTransform(s, 0, 0, s, 0, 0);
  ctx.clearRect(0, 0, TEMPLATE.width, TEMPLATE.height);
  if (template) ctx.drawImage(template, 0, 0, TEMPLATE.width, TEMPLATE.height);
  drawSocials(ctx);
  drawPhoto(ctx, photo, data, preview);
  drawInfo(ctx, data);
  ctx.restore();
}

function drawPhoto(ctx, photo, { zoom, panX, panY, vignette }, preview) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(PHOTO.x, PHOTO.y, PHOTO.w, PHOTO.h, PHOTO.r);
  ctx.clip();

  if (photo) {
    const g = photoGeometry(photo, zoom, panX, panY);
    ctx.drawImage(photo, g.x, g.y, g.w, g.h);
  } else if (preview) {
    ctx.fillStyle = "#9aa7a2";
    ctx.font = font(600, 15);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Your photo goes here", PHOTO.x + PHOTO.w / 2, PHOTO.y + PHOTO.h / 2);
  }

  const t = vignette / 100;
  if (photo && t > 0) {
    // Elliptical vignette: draw a circular gradient in a squashed space.
    const cx = PHOTO.x + PHOTO.w / 2;
    const cy = PHOTO.y + PHOTO.h / 2;
    const r = Math.hypot(PHOTO.w, PHOTO.h) / 2;
    const sx = PHOTO.w / PHOTO.h;
    ctx.translate(cx, cy);
    ctx.scale(sx, 1);
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r / sx);
    grad.addColorStop(0, `rgba(${COLORS.vignette}, 0)`);
    grad.addColorStop(0.62 - 0.34 * t, `rgba(${COLORS.vignette}, 0)`);
    grad.addColorStop(1, `rgba(${COLORS.vignette}, ${0.92 * t})`);
    ctx.fillStyle = grad;
    ctx.fillRect(-PHOTO.w / sx, -PHOTO.h, (2 * PHOTO.w) / sx, 2 * PHOTO.h);
  }
  ctx.restore();
}

// ---------- Social bar ----------

const ICON = 26;
const HANDSET = new Path2D(
  "M8.5 7.2c.3-.4.8-.4 1.1-.1l1.3 1.6c.3.3.2.8-.1 1.1l-.7.6c.5 1.2 1.6 2.4 2.9 3l.6-.7c.3-.3.8-.4 1.1-.1l1.6 1.3c.4.3.4.8.1 1.1l-.8.9c-.5.5-1.3.7-2 .4-2.6-1-4.7-3.1-5.7-5.7-.3-.7-.1-1.5.4-2z"
);

const ICONS = {
  instagram(ctx, x, y) {
    const g = ctx.createLinearGradient(x, y + ICON, x + ICON, y);
    ["#feda75", "#fa7e1e", "#d62976", "#962fbf", "#4f5bd5"].forEach((c, i) => g.addColorStop(i / 4, c));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(x, y, ICON, ICON, 7);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(x + 5, y + 5, ICON - 10, ICON - 10, 5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + ICON / 2, y + ICON / 2, 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x + ICON - 8.3, y + 8.3, 1.3, 0, Math.PI * 2);
    ctx.fill();
  },
  linkedin(ctx, x, y) {
    ctx.fillStyle = "#0a66c2";
    ctx.beginPath();
    ctx.roundRect(x, y, ICON, ICON, 5);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "700 17px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("in", x + ICON / 2 + 0.5, y + ICON - 6);
    ctx.textAlign = "left";
  },
  whatsapp(ctx, x, y) {
    const cx = x + ICON / 2;
    const cy = y + ICON / 2;
    ctx.fillStyle = "#25d366";
    ctx.beginPath();
    ctx.arc(cx, cy, ICON / 2, 0, Math.PI * 2);
    ctx.fill();
    // Speech bubble with a tail at the bottom-left, then the handset inside.
    ctx.strokeStyle = "#fff";
    ctx.fillStyle = "#fff";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(cx + 0.5, cy - 0.5, 7.6, Math.PI * 0.8, Math.PI * 2.62);
    ctx.lineTo(cx - 7.2, cy + 7.4);
    ctx.closePath();
    ctx.stroke();
    ctx.save();
    ctx.translate(cx - 11.6, cy - 12.4);
    ctx.fill(HANDSET);
    ctx.restore();
  },
};

function drawSocials(ctx) {
  const b = SOCIAL_BAR;
  ctx.save();
  ctx.fillStyle = b.fill;
  ctx.beginPath();
  ctx.roundRect(b.x, b.y, b.w, b.h, b.r);
  ctx.fill();

  const seg = b.w / SOCIALS.length;
  const mid = b.y + b.h / 2;
  ctx.font = font(500, 14);
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  SOCIALS.forEach((s, i) => {
    const textW = ctx.measureText(s.handle).width;
    const itemW = ICON + 10 + textW;
    const x = b.x + seg * i + (seg - itemW) / 2;
    ICONS[s.icon](ctx, x, mid - ICON / 2);
    ctx.font = font(500, 14);
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.fillText(s.handle, x + ICON + 10, mid + 0.5);
    if (i > 0) {
      ctx.fillStyle = b.divider;
      ctx.fillRect(b.x + seg * i - 1, mid - 10, 2, 20);
    }
  });
  ctx.restore();
}

// ---------- Text ----------

function wrap(ctx, text, maxW, maxLines = Infinity) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxW) {
      line = next;
      continue;
    }
    if (line) lines.push(line);
    // A single word wider than the column gets broken by characters.
    line = "";
    for (const ch of word) {
      if (ctx.measureText(line + ch).width > maxW && line) {
        lines.push(line);
        line = ch;
      } else line += ch;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (last && ctx.measureText(`${last}…`).width > maxW) last = last.slice(0, -1);
    kept[maxLines - 1] = `${last.trimEnd()}…`;
    return kept;
  }
  return lines;
}

function setText(ctx, weight, size, color, spacing = 0) {
  ctx.font = font(weight, size);
  ctx.fillStyle = color;
  ctx.letterSpacing = `${spacing}px`;
}

function textBlock(ctx, lines, x, y, lineH, draw) {
  if (draw) lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineH));
  return lines.length * lineH;
}

// Lays out (and optionally draws) the info column at scale k. Returns the bottom y.
function renderInfo(ctx, data, k, draw) {
  const { x, w } = INFO;
  let y = INFO.y;
  ctx.textBaseline = "top";
  ctx.textAlign = "left";

  // Name: shrink until every word fits and the whole name sits on 2 lines.
  const name = data.name.trim() || PLACEHOLDERS.name;
  const words = name.split(/\s+/);
  let nameSize = 34 * k;
  setText(ctx, 800, nameSize, COLORS.green, -0.4);
  const tooBig = () => words.some((word) => ctx.measureText(word).width > w) || wrap(ctx, name, w).length > 2;
  while (nameSize > 18 && tooBig()) {
    nameSize -= 1;
    setText(ctx, 800, nameSize, COLORS.green, -0.4);
  }
  y += textBlock(ctx, wrap(ctx, name, w, 2), x, y, nameSize * 1.12, draw);
  y += 8 * k;

  const role = (data.role.trim() || PLACEHOLDERS.role).toUpperCase();
  const roleSize = 12.5 * k;
  setText(ctx, 600, roleSize, COLORS.gold, 1.6 * k);
  y += textBlock(ctx, wrap(ctx, role, w, 2), x, y, roleSize * 1.45, draw);

  y += 14 * k;
  if (draw) {
    ctx.fillStyle = COLORS.rule;
    ctx.fillRect(x, y, 40, 2.5);
  }
  y += 20 * k;

  const label = (text) => {
    const size = 10 * k;
    setText(ctx, 700, size, "rgba(11, 50, 47, 0.55)", 2.6 * k);
    if (draw) ctx.fillText(text, x, y);
    y += size * 1.2 + 9 * k;
  };

  label("ABOUT");
  const bio = data.bio.trim() || PLACEHOLDERS.bio;
  const bioSize = 14 * k;
  setText(ctx, 400, bioSize, COLORS.ink);
  y += textBlock(ctx, wrap(ctx, bio, w, 7), x, y, bioSize * 1.55, draw);

  const badges = data.badges.filter((b) => b.label.trim() || b.desc.trim());
  if (badges.length) {
    y += 22 * k;
    label("HIGHLIGHTS");
    const gap = 14 * k;
    const colW = (w - gap) / 2;
    const pad = 10 * k;
    for (let i = 0; i < badges.length; i += 2) {
      let rowH = 0;
      badges.slice(i, i + 2).forEach((b, j) => {
        const cx = x + j * (colW + gap);
        let cy = y;
        const titleSize = 12.5 * k;
        setText(ctx, 700, titleSize, COLORS.green, 0.2);
        cy += textBlock(ctx, wrap(ctx, b.label.trim(), colW - pad, 2), cx + pad, cy, titleSize * 1.3, draw);
        if (b.desc.trim()) {
          cy += 3 * k;
          const descSize = 11 * k;
          setText(ctx, 400, descSize, COLORS.muted);
          cy += textBlock(ctx, wrap(ctx, b.desc.trim(), colW - pad, 3), cx + pad, cy, descSize * 1.4, draw);
        }
        if (draw) {
          ctx.fillStyle = COLORS.rule;
          ctx.fillRect(cx, y + 1, 2, cy - y - 2);
        }
        rowH = Math.max(rowH, cy - y);
      });
      y += rowH + 14 * k;
    }
    y -= 14 * k;
  }

  ctx.letterSpacing = "0px";
  return y;
}

function drawInfo(ctx, data) {
  // Shrink everything together until the column fits above the badge strip.
  let k = 1;
  while (k > 0.7 && renderInfo(ctx, data, k, false) > INFO.bottom) k -= 0.03;
  renderInfo(ctx, data, k, true);
}
