import { ImageResponse } from "next/og";

export const alt = "Fantômes — Tu paies des abonnements que tu n’utilises plus. On les trouve en 2 minutes.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#f5f1e8",
          color: "#18181f",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 36 }}>
          <svg width="44" height="52" viewBox="0 0 48 56">
            <path d="M24 3C12.4 3 5 11.6 5 23v27.5c0 1.6 1.9 2.4 3 1.3l4.3-4.3 5.2 5.2c.8.8 2 .8 2.8 0L24 49l3.7 3.7c.8.8 2 .8 2.8 0l5.2-5.2 4.3 4.3c1.1 1.1 3 .3 3-1.3V23C43 11.6 35.6 3 24 3Z" fill="#18181f" />
            <ellipse cx="17.5" cy="24" rx="3" ry="4" fill="#f5f1e8" />
            <ellipse cx="30.5" cy="24" rx="3" ry="4" fill="#f5f1e8" />
          </svg>
          Fantômes
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 72, lineHeight: 1.05 }}>
          <span>Tu paies des abonnements que tu n’utilises plus.</span>
          <span style={{ color: "#e0522d", marginTop: 12 }}>On les trouve en 2 minutes.</span>
        </div>
        <div style={{ fontSize: 30, color: "#2e6b4e" }}>Ton relevé ne quitte jamais ton téléphone.</div>
      </div>
    ),
    { ...size },
  );
}
