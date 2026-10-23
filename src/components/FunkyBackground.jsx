import { useEffect, useRef } from "react";

const INK = "#0b322f";
const stroke = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round", strokeLinecap: "round" };

const SHAPES = {
  blob: (fill) => <path {...stroke} fill={fill} d="M52 6c20 2 40 18 40 40s-14 44-40 44S8 74 8 50 30 4 52 6Z" />,
  star: (fill) => <path {...stroke} fill={fill} d="M50 6l11 28 30 2-23 19 8 30-26-17-26 17 8-30L9 36l30-2Z" />,
  ring: (fill) => (
    <>
      <circle {...stroke} cx="50" cy="50" r="38" fill={fill} />
      <circle {...stroke} cx="50" cy="50" r="16" fill="#fbf6ea" />
    </>
  ),
  squiggle: () => <path {...stroke} strokeWidth="7" fill="none" d="M6 60c10-24 20-24 30 0s20 24 30 0 20-24 28 0" />,
  triangle: (fill) => <path {...stroke} fill={fill} d="M50 10 90 84H10Z" />,
  plus: (fill) => <path {...stroke} fill={fill} d="M38 8h24v30h30v24H62v30H38V62H8V38h30Z" />,
  code: () => (
    <g {...stroke} strokeWidth="8" fill="none">
      <path d="M30 28 10 50l20 22M70 28l20 22-20 22M58 20 42 80" />
    </g>
  ),
  pill: (fill) => <rect {...stroke} fill={fill} x="8" y="32" width="84" height="36" rx="18" />,
  burst: (fill) => (
    <path {...stroke} fill={fill} d="M50 4l8 18 18-10-4 20 20 4-16 12 12 16-20-2-2 20-14-14-14 14-2-20-20 2 12-16L8 36l20-4-4-20 18 10Z" />
  ),
  dots: () => (
    <g fill={INK}>
      {[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => <circle key={`${r}${c}`} cx={20 + c * 30} cy={20 + r * 30} r="6" />))}
    </g>
  ),
};

// x/y in viewport %, size in px, depth drives mouse parallax, dur/delay in s.
const LAYOUT = [
  { shape: "blob", fill: "#9fd8b8", x: 3, y: 12, size: 120, depth: 18, dur: 14, delay: 0 },
  { shape: "star", fill: "#ffe08a", x: 44, y: 6, size: 64, depth: 30, dur: 11, delay: -3 },
  { shape: "ring", fill: "#ffb48a", x: 92, y: 18, size: 90, depth: 22, dur: 16, delay: -6 },
  { shape: "squiggle", x: 38, y: 48, size: 110, depth: 14, dur: 12, delay: -2 },
  { shape: "triangle", fill: "#c9b6f2", x: 90, y: 62, size: 80, depth: 26, dur: 13, delay: -8 },
  { shape: "code", x: 6, y: 58, size: 80, depth: 20, dur: 15, delay: -5 },
  { shape: "plus", fill: "#ffb48a", x: 52, y: 88, size: 56, depth: 34, dur: 10, delay: -1 },
  { shape: "pill", fill: "#9fd8b8", x: 80, y: 90, size: 100, depth: 16, dur: 17, delay: -9 },
  { shape: "burst", fill: "#ffe08a", x: 2, y: 88, size: 90, depth: 24, dur: 18, delay: -4 },
  { shape: "dots", x: 66, y: 4, size: 70, depth: 12, dur: 20, delay: -7 },
  { shape: "star", fill: "#c9b6f2", x: 96, y: 42, size: 48, depth: 36, dur: 9, delay: -2 },
  { shape: "ring", fill: "#ffe08a", x: 24, y: 94, size: 58, depth: 28, dur: 12, delay: -10 },
];

export default function FunkyBackground() {
  const ref = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const onMove = (e) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        ref.current.style.setProperty("--mx", (e.clientX / window.innerWidth - 0.5).toFixed(3));
        ref.current.style.setProperty("--my", (e.clientY / window.innerHeight - 0.5).toFixed(3));
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="funky-bg" ref={ref} aria-hidden="true">
      {LAYOUT.map((s, i) => (
        <div
          key={i}
          className="funky-shape"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            "--depth": s.depth,
            "--dur": `${s.dur}s`,
            "--delay": `${s.delay}s`,
            "--spin": i % 2 ? "-1" : "1",
          }}
        >
          <svg viewBox="0 0 100 100" overflow="visible">
            {SHAPES[s.shape](s.fill)}
          </svg>
        </div>
      ))}
    </div>
  );
}
