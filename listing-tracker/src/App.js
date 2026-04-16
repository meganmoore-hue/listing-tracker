import { useState, useEffect } from "react";

const SUPABASE_URL = "https://itaknbyxncqephpnkijk.supabase.co";
const SUPABASE_KEY = "sb_publishable_dregYVf-GNRBiuya7BZYJA_ynvJWYVj";

const db = async (path, opts = {}) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: opts.prefer || "return=representation",
    },
    ...opts,
  });
  if (!res.ok) { const e = await res.text(); throw new Error(e); }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

const PHASE_COLORS = [
  { bg: "#EBF3EB", border: "#2C5F2E", text: "#2C5F2E", dot: "#2C5F2E" },
  { bg: "#E6F1FB", border: "#185FA5", text: "#185FA5", dot: "#185FA5" },
  { bg: "#FBF5E9", border: "#C9A84C", text: "#9A7A2A", dot: "#C9A84C" },
  { bg: "#EEEDFE", border: "#534AB7", text: "#3C3489", dot: "#534AB7" },
  { bg: "#FAECE7", border: "#993C1D", text: "#712B13", dot: "#D85A30" },
  { bg: "#EAF3DE", border: "#3B6D11", text: "#27500A", dot: "#639922" },
];

const PHASES = [
  "Month 1 — Momentum", "Month 2 — Visibility", "Month 3 — Expansion",
  "Month 4 — Re-Engagement", "Month 5 — Reminder", "Month 6 — Final Push",
];

const REGULAR_CYCLE = [
  { phase: 0, tasks: ["Carousel 1", "Story 1", "Reel 1", "YouTube"] },
  { phase: 1, tasks: ["Story 2", "Google Profile", "Reel 2", "LinkedIn"] },
  { phase: 2, tasks: ["Story 3", "Carousel 2", "FB/IG Ad / Boost"] },
  { phase: 3, tasks: ["FB/IG Ad", "Story 4"] },
  { phase: 4, tasks: ["FB/IG Ad", "Story 5"] },
  { phase: 5, tasks: ["FB/IG Ad", "Story 5"] },
];

const LUXURY_CYCLE = [
  { phase: 0, tasks: ["Carousel 1", "Story 1", "Reel 1", "YouTube"] },
  { phase: 1, tasks: ["Story 2", "FB/IG Ad", "Google Profile", "Carousel 2"] },
  { phase: 2, tasks: ["Story 3", "LinkedIn", "FB/IG Ad", "Reel 2"] },
  { phase: 3, tasks: ["Story 4", "FB/IG Ad", "Story 5"] },
  { phase: 4, tasks: ["FB/IG Ad", "Story 6"] },
  { phase: 5, tasks: ["FB/IG Ad", "Story 6", "FB/IG Ad"] },
];

const WEEKLY = [
  { day: "Monday", title: "Personal post", note: "Every 3rd week: Agent Attraction" },
  { day: "Tuesday", title: "Listing content", note: "From active listings" },
  { day: "Wednesday", title: "Listing content", note: "From active listings" },
  { day: "Thursday", title: "Listing content", note: "From active listings" },
  { day: "Friday", title: "Value-add post", note: "Blog / tip content" },
];

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function genId() { return Math.random().toString(36).slice(2, 10); }
const parsePrice = s => { const n = parseFloat(String(s).replace(/[^0-9.]/g,"")); return isNaN(n) ? 0 : n; };
const daysOn = d => !d ? 0 : Math.max(0, Math.floor((Date.now() - new Date(d).getTime()) / 86400000));
const addDays = (dateStr, n) => { const d = new Date(dateStr); d.setDate(d.getDate() + n); return d.toISOString().split("T")[0]; };
const fmtDate = s => { if (!s) return ""; const d = new Date(s + "T00:00:00"); return d.toLocaleDateString("en-CA", { month: "short", day: "numeric" }); };
const fmtPrice = v => !v ? "" : Number(v).toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const getFirstDay = (y, m) => new Date(y, m, 1).getDay();
const isTodayFn = (y, m, day) => new Date().toISOString().split("T")[0] === `${y}-${String(m+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

function buildTasksForListing(listDate, luxury, listingId) {
  const cycle = luxury ? LUXURY_CYCLE : REGULAR_CYCLE;
  const tasks = [];
  cycle.forEach(({ phase, tasks: names }) => {
    const baseDay = phase * 30;
    names.forEach((name, i) => {
      tasks.push({ id: genId(), listing_id: listingId, name, phase, due_date: addDays(listDate, baseDay + Math.floor((i / names.length) * 28) + 1), status: "pending", custom: false });
    });
  });
  return tasks;
}

function AddTaskRow({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState("");
  const [due, setDue] = useState("");
  const submit = () => { if (!val.trim()) return; onAdd(val.trim(), due || null); setVal(""); setDue(""); setOpen(false); };
  if (!open) return <button onClick={() => setOpen(true)} style={{ fontSize: 12, background: "none", border: "none", color: "#2C5F2E", cursor: "pointer", padding: "6px 0" }}>+ Add task</button>;
  return (
    <div style={{ marginTop: 8, padding: 12, borderRadius: 8, border: "1px dashed #A8C8A9", background: "#EBF3EB" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input autoFocus value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => { if (e.key === "Enter") submit(); if (e.key === "Escape") { setVal(""); setDue(""); setOpen(false); }}} placeholder="Task name..." style={{ flex: 1, fontSize: 13 }} />
        <input type="date" value={due} onChange={e => setDue(e.target.value)} style={{ fontSize: 13, width: 140 }} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={submit} style={{ fontSize: 12, padding: "5px 16px", borderRadius: 6, border: "1px solid #2C5F2E", background: "#2C5F2E", color: "#fff", cursor: "pointer", fontWeight: 500 }}>Save</button>
        <button onClick={() => { setVal(""); setDue(""); setOpen(false); }} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, border: "1px solid #ddd", background: "transparent", cursor: "pointer", color: "#666" }}>Cancel</button>
      </div>
    </div>
  );
}

function CalendarGrid({ year, month, tasksByDay, onTaskClick }) {
  const days = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);
  return (
    <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid #eee" }}>
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
          <div key={d} style={{ padding: "8px 0", textAlign: "center", fontSize: 11, fontWeight: 500, color: "#999" }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e${i}`} style={{ minHeight: 80, borderRight: "1px solid #eee", borderBottom: "1px solid #eee" }} />
        ))}
        {Array.from({ length: days }).map((_, i) => {
          const day = i + 1;
          const dayTasks = tasksByDay[day] || [];
          const today = isTodayFn(year, month, day);
          return (
            <div key={day} style={{ minHeight: 80, padding: 6, borderRight: "1px solid #eee", borderBottom: "1px solid #eee", background: today ? "#EBF3EB" : "transparent" }}>
              <div style={{ fontSize: 12, fontWeight: today ? 500 : 400, color: today ? "#2C5F2E" : "#999", marginBottom: 4 }}>{day}</div>
              {dayTasks.map(t => {
                const pc = t.phase !== undefined ? PHASE_COLORS[t.phase] : { bg: "#FBF5E9", border: "#C9A84C", text: "#9A7A2A" };
                const done = t.status === "done" || t.done;
                return (
                  <div key={t.id} onClick={() => onTaskClick(t)}
                    style={{ fontSize: 10, padding: "2px 5px", borderRadius: 4, background: done ? "#1D9E75" : pc.bg, color: done ? "#fff" : pc.text, marginBottom: 2, cursor: "pointer", textDecoration: done ? "line-through" : "none", lineHeight: 1.4, border: `1px solid ${done ? "#1D9E75" : pc.border}` }}>
                    {t.name}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PhaseSection({ ph, pi, phaseTasks, l, updateTaskStatus, removeCustomTask, addCustomTask }) {
  const [showDone, setShowDone] = useState(false);
  const pc = PHASE_COLORS[pi];
  const pending = phaseTasks.filter(t => t.status !== "done" && t.status !== "skipped");
  const done = phaseTasks.filter(t => t.status === "done");
  return (
    <div style={{ marginBottom: 12, border: `1px solid ${pc.border}`, borderRadius: 12, overflow: "hidden", background: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", background: pc.bg }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: pc.text }}>{ph}</span>
        <span style={{ fontSize: 12, color: pc.text, opacity: 0.8 }}>{done.length}/{phaseTasks.length} done</span>
      </div>
      {pending.map(t => (
        <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px", borderBottom: "1px solid #f0f0f0", background: "transparent", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
            <span style={{ fontSize: 13, color: "#111" }}>{t.name}</span>
            <span style={{ fontSize: 11, color: "#999" }}>{fmtDate(t.due_date)}</span>
            {t.custom && <span style={{ fontSize: 10, padding: "1px 5px", borderRadius: 999, background: "#f0f0f0", color: "#666" }}>custom</span>}
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
            {!l.sold && <button onClick={() => updateTaskStatus(t.id, "skipped")} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, border: "1px solid #ddd", background: "transparent", color: "#666", cursor: "pointer" }}>Skip</button>}
            {!l.sold && <button onClick={() => updateTaskStatus(t.id, "done")} style={{ fontSize: 12, padding: "5px 14px", borderRadius: 6, border: "1.5px solid #ddd", background: "transparent", color: "#111", cursor: "pointer" }}>Mark done</button>}
            {t.custom && !l.sold && <button onClick={() => removeCustomTask(t.id)} style={{ background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "0 2px" }}>×</button>}
          </div>
        </div>
      ))}
      {pending.length === 0 && done.length > 0 && (
        <div style={{ padding: "10px 16px", fontSize: 13, color: "#1D6B43", background: "#F0FAF5" }}>✓ All tasks complete!</div>
      )}
      {done.length > 0 && (
        <div>
          <button onClick={() => setShowDone(s => !s)} style={{ width: "100%", padding: "8px 16px", background: "none", border: "none", borderTop: "1px solid #f0f0f0", cursor: "pointer", fontSize: 12, color: "#999", textAlign: "left" }}>
            {showDone ? "▾" : "▸"} {done.length} completed task{done.length > 1 ? "s" : ""}
          </button>
          {showDone && done.map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px", borderTop: "1px solid #f0f0f0", background: "#F0FAF5", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                <span style={{ fontSize: 13, color: "#1D6B43", textDecoration: "line-through" }}>{t.name}</span>
                <span style={{ fontSize: 11, color: "#999" }}>{fmtDate(t.due_date)}</span>
              </div>
              <button onClick={() => updateTaskStatus(t.id, "pending")} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, border: "1px solid #1D9E75", background: "#1D9E75", color: "#fff", cursor: "pointer" }}>✓ Done</button>
            </div>
          ))}
        </div>
      )}
      {!l.sold && <div style={{ padding: "8px 16px", borderTop: "1px solid #f0f0f0" }}><AddTaskRow onAdd={(name, due) => addCustomTask(l.id, pi, name, due)} /></div>}
    </div>
  );
}

export default function App() {
  const [listings, setListings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [generalTasks, setGeneralTasks] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("listings");
  const [activeId, setActiveId] = useState(null);
  const [propertyView, setPropertyView] = useState("list");
  const [listingTab, setListingTab] = useState("active");
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ address: "", link: "", listDate: "", price: "" });
  const [formErr, setFormErr] = useState("");
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() }; });
  const [nltCalMonth, setNltCalMonth] = useState(() => { const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() }; });
  const [nltForm, setNltForm] = useState({ name: "", dueDate: "", notes: "" });
  const [nltView, setNltView] = useState("list");

  useEffect(() => {
    async function load() {
      try {
        const [ls, ts, gs] = await Promise.all([
          db("listings?order=created_at.asc"),
          db("tasks?order=due_date.asc"),
          db("general_tasks?order=due_date.asc"),
        ]);
        setListings(ls || []);
        setTasks(ts || []);
        setGeneralTasks(gs || []);
        setLoaded(true);
      } catch (e) {
        setError(e.message);
        setLoaded(true);
      }
    }
    load();
  }, []);

  const listingTasks = id => tasks.filter(t => t.listing_id === id);

  async function addListing() {
    const price = parsePrice(form.price);
    if (!form.address.trim()) return setFormErr("Address is required.");
    if (!price) return setFormErr("Enter a valid price.");
    if (!form.listDate) return setFormErr("Listing date is required.");
    const luxury = price >= 1000000;
    const id = genId();
    const listing = { id, address: form.address.trim(), price, list_date: form.listDate, link: form.link.trim(), agent: "Amber Granter", luxury, sold: false };
    const newTasks = buildTasksForListing(form.listDate, luxury, id);
    try {
      await db("listings", { method: "POST", body: JSON.stringify(listing) });
      await db("tasks", { method: "POST", body: JSON.stringify(newTasks) });
      setListings(p => [listing, ...p]);
      setTasks(p => [...p, ...newTasks]);
      setForm({ address: "", link: "", listDate: "", price: "" });
      setFormErr("");
      setShowAddModal(false);
    } catch (e) { setFormErr("Error saving: " + e.message); }
  }

  async function updateTaskStatus(taskId, status) {
    try {
      await db(`tasks?id=eq.${taskId}`, { method: "PATCH", body: JSON.stringify({ status }), prefer: "return=minimal" });
      setTasks(p => p.map(t => t.id === taskId ? { ...t, status } : t));
    } catch (e) { console.error(e); }
  }

  async function addCustomTask(listingId, phase, name, dueDate) {
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return;
    const task = { id: genId(), listing_id: listingId, name, phase, due_date: dueDate || addDays(listing.list_date, phase * 30 + 15), status: "pending", custom: true };
    try {
      await db("tasks", { method: "POST", body: JSON.stringify(task) });
      setTasks(p => [...p, task]);
    } catch (e) { console.error(e); }
  }

  async function removeCustomTask(taskId) {
    try {
      await db(`tasks?id=eq.${taskId}`, { method: "DELETE", prefer: "return=minimal" });
      setTasks(p => p.filter(t => t.id !== taskId));
    } catch (e) { console.error(e); }
  }

  async function markSold(id) {
    try {
      await db(`listings?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ sold: true }), prefer: "return=minimal" });
      const pendingIds = tasks.filter(t => t.listing_id === id && t.status === "pending").map(t => t.id);
      if (pendingIds.length) {
        await db(`tasks?id=in.(${pendingIds.join(",")})`, { method: "PATCH", body: JSON.stringify({ status: "skipped" }), prefer: "return=minimal" });
      }
      setListings(p => p.map(l => l.id === id ? { ...l, sold: true } : l));
      setTasks(p => p.map(t => t.listing_id === id && t.status === "pending" ? { ...t, status: "skipped" } : t));
    } catch (e) { console.error(e); }
  }

  async function deleteListing(id) {
    try {
      await db(`listings?id=eq.${id}`, { method: "DELETE", prefer: "return=minimal" });
      setListings(p => p.filter(l => l.id !== id));
      setTasks(p => p.filter(t => t.listing_id !== id));
      setActiveId(null);
    } catch (e) { console.error(e); }
  }

  async function addGeneralTask() {
    if (!nltForm.name.trim() || !nltForm.dueDate) return;
    const task = { id: genId(), name: nltForm.name.trim(), due_date: nltForm.dueDate, notes: nltForm.notes.trim(), done: false };
    try {
      await db("general_tasks", { method: "POST", body: JSON.stringify(task) });
      setGeneralTasks(p => [...p, task]);
      setNltForm({ name: "", dueDate: "", notes: "" });
    } catch (e) { console.error(e); }
  }

  async function toggleGeneralTask(taskId, done) {
    try {
      await db(`general_tasks?id=eq.${taskId}`, { method: "PATCH", body: JSON.stringify({ done: !done }), prefer: "return=minimal" });
      setGeneralTasks(p => p.map(t => t.id === taskId ? { ...t, done: !t.done } : t));
    } catch (e) { console.error(e); }
  }

  async function deleteGeneralTask(taskId) {
    try {
      await db(`general_tasks?id=eq.${taskId}`, { method: "DELETE", prefer: "return=minimal" });
      setGeneralTasks(p => p.filter(t => t.id !== taskId));
    } catch (e) { console.error(e); }
  }

  const activeListing = listings.find(l => l.id === activeId);
  const active = listings.filter(l => !l.sold);
  const sold = listings.filter(l => l.sold);
  const shown = listingTab === "active" ? active : sold;
  const totalTasks = id => listingTasks(id).length;
  const doneTasks = id => listingTasks(id).filter(t => t.status === "done").length;
  const pct = id => totalTasks(id) ? Math.round((doneTasks(id) / totalTasks(id)) * 100) : 0;

  if (!loaded) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#666", fontSize: 14 }}>Loading...</div>;
  if (error) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "red", fontSize: 13, padding: 20 }}>Error: {error}</div>;

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", minHeight: "100vh", background: "#f5f5f5" }}>
      <div style={{ background: "#2C5F2E", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ padding: "12px 0", marginRight: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>Mountain Town Living</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Amber Granter · Golden, BC</div>
          </div>
          {[["listings","Listings"],["tasks","All Tasks"],["general","General Tasks"],["weekly","Weekly"]].map(([val, label]) => (
            <button key={val} onClick={() => { setTab(val); setActiveId(null); }}
              style={{ padding: "12px 16px", fontSize: 13, fontWeight: tab === val ? 500 : 400, color: tab === val ? "#fff" : "rgba(255,255,255,0.6)", background: "none", border: "none", borderBottom: tab === val ? "2px solid #C9A84C" : "2px solid transparent", cursor: "pointer", whiteSpace: "nowrap" }}>
              {label}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, background: "rgba(201,168,76,0.25)", color: "#C9A84C", fontWeight: 500 }}>● Live</span>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px" }}>

        {/* PROPERTY DETAIL */}
        {tab === "listings" && activeId && activeListing && (() => {
          const l = activeListing;
          const lTasks = listingTasks(l.id);
          const days = daysOn(l.list_date);
          const curPhase = Math.min(5, Math.floor(days / 30));
          const done = doneTasks(l.id);
          const total = totalTasks(l.id);
          const tasksByDay = {};
          lTasks.forEach(t => {
            if (!t.due_date) return;
            const d = new Date(t.due_date + "T00:00:00");
            if (d.getFullYear() === calMonth.year && d.getMonth() === calMonth.month) {
              const day = d.getDate();
              if (!tasksByDay[day]) tasksByDay[day] = [];
              tasksByDay[day].push({ ...t, dueDate: t.due_date });
            }
          });
          return (
            <div>
              <button onClick={() => setActiveId(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 13, marginBottom: 20, padding: 0 }}>← All listings</button>
              <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 16, padding: "20px 24px", marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <h2 style={{ fontSize: 20, fontWeight: 500, margin: 0, color: "#111" }}>{l.address}</h2>
                      <span style={{ fontSize: 11, padding: "2px 9px", borderRadius: 999, background: l.luxury ? "#EEEDFE" : "#EBF3EB", color: l.luxury ? "#534AB7" : "#2C5F2E", fontWeight: 500 }}>{l.luxury ? "Luxury" : "Regular"}</span>
                      {l.sold && <span style={{ fontSize: 11, padding: "2px 9px", borderRadius: 999, background: "#FCE8E8", color: "#A32D2D", fontWeight: 500 }}>Sold</span>}
                    </div>
                    <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                      {fmtPrice(l.price)} · Day {days} on market · {PHASES[curPhase].split("—")[1].trim()}
                      {l.link && <> · <a href={l.link} style={{ color: "#2C5F2E" }}>MLS link ↗</a></>}
                    </div>
                  </div>
                  {!l.sold && <button onClick={() => { if (window.confirm(`Mark ${l.address} as sold?`)) markSold(l.id); }} style={{ padding: "7px 16px", borderRadius: 8, border: "1.5px solid #A32D2D", background: "#FFF5F5", color: "#A32D2D", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>Mark sold</button>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
                  {[["List price", fmtPrice(l.price)], ["Days on market", `Day ${days}`], ["Current phase", `Month ${curPhase + 1} of 6`], ["Progress", `${done} / ${total}`]].map(([label, val]) => (
                    <div key={label} style={{ background: "#f5f5f5", borderRadius: 8, padding: "10px 12px" }}>
                      <div style={{ fontSize: 11, color: "#666", marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "#111" }}>{val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1, height: 5, borderRadius: 999, background: "#eee", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct(l.id)}%`, background: "#2C5F2E", borderRadius: 999 }} />
                  </div>
                  <span style={{ fontSize: 12, color: "#666" }}>{pct(l.id)}%</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                <div style={{ display: "flex", gap: 4, background: "#eee", borderRadius: 8, padding: 4 }}>
                  {["list","calendar"].map(v => (
                    <button key={v} onClick={() => setPropertyView(v)} style={{ padding: "6px 16px", borderRadius: 6, border: "none", background: propertyView === v ? "#fff" : "transparent", color: propertyView === v ? "#111" : "#666", cursor: "pointer", fontSize: 13, fontWeight: propertyView === v ? 500 : 400 }}>
                      {v === "list" ? "List" : "Calendar"}
                    </button>
                  ))}
                </div>
                {propertyView === "calendar" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button onClick={() => setCalMonth(p => { const d = new Date(p.year, p.month - 1); return { year: d.getFullYear(), month: d.getMonth() }; })} style={{ background: "none", border: "1px solid #ddd", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 13 }}>←</button>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{MONTH_NAMES[calMonth.month]} {calMonth.year}</span>
                    <button onClick={() => setCalMonth(p => { const d = new Date(p.year, p.month + 1); return { year: d.getFullYear(), month: d.getMonth() }; })} style={{ background: "none", border: "1px solid #ddd", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 13 }}>→</button>
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {PHASES.map((_, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#666" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: PHASE_COLORS[i].dot }} />M{i+1}
                    </div>
                  ))}
                </div>
              </div>

              {propertyView === "list" && PHASES.map((ph, pi) => {
                const phaseTasks = lTasks.filter(t => t.phase === pi);
                if (!phaseTasks.length) return null;
                return <PhaseSection key={pi} ph={ph} pi={pi} phaseTasks={phaseTasks} l={l} updateTaskStatus={updateTaskStatus} removeCustomTask={removeCustomTask} addCustomTask={addCustomTask} />;
              })}

              {propertyView === "calendar" && (
                <CalendarGrid year={calMonth.year} month={calMonth.month} tasksByDay={tasksByDay}
                  onTaskClick={t => !l.sold && updateTaskStatus(t.id, t.status === "done" ? "pending" : "done")} />
              )}
              <button onClick={() => { if (window.confirm("Delete this listing?")) deleteListing(l.id); }} style={{ marginTop: 16, background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: 12, padding: 0 }}>Delete listing</button>
            </div>
          );
        })()}

        {/* LISTINGS DASHBOARD */}
        {tab === "listings" && !activeId && (
          <>
            {(() => {
              const today = new Date();
              const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + 7);
              const due = tasks.filter(t => {
                if (t.status !== "pending") return false;
                const l = listings.find(l => l.id === t.listing_id);
                if (!l || l.sold) return false;
                const d = new Date(t.due_date + "T00:00:00");
                return d >= today && d <= weekEnd;
              }).sort((a, b) => a.due_date.localeCompare(b.due_date));
              const todayStr = today.toISOString().split("T")[0];
              const weekEndStr = weekEnd.toISOString().split("T")[0];
              const dueGeneral = generalTasks.filter(t => {
                if (t.done) return false;
                return t.due_date >= todayStr && t.due_date <= weekEndStr;
              }).sort((a, b) => a.due_date.localeCompare(b.due_date));
              if (!due.length && !dueGeneral.length) return null;
              return (
                <div style={{ background: "#2C5F2E", borderRadius: 14, padding: "16px 20px", marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.7)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Due this week</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {due.map(t => {
                      const l = listings.find(l => l.id === t.listing_id);
                      return (
                        <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 999, background: "rgba(255,255,255,0.15)", color: "#fff", fontWeight: 500 }}>{fmtDate(t.due_date)}</span>
                            <span style={{ fontSize: 13, color: "#fff" }}>{t.name}</span>
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{l?.address}</span>
                          </div>
                          <button onClick={() => updateTaskStatus(t.id, "done")} style={{ fontSize: 12, padding: "4px 14px", borderRadius: 6, border: "1.5px solid rgba(255,255,255,0.4)", background: "transparent", color: "#fff", cursor: "pointer", fontWeight: 500 }}>Mark done</button>
                        </div>
                      );
                    })}
                    {dueGeneral.map(t => (
                      <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 999, background: "rgba(201,168,76,0.3)", color: "#C9A84C", fontWeight: 500 }}>{fmtDate(t.due_date)}</span>
                          <span style={{ fontSize: 13, color: "#fff" }}>{t.name}</span>
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>General</span>
                        </div>
                        <button onClick={() => toggleGeneralTask(t.id, t.done)} style={{ fontSize: 12, padding: "4px 14px", borderRadius: 6, border: "1.5px solid rgba(201,168,76,0.6)", background: "transparent", color: "#C9A84C", cursor: "pointer", fontWeight: 500 }}>Mark done</button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", gap: 6 }}>
                {[["active", active.length], ["sold", sold.length]].map(([val, count]) => (
                  <button key={val} onClick={() => setListingTab(val)} style={{ padding: "6px 18px", borderRadius: 999, border: "1px solid #ddd", background: listingTab === val ? "#111" : "transparent", color: listingTab === val ? "#fff" : "#666", fontSize: 13, cursor: "pointer", fontWeight: listingTab === val ? 500 : 400, textTransform: "capitalize" }}>
                    {val} ({count})
                  </button>
                ))}
              </div>
              <button onClick={() => setShowAddModal(true)} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#2C5F2E", color: "#fff", fontWeight: 500, fontSize: 13, cursor: "pointer" }}>+ Add listing</button>
            </div>

            {shown.length === 0 && <div style={{ textAlign: "center", padding: "3rem", color: "#999", fontSize: 14 }}>{listingTab === "active" ? "No active listings." : "No sold listings yet."}</div>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
              {shown.map(l => {
                const days = daysOn(l.list_date);
                const p = pct(l.id);
                const curPhase = Math.min(5, Math.floor(days / 30));
                const pc = PHASE_COLORS[curPhase];
                return (
                  <div key={l.id} onClick={() => setActiveId(l.id)} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 14, padding: 16, cursor: "pointer", transition: "border-color 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#2C5F2E"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#eee"}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.3, flex: 1, marginRight: 8, color: "#111" }}>{l.address}</div>
                      <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 999, background: l.luxury ? "#EEEDFE" : "#EBF3EB", color: l.luxury ? "#534AB7" : "#2C5F2E", fontWeight: 500, flexShrink: 0 }}>{l.luxury ? "Luxury" : "Regular"}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#666", marginBottom: 10 }}>{fmtPrice(l.price)} · Day {days}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: pc.dot, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: "#666" }}>{PHASES[curPhase]}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <div style={{ flex: 1, height: 4, borderRadius: 999, background: "#eee", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${p}%`, background: "#2C5F2E", borderRadius: 999 }} />
                      </div>
                      <span style={{ fontSize: 11, color: "#666" }}>{doneTasks(l.id)}/{totalTasks(l.id)}</span>
                    </div>
                    {!l.sold && (
                      <button onClick={e => { e.stopPropagation(); if (window.confirm(`Mark ${l.address} as sold?`)) markSold(l.id); }}
                        style={{ width: "100%", padding: "6px 0", borderRadius: 6, border: "1px solid #A32D2D", background: "transparent", color: "#A32D2D", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>
                        Mark sold
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ALL TASKS */}
        {tab === "tasks" && (
          <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 14, overflow: "hidden" }}>
            {tasks.length === 0 && <div style={{ padding: "3rem", textAlign: "center", color: "#999", fontSize: 13 }}>No tasks yet.</div>}
            {tasks.map((t, i, arr) => {
              const l = listings.find(l => l.id === t.listing_id);
              return (
                <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: i < arr.length - 1 ? "1px solid #f0f0f0" : "none", background: t.status === "done" ? "#F0FAF5" : "transparent", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: PHASE_COLORS[t.phase]?.dot || "#ccc", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 13, color: t.status === "done" ? "#1D6B43" : "#111", textDecoration: t.status === "done" ? "line-through" : "none" }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: "#999" }}>{l?.address} · {fmtDate(t.due_date)}</div>
                    </div>
                  </div>
                  <button onClick={() => updateTaskStatus(t.id, t.status === "done" ? "pending" : "done")}
                    style={{ fontSize: 12, padding: "4px 12px", borderRadius: 6, border: `1.5px solid ${t.status === "done" ? "#1D9E75" : "#ddd"}`, background: t.status === "done" ? "#1D9E75" : "transparent", color: t.status === "done" ? "#fff" : "#111", cursor: "pointer", fontWeight: t.status === "done" ? 500 : 400 }}>
                    {t.status === "done" ? "✓ Done" : "Mark done"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* GENERAL TASKS */}
        {tab === "general" && (
          <div>
            <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 14, padding: "18px 20px", marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 14, color: "#111" }}>Add a task</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#666", marginBottom: 4 }}>Task name</label>
                  <input value={nltForm.name} onChange={e => setNltForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Reach out to Mountain Life magazine" style={{ width: "100%", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#666", marginBottom: 4 }}>Due date</label>
                  <input type="date" value={nltForm.dueDate} onChange={e => setNltForm(p => ({ ...p, dueDate: e.target.value }))} style={{ width: "100%", boxSizing: "border-box" }} />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, color: "#666", marginBottom: 4 }}>Notes (optional)</label>
                <input value={nltForm.notes} onChange={e => setNltForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any extra context..." style={{ width: "100%", boxSizing: "border-box" }} />
              </div>
              <button onClick={addGeneralTask} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#2C5F2E", color: "#fff", fontWeight: 500, fontSize: 13, cursor: "pointer" }}>+ Add task</button>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: "#666" }}>{generalTasks.filter(t => !t.done).length} pending · {generalTasks.filter(t => t.done).length} done</div>
              <div style={{ display: "flex", gap: 4, background: "#eee", borderRadius: 8, padding: 4 }}>
                {["list","calendar"].map(v => (
                  <button key={v} onClick={() => setNltView(v)} style={{ padding: "6px 16px", borderRadius: 6, border: "none", background: nltView === v ? "#fff" : "transparent", color: nltView === v ? "#111" : "#666", cursor: "pointer", fontSize: 13, fontWeight: nltView === v ? 500 : 400 }}>
                    {v === "list" ? "List" : "Calendar"}
                  </button>
                ))}
              </div>
            </div>

            {nltView === "list" && (
              <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 14, overflow: "hidden" }}>
                {generalTasks.length === 0 && <div style={{ padding: "3rem", textAlign: "center", color: "#999", fontSize: 13 }}>No general tasks yet.</div>}
                {[...generalTasks].sort((a, b) => a.due_date.localeCompare(b.due_date)).map((t, i, arr) => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", borderBottom: i < arr.length - 1 ? "1px solid #f0f0f0" : "none", background: t.done ? "#F0FAF5" : "transparent", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: t.done ? "#1D6B43" : "#111", textDecoration: t.done ? "line-through" : "none" }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{fmtDate(t.due_date)}{t.notes && ` · ${t.notes}`}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => toggleGeneralTask(t.id, t.done)} style={{ fontSize: 12, padding: "5px 14px", borderRadius: 6, border: `1.5px solid ${t.done ? "#1D9E75" : "#ddd"}`, background: t.done ? "#1D9E75" : "transparent", color: t.done ? "#fff" : "#111", cursor: "pointer", fontWeight: t.done ? 500 : 400 }}>
                        {t.done ? "✓ Done" : "Mark done"}
                      </button>
                      <button onClick={() => deleteGeneralTask(t.id)} style={{ background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "0 2px" }}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {nltView === "calendar" && (() => {
              const tasksByDay = {};
              generalTasks.forEach(t => {
                if (!t.due_date) return;
                const d = new Date(t.due_date + "T00:00:00");
                if (d.getFullYear() === nltCalMonth.year && d.getMonth() === nltCalMonth.month) {
                  const day = d.getDate();
                  if (!tasksByDay[day]) tasksByDay[day] = [];
                  tasksByDay[day].push({ ...t, status: t.done ? "done" : "pending", phase: 2 });
                }
              });
              return (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 14 }}>
                    <button onClick={() => setNltCalMonth(p => { const d = new Date(p.year, p.month - 1); return { year: d.getFullYear(), month: d.getMonth() }; })} style={{ background: "none", border: "1px solid #ddd", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 13 }}>←</button>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{MONTH_NAMES[nltCalMonth.month]} {nltCalMonth.year}</span>
                    <button onClick={() => setNltCalMonth(p => { const d = new Date(p.year, p.month + 1); return { year: d.getFullYear(), month: d.getMonth() }; })} style={{ background: "none", border: "1px solid #ddd", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 13 }}>→</button>
                  </div>
                  <CalendarGrid year={nltCalMonth.year} month={nltCalMonth.month} tasksByDay={tasksByDay}
                    onTaskClick={t => toggleGeneralTask(t.id, t.done)} />
                </div>
              );
            })()}
          </div>
        )}

        {/* WEEKLY */}
        {tab === "weekly" && (
          <div style={{ display: "grid", gap: 10 }}>
            {WEEKLY.map(w => (
              <div key={w.day} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 90, fontSize: 12, fontWeight: 500, color: "#2C5F2E", flexShrink: 0 }}>{w.day}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#111" }}>{w.title}</div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{w.note}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD LISTING MODAL */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 480, boxSizing: "border-box", boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 500, margin: 0, color: "#111" }}>New listing</h2>
              <button onClick={() => { setShowAddModal(false); setFormErr(""); }} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#666", lineHeight: 1 }}>×</button>
            </div>
            {formErr && <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 12 }}>{formErr}</p>}
            {[["Property address","address","e.g. 1520 Quartz Crescent"],["List price (CAD)","price","e.g. 1,250,000"],["MLS listing link","link","https://..."]].map(([label, key, ph]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, color: "#666", marginBottom: 4 }}>{label}</label>
                <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} style={{ width: "100%", boxSizing: "border-box" }} />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, color: "#666", marginBottom: 4 }}>Listing date (DOM 1)</label>
              <input type="date" value={form.listDate} onChange={e => setForm(p => ({ ...p, listDate: e.target.value }))} style={{ width: "100%", boxSizing: "border-box" }} />
            </div>
            {form.price && parsePrice(form.price) > 0 && (
              <div style={{ padding: "8px 12px", borderRadius: 8, background: parsePrice(form.price) >= 1000000 ? "#EEEDFE" : "#EBF3EB", color: parsePrice(form.price) >= 1000000 ? "#534AB7" : "#2C5F2E", fontSize: 13, fontWeight: 500, marginBottom: 16 }}>
                {parsePrice(form.price) >= 1000000 ? "Luxury cycle · 18 tasks" : "Regular cycle · 15 tasks"}
              </div>
            )}
            <button onClick={addListing} style={{ width: "100%", padding: 11, borderRadius: 8, background: "#2C5F2E", color: "#fff", border: "none", fontWeight: 500, fontSize: 14, cursor: "pointer" }}>
              Add listing & generate tasks
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
