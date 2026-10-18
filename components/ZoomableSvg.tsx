"use client";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export type View = { k: number; x: number; y: number };
const MIN_K = 1, MAX_K = 8;

// Keep the content covering the frame, so the map cannot be dragged away or slide off vertically.
const clamp = (v: View, w: number, h: number): View => ({
  k: v.k,
  x: Math.min(0, Math.max(w * (1 - v.k), v.x)),
  y: Math.min(0, Math.max(h * (1 - v.k), v.y)),
});

// Pan and zoom for an SVG: wheel or buttons, drag to pan. `home` is the framing the Reset button returns to.
export function ZoomableSvg({ w, h, home = { k: 1, x: 0, y: 0 }, resetKey, children, className, style, label }: {
  w: number; h: number; home?: View; resetKey?: string; children: ReactNode; className?: string; style?: React.CSSProperties; label: string;
}) {
  const [v, setV] = useState<View>(home);
  const ref = useRef<SVGSVGElement>(null);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const homeRef = useRef(home);
  homeRef.current = home;

  // New framing (for example the scope changed): jump to it.
  useEffect(() => { setV(homeRef.current); }, [resetKey]);

  const zoomAt = useCallback((factor: number, cx: number, cy: number) => {
    setV((o) => {
      const k = Math.min(MAX_K, Math.max(MIN_K, o.k * factor));
      const f = k / o.k;
      return clamp({ k, x: cx - (cx - o.x) * f, y: cy - (cy - o.y) * f }, w, h);
    });
  }, []);

  // Point in viewBox units from a client position.
  const toBox = (cx: number, cy: number) => {
    const r = ref.current!.getBoundingClientRect();
    return [((cx - r.left) / r.width) * w, ((cy - r.top) / r.height) * h] as const;
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const [x, y] = toBox(e.clientX, e.clientY);
      zoomAt(e.deltaY < 0 ? 1.2 : 1 / 1.2, x, y);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  });

  const onDown = (e: React.PointerEvent) => {
    if ((e.target as Element).closest("button")) return;
    drag.current = { x: e.clientX, y: e.clientY, moved: false };
    const move = (m: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const dx = m.clientX - d.x, dy = m.clientY - d.y;
      if (!d.moved && Math.hypot(dx, dy) < 5) return;
      d.moved = true;
      const r = ref.current!.getBoundingClientRect();
      d.x = m.clientX; d.y = m.clientY;
      setV((o) => clamp({ ...o, x: o.x + (dx / r.width) * w, y: o.y + (dy / r.height) * h }, w, h));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setTimeout(() => { drag.current = null; }, 0);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  // A drag must not count as a click on a region or buyer underneath.
  const onClickCapture = (e: React.MouseEvent) => { if (drag.current?.moved) { e.stopPropagation(); e.preventDefault(); } };

  return (
    <div style={{ position: "relative", ...style }} className={className}>
      <svg ref={ref} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label} onPointerDown={onDown} onClickCapture={onClickCapture}
        style={{ width: "100%", height: "auto", display: "block", touchAction: "none", cursor: v.k > 1 ? "grab" : "default" }}>
        <g transform={`translate(${v.x} ${v.y}) scale(${v.k})`}>{children}</g>
      </svg>
      <div className="zoom-ctl" style={{ position: "absolute", right: 10, top: 10, display: "flex", flexDirection: "column", gap: 4 }}>
        <button type="button" aria-label="Zoom in" onClick={() => zoomAt(1.5, w / 2, h / 2)}>+</button>
        <button type="button" aria-label="Zoom out" onClick={() => zoomAt(1 / 1.5, w / 2, h / 2)}>−</button>
        <button type="button" aria-label="Reset map" onClick={() => setV(home)} style={{ fontSize: 12 }}>⌂</button>
      </div>
    </div>
  );
}
