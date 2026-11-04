/** Le petit fantôme maison — une forme simple, sans emoji. */
export function Fantome({ className = "", couleur = "currentColor" }: { className?: string; couleur?: string }) {
  return (
    <svg viewBox="0 0 48 56" className={className} aria-hidden="true" focusable="false">
      <path
        d="M24 3C12.4 3 5 11.6 5 23v27.5c0 1.6 1.9 2.4 3 1.3l4.3-4.3 5.2 5.2c.8.8 2 .8 2.8 0L24 49l3.7 3.7c.8.8 2 .8 2.8 0l5.2-5.2 4.3 4.3c1.1 1.1 3 .3 3-1.3V23C43 11.6 35.6 3 24 3Z"
        fill={couleur}
      />
      <ellipse cx="17.5" cy="24" rx="3" ry="4" fill="#f5f1e8" />
      <ellipse cx="30.5" cy="24" rx="3" ry="4" fill="#f5f1e8" />
    </svg>
  );
}
