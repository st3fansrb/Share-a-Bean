"use client";
import { useMemo, useState } from "react";
import { BY, CROPS, ME, SEED, SRC, ZONE, entries, fmtN, refT, type CropRef, type Thread } from "@/lib/knowledge-hub";

type Tab = "discuss" | "bench" | "data";
const MIN_FARMS = 10;
const TABS: [Tab, string][] = [["discuss", "Discussion"], ["bench", "Yield benchmark"], ["data", "Reference data"]];
const pctStr = (a: number, b: number) => { const d = ((a - b) / b) * 100; return `${d >= 0 ? "+" : ""}${d.toFixed(0)}%`; };

function Link({ k, long }: { k: keyof typeof SRC; long?: boolean }) {
  return <a href={SRC[k].url} target="_blank" rel="noopener noreferrer">{long ? SRC[k].title : SRC[k].short}</a>;
}

export default function Hub() {
  const [tab, setTab] = useState<Tab>("discuss");
  const [filter, setFilter] = useState("All");
  const [threads, setThreads] = useState<Thread[]>(SEED);
  const [activeId, setActiveId] = useState(0);
  const [newTitle, setNewTitle] = useState(""), [newBody, setNewBody] = useState(""), [newCrop, setNewCrop] = useState("soy");
  const [reply, setReply] = useState("");
  const [b, setB] = useState({ crop: "soy", variety: "", yield: "", sow: "", water: "Dry", rain: "", cost: "", soil: "Argilo-calcaire", inoc: "Peat" });
  const [submitted, setSubmitted] = useState(false), [err, setErr] = useState("");

  const visible = threads.filter((t) => filter === "All" || t.crop === filter);
  const active = threads.find((t) => t.id === activeId);
  const goDiscuss = (crop: string) => {
    const first = threads.find((t) => crop === "All" || t.crop === crop);
    setFilter(crop); setActiveId(first ? first.id : -1); setReply("");
    if (crop !== "All") setNewCrop(crop);
  };
  const postThread = () => {
    if (!newTitle.trim()) return;
    const id = threads.length;
    setThreads([{ id, crop: newCrop, title: newTitle.trim(), body: newBody.trim(), handle: ME, ago: "now", replies: [] }, ...threads]);
    setActiveId(id); if (filter !== "All" && filter !== newCrop) setFilter("All");
    setNewTitle(""); setNewBody("");
  };
  const postReply = () => {
    if (!reply.trim() || !active) return;
    setThreads(threads.map((t) => (t.id === active.id ? { ...t, replies: [...t.replies, { handle: ME, ago: "now", body: reply.trim() }] } : t)));
    setReply("");
  };

  const c = BY[b.crop];
  const ys = useMemo(() => entries(c), [c]);
  const you = parseFloat(b.yield);
  const submit = () => {
    if (isNaN(you) || you <= 0) return setErr("Enter your yield in t/ha to compare.");
    if (ys.length < MIN_FARMS) return setErr(`Not enough farms in your zone have reported ${c.label.toLowerCase()} yet to protect anonymity.`);
    setSubmitted(true); setErr("");
  };
  const refs = [
    ...(c.y25 != null ? [{ v: c.y25 / 10, label: `France 2025 ${(c.y25 / 10).toFixed(2)}` }] : []),
    ...(c.reg ? [{ v: c.reg.q / 10, label: `${c.reg.label} ${(c.reg.q / 10).toFixed(2)}` }] : []),
  ];
  const hist = useMemo(() => {
    const all = [...ys, ...refs.map((r) => r.v), ...(isNaN(you) ? [] : [you])];
    const lo = Math.floor(Math.min(...all) * 4) / 4, hi = Math.ceil(Math.max(...all) * 4) / 4 + 0.25;
    const nb = Math.max(1, Math.round((hi - lo) / 0.25)), counts = new Array(nb).fill(0);
    ys.forEach((y) => counts[Math.min(nb - 1, Math.floor((y - lo) / 0.25))]++);
    return { lo, hi, counts, yb: isNaN(you) ? -1 : Math.min(nb - 1, Math.floor((you - lo) / 0.25)), mx: Math.max(...counts, 1) };
  }, [ys, you, c]); // eslint-disable-line react-hooks/exhaustive-deps
  const sowStr = b.sow ? new Date(b.sow).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—";
  const youMap = { water: b.water, sow: sowStr, soil: b.soil, variety: b.variety || "—", "—": "—" } as const;
  const upd = (k: keyof typeof b) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setB({ ...b, [k]: e.target.value });

  const stat = (cr: CropRef) => cr.y25 != null;
  return (
    <div className="kh">
      <div className="kh-top">
        <div className="seg" role="tablist" aria-label="Knowledge Hub sections">
          {TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>)}
        </div>
        <div className="kh-who">
          <span className="place">{ZONE.name}</span>
          <span className="chip legume">You are {ME}</span>
        </div>
      </div>

      {tab === "discuss" && (
        <div className="kh-discuss card">
          <aside>
            <p className="eyebrow">Crops</p>
            {[{ key: "All", label: "All crops" }, ...CROPS].map((cr) => {
              const n = cr.key === "All" ? threads.length : threads.filter((t) => t.crop === cr.key).length;
              return (
                <button key={cr.key} className={`kh-crop ${filter === cr.key ? "on" : ""}`} onClick={() => goDiscuss(cr.key)}>
                  <span>{cr.label}</span><span>{n}</span>
                </button>
              );
            })}
            <p className="note kh-side-note">You&rsquo;re matched with farms in {ZONE.name}. Names and locations are never shown. Conversations here are sample content.</p>
          </aside>

          <section className="kh-list">
            <h2>{filter === "All" ? "All threads in your zone" : BY[filter].label}</h2>
            <div className="kh-compose">
              <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Ask your zone a question" aria-label="Question title" />
              {newTitle.length > 0 && (
                <>
                  <textarea value={newBody} onChange={(e) => setNewBody(e.target.value)} placeholder="Add detail (optional)" rows={3} />
                  <div className="row">
                    <select value={newCrop} onChange={(e) => setNewCrop(e.target.value)} aria-label="Crop">{CROPS.map((cr) => <option key={cr.key} value={cr.key}>{cr.label}</option>)}</select>
                    <button className="btn" onClick={postThread}>Post anonymously</button>
                  </div>
                </>
              )}
            </div>
            {visible.length === 0 && <p className="muted">No threads for this crop yet. Be the first to ask.</p>}
            {visible.map((t) => (
              <button key={t.id} className={`kh-thread ${t.id === activeId ? "on" : ""}`} onClick={() => { setActiveId(t.id); setReply(""); }}>
                <span className="eyebrow kh-cr">{BY[t.crop].label}</span>
                <b>{t.title}</b>
                <small>{t.handle} · {t.replies.length} replies · {t.ago}</small>
              </button>
            ))}
          </section>

          <section className="kh-detail">
            {active ? (
              <>
                <article>
                  <span className="eyebrow kh-cr">{BY[active.crop].label}</span>
                  <h1>{active.title}</h1>
                  <small className="muted">{active.handle} · {active.ago}</small>
                  {active.body && <p>{active.body}</p>}
                </article>
                {stat(BY[active.crop]) && (
                  <div className="kh-ref">
                    <b className="eyebrow">Reference</b>
                    <span>
                      France 2025: {(BY[active.crop].y25! / 10).toFixed(2)} t/ha on {fmtN(BY[active.crop].a25!)} ha
                      {BY[active.crop].reg ? ` · ${BY[active.crop].reg!.label}: ${(BY[active.crop].reg!.q / 10).toFixed(2)} t/ha` : ""}
                    </span>
                    <Link k={BY[active.crop].nat!} />
                  </div>
                )}
                <div className="kh-replies">
                  {active.replies.map((r, i) => (
                    <div key={i} className="kh-reply">
                      <div><b className={r.handle === ME ? "me" : ""}>{r.handle}</b><small>{r.ago}</small></div>
                      <p>{r.body}</p>
                    </div>
                  ))}
                </div>
                <div className="kh-post">
                  <textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Reply anonymously" rows={3} />
                  <div className="row">
                    <small className="muted">Posting as {ME}. Your handle stays the same across threads so neighbours can follow your experience.</small>
                    <button className="btn" onClick={postReply}>Reply</button>
                  </div>
                </div>
              </>
            ) : <p className="muted">Select a thread.</p>}
          </section>
        </div>
      )}

      {tab === "bench" && (
        <div className="kh-bench">
          <section className="card kh-form">
            <h2>Your season</h2>
            <p className="muted">Your yield is compared with official French statistics and with other farms in {ZONE.name}. Individual entries are never shown. Zone results appear once {MIN_FARMS} or more farms have reported a crop.</p>
            <div className="kh-fields">
              <div><label>Crop</label><select value={b.crop} onChange={(e) => { setB({ ...b, crop: e.target.value }); setSubmitted(false); setErr(""); }}>{CROPS.map((cr) => <option key={cr.key} value={cr.key}>{cr.label}</option>)}</select></div>
              <div><label>Variety</label><input value={b.variety} onChange={upd("variety")} placeholder={`e.g. ${c.vars[0]}`} /></div>
              <div><label>Yield (t/ha)</label><input type="number" step="0.01" value={b.yield} onChange={upd("yield")} placeholder={`e.g. ${refT(c).toFixed(1)}`} /></div>
              <div><label>Sowing date</label><input type="date" value={b.sow} onChange={upd("sow")} /></div>
              <div><label>Water</label><select value={b.water} onChange={upd("water")}><option value="Dry">Rainfed</option><option value="Irrigated">Irrigated</option></select></div>
              <div><label>Season rainfall (mm)</label><input type="number" value={b.rain} onChange={upd("rain")} placeholder="e.g. 310" /></div>
              <div><label>Soil type</label><select value={b.soil} onChange={upd("soil")}>{["Argilo-calcaire", "Limon profond", "Boulbène", "Sable"].map((x) => <option key={x}>{x}</option>)}</select></div>
              <div><label>Inoculant used</label><select value={b.inoc} onChange={upd("inoc")}>{["Peat", "Granular", "Liquid", "None"].map((x) => <option key={x}>{x}</option>)}</select></div>
              <div className="wide"><label>Input cost (€/ha)</label><input type="number" value={b.cost} onChange={upd("cost")} placeholder="e.g. 420" /></div>
            </div>
            <button className="btn kh-go" onClick={submit}>Compare anonymously →</button>
            {err && <p className="neg note">{err}</p>}
          </section>

          <section className="kh-result">
            <div className="card">
              <p className="eyebrow">{c.label} · {c.fr}</p>
              {stat(c) ? (
                <>
                  <div className="kh-three">
                    <div><small>France 2025</small><b className="num">{(c.y25! / 10).toFixed(2)}</b><small>t/ha · {fmtN(c.a25!)} ha</small></div>
                    <div><small>France 2024</small><b className="num">{(c.y24! / 10).toFixed(2)}</b><small>t/ha · {fmtN(c.a24!)} ha</small></div>
                    <div>
                      <small>{c.reg ? c.reg.label : "Change 2024→25"}</small>
                      <b className="num">{c.reg ? (c.reg.q / 10).toFixed(2) : pctStr(c.y25!, c.y24!)}</b>
                      <small>{c.reg ? `t/ha · ${c.reg.note}` : "national yield"}</small>
                    </div>
                  </div>
                  <p className="note">National figures: <Link k={c.nat!} long />. {c.reg && <>Regional figure: <Link k={c.reg.src} long />.</>}</p>
                </>
              ) : <p className="muted">No national grain-yield reference has been loaded for this crop yet. Results compare against farms in your zone only.</p>}
            </div>

            {submitted && (
              <>
                <div className="card kh-four">
                  <div><small>Your yield</small><b className="num hero">{you.toFixed(2)}</b><small>t/ha · {(you * 10).toFixed(1)} q/ha</small></div>
                  <div><small>vs France 2025</small><b className="num">{c.y25 != null ? pctStr(you, c.y25 / 10) : "—"}</b><small>Agreste national average</small></div>
                  <div><small>vs region</small><b className="num">{c.reg ? pctStr(you, c.reg.q / 10) : "—"}</b><small>{c.reg ? `${c.reg.label}, Terres Inovia` : "No regional figure loaded"}</small></div>
                  <div><small>Zone percentile</small><b className="num">{Math.round((ys.filter((y) => y < you).length / ys.length) * 100)}%</b><small>of {ys.length} zone entries (demo)</small></div>
                </div>

                <div className="card">
                  <div className="cardhead"><div><h3>Yield distribution in your zone</h3></div><span className="tag">Demo entries · not real farms</span></div>
                  <div className="kh-hist">
                    {hist.counts.map((n, i) => (
                      <div key={i} className={i === hist.yb ? "you" : ""}><span>{n || ""}</span><i style={{ height: `${(n / hist.mx) * 70}%` }} /></div>
                    ))}
                    {refs.map((r, i) => (
                      <div key={r.label} className="mark" style={{ left: `${(((r.v - hist.lo) / (hist.hi - hist.lo)) * 100).toFixed(2)}%` }}><span style={{ top: i * 18 }}>{r.label}</span></div>
                    ))}
                  </div>
                  <div className="kh-axis">{hist.counts.map((_, i) => <span key={i}>{(hist.lo + i * 0.25).toFixed(2)}</span>)}</div>
                  <p className="note">Farms per 0.25 t/ha band. Ochre marks your band. Dashed lines are published reference yields.</p>
                </div>

                <div className="card">
                  <h3 style={{ marginBottom: 10 }}>What French trials and harvest reviews found</h3>
                  {c.findings.length > 0 ? (
                    <div className="rc-scroll">
                      <table>
                        <thead><tr><th>Factor</th><th>Finding</th><th>Your entry</th><th>Source</th></tr></thead>
                        <tbody>{c.findings.map((f, i) => <tr key={i}><td><b>{f.factor}</b></td><td>{f.text}</td><td>{youMap[f.you]}</td><td><Link k={f.src} /></td></tr>)}</tbody>
                      </table>
                    </div>
                  ) : <p className="muted">No published practice findings have been loaded for this crop yet.</p>}
                </div>

                <div className="row kh-after">
                  <button className="btn ghost" onClick={() => { setTab("discuss"); goDiscuss(b.crop); }}>Discuss {c.label.toLowerCase()} with your zone →</button>
                  <button className="btn ghost" onClick={() => setSubmitted(false)}>Edit entry</button>
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {tab === "data" && (
        <div className="kh-data">
          <div>
            <h2>Reference data</h2>
            <p className="lede">Published French figures behind the benchmark. Yields from Agreste (French Ministry of Agriculture statistics) are national averages in q/ha, shown here in t/ha. 2025 figures are provisional.</p>
          </div>
          <div className="card rc-scroll">
            <table>
              <thead><tr><th>Crop</th><th>Area 2024 (ha)</th><th>Yield 2024 (t/ha)</th><th>Area 2025 (ha)</th><th>Yield 2025 (t/ha)</th><th>Source</th></tr></thead>
              <tbody>
                {CROPS.map((x) => (
                  <tr key={x.key}>
                    <td><b>{x.label}</b> <span className="muted">· {x.fr}</span></td>
                    <td className="num">{stat(x) ? fmtN(x.a24!) : "—"}</td><td className="num">{stat(x) ? (x.y24! / 10).toFixed(2) : "—"}</td>
                    <td className="num">{stat(x) ? fmtN(x.a25!) : "—"}</td><td className="num"><b>{stat(x) ? (x.y25! / 10).toFixed(2) : "—"}</b></td>
                    <td>{stat(x) ? <Link k={x.nat!} /> : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: 6 }}>Sources</h3>
            {Object.values(SRC).map((s) => (
              <div key={s.n} className="kh-src">
                <span className="big">{s.n}</span>
                <div><a href={s.url} target="_blank" rel="noopener noreferrer"><b>{s.title}</b></a><small className="muted">{s.used}</small></div>
              </div>
            ))}
          </div>
          <p className="note">Zone distributions, discussion threads and farmer handles here are demo content. In production they would come from anonymous farmer submissions.</p>
        </div>
      )}
    </div>
  );
}
