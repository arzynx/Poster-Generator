import { SOCIALS } from "./poster/layout.js";

const BADGE_EMOJI = ["⚡", "🌱", "💡", "🛠️"];
const SOCIAL_LABEL = { instagram: "📸 Instagram: @", linkedin: "💼 LinkedIn: ", whatsapp: "💬 WhatsApp: " };

function facts({ name, role, bio, badges }) {
  const full = name.trim();
  return {
    full,
    first: full.split(/\s+/)[0] || "",
    role: role.trim(),
    bio: bio.trim(),
    badges: badges.filter((b) => b.label.trim()).map((b) => ({ label: b.label.trim(), desc: b.desc.trim() })),
  };
}

const badgeLines = (badges, bullet) => badges.map((b, i) => `${bullet(i)} ${b.label}${b.desc ? ` · ${b.desc}` : ""}`);

const socials = () => SOCIALS.map((s) => `${SOCIAL_LABEL[s.icon]}${s.handle}`);

const block = (...parts) => parts.filter((p) => p && p.length).map((p) => (Array.isArray(p) ? p.join("\n") : p)).join("\n\n");

const TONES = {
  hype(f) {
    const who = f.full ? `Say hello to ${f.full}${f.role ? `, ${f.role}` : ""}!` : "Say hello to the newest face in the crate!";
    return block(
      "🚀 NEW CREW MEMBER ALERT 🚀",
      `${who} Officially part of the Code Crate Community and ready to build. 🔥`,
      f.bio && `💬 "${f.bio}"`,
      f.badges.length && [`What ${f.first || "they"} bring${f.first ? "s" : ""} to the crate:`, ...badgeLines(f.badges, (i) => BADGE_EMOJI[i % 4])],
      `Connect. Collaborate. Grow. Drop a 👋 in the comments and give ${f.first || "them"} a proper Code Crate welcome!`,
      socials(),
      "#CodeCrate #MoreThanJustCode #BuildInPublic #TechCommunity #Developers #StudentDevelopers #CodeBuildCreate"
    );
  },
  warm(f) {
    const who = f.full ? `Everyone, meet ${f.full}${f.role ? `, ${f.role}` : ""}. 💚` : "Everyone, meet the newest member of our crew. 💚";
    return block(
      `Our crate just got a little bigger. ✨`,
      who,
      f.bio,
      f.badges.length && ["A few things we already love:", ...badgeLines(f.badges, () => "•")],
      `${f.first ? `So glad to have you here, ${f.first}.` : "So glad to have you here."} Here's to late-night builds, shared wins and learning together. 🤝`,
      socials()
    );
  },
  pro(f) {
    const who = f.full
      ? `We're excited to welcome ${f.full}${f.role ? `, ${f.role},` : ""} to the Code Crate Tech Community.`
      : "We're excited to welcome a new member to the Code Crate Tech Community.";
    return block(
      who,
      f.bio,
      f.badges.length && ["Highlights:", ...badgeLines(f.badges, () => "▸")],
      "Code Crate is a student-led community where developers connect, collaborate and grow by building real projects together.",
      `${f.first ? `Welcome aboard, ${f.first}!` : "Welcome aboard!"} We can't wait to see what you build.`,
      SOCIALS.map((s) => `${s.icon === "instagram" ? "Instagram: @" : s.icon === "linkedin" ? "LinkedIn: " : "WhatsApp: "}${s.handle}`),
      "#CodeCrate #TechCommunity #SoftwareDevelopment #StudentDevelopers #Collaboration"
    );
  },
};

export function buildCaption(data, tone = "hype") {
  return TONES[tone](facts(data));
}
