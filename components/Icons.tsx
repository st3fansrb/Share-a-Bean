// Line icons, 24px grid, stroke inherits currentColor.
const P = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, viewBox: "0 0 24 24" };

export const icons = {
  home: <svg {...P}><path d="M4 11 12 4l8 7" /><path d="M6 10v9h12v-9" /><path d="M10 19v-5h4v5" /></svg>,
  farm: <svg {...P}><path d="M3 20h18" /><path d="M5 20V10l5-4 5 4v10" /><path d="M15 20v-6h4v6" /><path d="M8.5 20v-4h3v4" /></svg>,
  opportunities: <svg {...P}><circle cx="12" cy="10" r="3" /><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z" /></svg>,
  contracts: <svg {...P}><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4" /><path d="M10 12h5M10 16h5" /></svg>,
  calculator: <svg {...P}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8" /><path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01" /></svg>,
  cap: <svg {...P}><path d="M12 3 4 6v6c0 4.5 3.4 7.8 8 9 4.6-1.2 8-4.5 8-9V6z" /><path d="m9 12 2 2 4-4" /></svg>,
  insights: <svg {...P}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>,
  knowledge: <svg {...P}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" /></svg>,
  arrow: <svg {...P} width="14" height="14"><path d="M5 12h14M13 6l6 6-6 6" /></svg>,
  pin: <svg {...P} width="14" height="14"><circle cx="12" cy="10" r="2.5" /><path d="M12 21s-6.5-5.8-6.5-11a6.5 6.5 0 0 1 13 0c0 5.2-6.5 11-6.5 11Z" /></svg>,
};

// Brand mark: a bean pod split open, three seeds.
export function BeanMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <circle cx="20" cy="20" r="19" fill="#1e4a32" />
      <path d="M9 25c4-10 14-15 23-14-2 9-10 17-21 17z" fill="#f4f0e6" />
      <circle cx="15.5" cy="23" r="2.4" fill="#b8761f" />
      <circle cx="20.5" cy="19.5" r="2.4" fill="#b8761f" />
      <circle cx="25.5" cy="16" r="2.4" fill="#b8761f" />
    </svg>
  );
}
