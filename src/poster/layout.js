// All poster coordinates are in template pixels (the Canva export is 852 x 1280).
// Swapping in a higher-res export with the same 2:3 ratio needs no changes here.
export const TEMPLATE = { width: 852, height: 1280 };

// Inside the dark border of the white photo frame.
export const PHOTO = { x: 65, y: 446, w: 368, h: 423, r: 13 };

// The blank column to the right of the photo, below "CODE CRATE / TECH COMMUNITY".
export const INFO = { x: 478, y: 548, w: 348, bottom: 960 };

// Inside of the dark social pill at the bottom (keeps the template's gold edge).
// The template's baked-in handles are painted over and redrawn from SOCIALS.
export const SOCIAL_BAR = { x: 116, y: 1183, w: 620, h: 37, r: 18, fill: "#0a312e", divider: "#a0ae95" };

export const SOCIALS = [
  { icon: "instagram", handle: "code._crate" },
  { icon: "linkedin", handle: "Code Crate" },
  { icon: "whatsapp", handle: "Code Crate" },
];

export const COLORS = {
  green: "#0b322f",
  gold: "#a8812f",
  rule: "#c9a24a",
  ink: "#24332f",
  muted: "#5f6d68",
  vignette: "4, 20, 18",
};

export const PLACEHOLDERS = {
  name: "Your Name",
  role: "Your Role / Title",
  bio: "Write a short bio about your tech journey, passion, or experience...",
};

// One pick sets both the export width and the caption tone. Every export keeps the
// poster's own 2:3 shape, so nothing is cropped, stretched or padded.
const platform = (id, label, hint, width, tone) => ({ id, label, hint, width, height: Math.round((width * TEMPLATE.height) / TEMPLATE.width), tone });

export const PLATFORMS = [
  platform("instagram", "Instagram", "Post", 1080, "hype"),
  platform("linkedin", "LinkedIn", "Post", 1200, "pro"),
  platform("whatsapp", "WhatsApp", "Status", 1080, "warm"),
];
