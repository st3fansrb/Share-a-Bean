import { offerData, cropLabel } from "@/lib/data";

// Schematic map, not geography: the farm in the centre, buyers placed by their distance.
const RADIUS_KM = 85;
const ANGLE: Record<string, number> = { o1: -35, o2: 200, o3: 115, o4: 150, o5: 20, o6: -80, o7: 245, o8: 70, o9: -150, o10: -10 };
export const TYPE_COLOR: Record<string, string> = {
  "Food processor": "#2f6a49",
  "Feed company": "#3e6a8a",
  "Biogas plant": "#b8761f",
  "Cooperative": "#7a4f8a",
};

export function BuyerMap() {
  const c = 170, scale = 150 / RADIUS_KM;
  return (
    <svg viewBox="0 0 340 340" className="buyermap" role="img" aria-label="Schematic map of buyers around your farm">
      <defs>
        <radialGradient id="land" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#efe8d7" />
          <stop offset="100%" stopColor="#e3dbc6" />
        </radialGradient>
      </defs>
      <rect width="340" height="340" rx="12" fill="url(#land)" />
      {/* contour lines */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={`M -10 ${60 + i * 48} C 80 ${30 + i * 52}, 160 ${110 + i * 40}, 350 ${50 + i * 50}`} fill="none" stroke="#cfc4aa" strokeWidth="0.8" opacity="0.7" />
      ))}
      {/* river */}
      <path d="M -10 230 C 60 210, 110 250, 170 228 S 280 180, 350 196" fill="none" stroke="#a9c1cc" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
      {/* distance rings */}
      {[30, 60].map((km) => (
        <g key={km}>
          <circle cx={c} cy={c} r={km * scale} fill="none" stroke="#14261c" strokeOpacity="0.25" strokeDasharray="3 5" />
          <text x={c + 4} y={c - km * scale - 5} fontSize="10" fill="#6f7568" letterSpacing="0.08em">{km} KM</text>
        </g>
      ))}
      {/* buyers */}
      {offerData.map((o) => {
        const a = (ANGLE[o.id] ?? 0) * (Math.PI / 180);
        const x = c + Math.cos(a) * o.distanceKm * scale;
        const y = c + Math.sin(a) * o.distanceKm * scale;
        const col = TYPE_COLOR[o.type] ?? "#14261c";
        return (
          <g key={o.id}>
            <line x1={c} y1={c} x2={x} y2={y} stroke={col} strokeOpacity="0.35" strokeWidth="1" />
            <circle cx={x} cy={y} r="13" fill={col} fillOpacity="0.15" />
            <circle cx={x} cy={y} r="6.5" fill={col} stroke="#fbf9f4" strokeWidth="2" />
            <text x={x} y={y + 24} fontSize="11" fontWeight="600" textAnchor="middle" fill="#14261c">{o.buyer}</text>
            <text x={x} y={y + 37} fontSize="10" textAnchor="middle" fill="#6f7568">{cropLabel(o.crop)}, {o.distanceKm} km</text>
          </g>
        );
      })}
      {/* farm */}
      <g>
        <circle cx={c} cy={c} r="16" fill="#1e4a32" />
        <path d={`M ${c - 7} ${c + 4} L ${c} ${c - 6} L ${c + 7} ${c + 4} Z`} fill="#f4f0e6" />
        <text x={c} y={c + 32} fontSize="11" fontWeight="700" textAnchor="middle" fill="#1e4a32" letterSpacing="0.06em">YOUR FARM</text>
      </g>
    </svg>
  );
}
