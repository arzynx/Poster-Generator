const COLORS = ["#0b322f", "#e0b450", "#9fd8b8", "#ffb48a", "#c9b6f2"];

export function burstConfetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const layer = document.createElement("div");
  layer.className = "confetti";
  for (let i = 0; i < 60; i++) {
    const bit = document.createElement("i");
    bit.style.setProperty("--x", `${(Math.random() - 0.5) * 120}vw`);
    bit.style.setProperty("--y", `${-40 - Math.random() * 50}vh`);
    bit.style.setProperty("--r", `${Math.random() * 720 - 360}deg`);
    bit.style.setProperty("--d", `${0.9 + Math.random() * 0.8}s`);
    bit.style.background = COLORS[i % COLORS.length];
    layer.appendChild(bit);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 2000);
}
