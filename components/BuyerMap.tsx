"use client";
import { offerData, cropLabel } from "@/lib/data";
import type { Offer } from "@/lib/contracts";
import offers from "@/data/offers.json";

export const TYPE_COLOR: Record<string, string> = {
  "Food processor": "#2f6a49",
  "Feed company": "#3e6a8a",
  "Biogas plant": "#b8761f",
  "Cooperative": "#7a4f8a",
  "Trader": "#8a4a3a",
};

// Map of north-west France (simplified outline, real town positions). Equirectangular, scaled at 48° N.
const LON0 = -3.4, LON1 = 5.4, LAT0 = 45.7, LAT1 = 50.3;
const K = 105; // px per degree of latitude
const W = (LON1 - LON0) * Math.cos((48 * Math.PI) / 180) * K;
const H = (LAT1 - LAT0) * K;
const px = (lon: number, lat: number): [number, number] => [(lon - LON0) * Math.cos((48 * Math.PI) / 180) * K, (LAT1 - lat) * K];
const path = (pts: [number, number][], close = false) =>
  pts.map(([lo, la], i) => `${i ? "L" : "M"}${px(lo, la).map((v) => v.toFixed(1)).join(" ")}`).join(" ") + (close ? " Z" : "");

const FRANCE: [number, number][] = [
  [2.55, 51.08], [1.6, 50.95], [1.55, 50.2], [1.1, 49.95], [0.1, 49.5], [-0.3, 49.3], [-1.2, 49.4], [-1.25, 49.7], [-1.85, 49.65],
  [-1.6, 48.7], [-2.4, 48.65], [-3.2, 48.85], [-3.6, 48.7], [-4.7, 48.55], [-4.3, 48.0], [-3.2, 47.75], [-2.4, 47.4], [-2.1, 47.1],
  [-1.9, 46.7], [-1.2, 46.2], [-1.15, 45.6], [-1.15, 44.5], [-1.3, 43.4], [2, 43.2], [6, 43.2], [7.2, 44.2], [6.9, 45.5], [6.0, 46.2],
  [6.8, 47.0], [7.6, 47.6], [7.6, 48.9], [6.2, 49.5], [5.0, 49.6], [4.2, 49.95], [3.6, 50.4],
];
const LOIRE: [number, number][] = [[3.16, 46.99], [2.4, 47.35], [1.91, 47.9], [1.33, 47.55], [0.69, 47.39], [-0.1, 47.4], [-0.55, 47.47], [-1.55, 47.22]];
const SEINE: [number, number][] = [[4.07, 48.3], [3.0, 48.4], [2.35, 48.86], [1.5, 49.1], [1.1, 49.44], [0.1, 49.49]];
const PARIS: [number, number] = [2.35, 48.86];

type Props = { selected?: string | null; onSelect?: (id: string | null) => void; visible?: string[] };

export function BuyerMap({ selected = null, onSelect, visible }: Props) {
  const farm = offers.farm;
  const [fx, fy] = px(farm.lon, farm.lat);
  const list = (offerData as Offer[]).filter((o) => !visible || visible.includes(o.id));
  const sel = list.find((o) => o.id === selected);
  const [px0, py0] = px(PARIS[0], PARIS[1]);
  return (
    <svg viewBox={`0 0 ${W.toFixed(0)} ${H.toFixed(0)}`} className="buyermap" style={{ width: "100%", height: "auto", display: "block", borderRadius: 12, border: "1px solid var(--line)" }} role="img" aria-label="Map of buyers around your farm in Centre-Val de Loire">
      <rect width={W} height={H} fill="#dde6e3" />
      <path d={path(FRANCE, true)} fill="#efe8d7" stroke="#cfc4aa" strokeWidth="1.2" />
      <path d={path(LOIRE)} fill="none" stroke="#a9c1cc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d={path(SEINE)} fill="none" stroke="#a9c1cc" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      {[100, 200].map((km) => (
        <g key={km}>
          <circle cx={fx} cy={fy} r={(km / 111) * K} fill="none" stroke="#14261c" strokeOpacity="0.22" strokeDasharray="3 6" />
          <text x={fx + 4} y={fy - (km / 111) * K - 5} fontSize="11" fill="#6f7568" letterSpacing="0.08em">{km} KM</text>
        </g>
      ))}
      <circle cx={px0} cy={py0} r="3" fill="#9a9a8a" />
      <text x={px0 + 7} y={py0 + 4} fontSize="11" fill="#8a8a7a">Paris</text>

      {sel && (() => {
        const p = sel.partner;
        const [x1, y1] = px(sel.lon, sel.lat), [x2, y2] = px(p.lon, p.lat);
        return (
          <g>
            <path d={`M${fx} ${fy} L${x2} ${y2}`} stroke="#b8761f" strokeWidth="1.6" strokeDasharray="4 4" fill="none" />
            <rect x={x2 - 6} y={y2 - 6} width="12" height="12" fill="#b8761f" stroke="#fbf9f4" strokeWidth="2" />
            <text x={x2 + 11} y={y2 + 4} fontSize="12" fontWeight="600" fill="#8a5a14">{p.buyer}, {p.town}</text>
            <path d={`M${fx} ${fy} L${x1} ${y1}`} stroke={TYPE_COLOR[sel.type]} strokeWidth="1.8" fill="none" />
          </g>
        );
      })()}

      {list.map((o) => {
        const [x, y] = px(o.lon, o.lat);
        const col = TYPE_COLOR[o.type] ?? "#14261c";
        const on = o.id === selected;
        const left = o.lon < farm.lon;
        return (
          <g key={o.id} style={{ cursor: onSelect ? "pointer" : "default" }} onClick={() => onSelect?.(on ? null : o.id)}>
            <circle cx={x} cy={y} r={on ? 17 : 13} fill={col} fillOpacity={on ? 0.25 : 0.15} />
            <circle cx={x} cy={y} r="7" fill={col} stroke="#fbf9f4" strokeWidth="2" />
            <text x={left ? x - 13 : x + 13} y={y - 3} textAnchor={left ? "end" : "start"} fontSize="12" fontWeight="700" fill="#14261c">{o.buyer}</text>
            <text x={left ? x - 13 : x + 13} y={y + 11} textAnchor={left ? "end" : "start"} fontSize="11" fill="#6f7568">{o.town} · {cropLabel(o.crop)}</text>
          </g>
        );
      })}

      <g>
        <circle cx={fx} cy={fy} r="15" fill="#1e4a32" />
        <path d={`M ${fx - 7} ${fy + 4} L ${fx} ${fy - 6} L ${fx + 7} ${fy + 4} Z`} fill="#f4f0e6" />
        <text x={fx} y={fy + 32} fontSize="11" fontWeight="700" textAnchor="middle" fill="#1e4a32" letterSpacing="0.06em">YOUR FARM</text>
      </g>
    </svg>
  );
}
