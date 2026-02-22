// src/pages/BeamIssue.tsx
import React, { useEffect, useState } from "react";
import { api } from "../api";

type Loom = { loom_id: number; loom_no: string };
type Design = { design_id: number; design_no: string; average_meter?: number };

export default function BeamIssue() {
  const [beamNoQuery, setBeamNoQuery] = useState("");
  const [inward, setInward] = useState<any | null>(null);
  const [looms, setLooms] = useState<Loom[]>([]);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [form, setForm] = useState({
    plant_id: 1,
    inward_id: 0,
    beam_id: 0,
    loom_id: 0,
    design_id: 0,
    fabric_mark_interval: 0,
    roll_per_meter: 400,
    issued_by: "office1",
  });

  useEffect(() => {
    api.get("/looms", { params: { plant_id: 1 } }).then(r => setLooms(r.data.data || []));
    api.get("/designs", { params: { plant_id: 1 } }).then(r => setDesigns(r.data.data || []));
  }, []);

  const fetchInward = async () => {
    if (!beamNoQuery) return alert("Enter beam number");
    try {
      const res = await api.get(`/beam-inwards/by-beam/${encodeURIComponent(beamNoQuery)}`, {
        params: { plant_id: 1 },
      });
      if (!res.data.data) {
        alert("No inward found for this beam no");
        setInward(null);
        return;
      }
      setInward(res.data.data);
      // prefill parts of the form
      setForm(f => ({
        ...f,
        inward_id: res.data.data.inward_id,
        beam_id: res.data.data.beam_id,
        fabric_mark_interval: res.data.data.sizing_mark_interval ?? 0,
      }));
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Error fetching inward");
    }
  };

  const handleIssue = async () => {
    // validate
    if (!form.inward_id || !form.beam_id) return alert("Fetch inward first.");
    if (!form.loom_id) return alert("Select loom");
    if (!form.design_id) return alert("Select design");

    try {
      const payload = {
        plant_id: form.plant_id,
        inward_id: form.inward_id,
        beam_id: form.beam_id,
        loom_id: form.loom_id,
        design_id: form.design_id,
        fabric_mark_interval: form.fabric_mark_interval || undefined,
        roll_per_meter: form.roll_per_meter || undefined,
        issued_by: form.issued_by,
      };
      const res = await api.post("/beam-issues", payload);
      // backend may return a warning object if active loom exists
      if (res.data?.warning) {
        const active = res.data.data;
        const ok = window.confirm(
          `Loom already running Beam ${active.beam_no} Expected: ${active.expected_meter} Produced: ${active.produced_meter}\nComplete previous beam and issue new?`
        );
        if (ok) {
          await api.post("/beam-issues/complete", { issue_id: active.issue_id });
          const retry = await api.post("/beam-issues", payload);
          alert("Previous beam completed. New beam issued.");
          return;
        } else {
          return;
        }
      }
      alert("Beam issued successfully.");
      // reset
      setInward(null);
      setBeamNoQuery("");
      setForm({
        plant_id: 1,
        inward_id: 0,
        beam_id: 0,
        loom_id: 0,
        design_id: 0,
        fabric_mark_interval: 0,
        roll_per_meter: 400,
        issued_by: "office1",
      });
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Error issuing");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Beam Issue</h2>

      <div style={{ marginBottom: 8 }}>
        <label>Beam No (search inward)</label>
        <input value={beamNoQuery} onChange={e => setBeamNoQuery(e.target.value)} />
        <button onClick={fetchInward} style={{ marginLeft: 8 }}>
          Fetch Inward
        </button>
      </div>

      {inward && (
        <div style={{ border: "1px solid #ddd", padding: 12, marginBottom: 12 }}>
          <div><strong>Beam:</strong> {inward.beam_no}</div>
          <div><strong>Set:</strong> {inward.set_no}</div>
          <div><strong>Sizing Meter (S):</strong> {inward.sizing_meter}</div>
          <div><strong>Sizing L-to-L (Ls):</strong> {inward.sizing_mark_interval}</div>
        </div>
      )}

      <div style={{ marginBottom: 8 }}>
        <label>Select Loom</label>
        <select onChange={e => setForm({ ...form, loom_id: Number(e.target.value) })} value={form.loom_id}>
          <option value={0}>-- select --</option>
          {looms.map(l => <option key={l.loom_id} value={l.loom_id}>{l.loom_no}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>Select Design</label>
        <select
          onChange={e => {
            const id = Number(e.target.value);
            const d = designs.find(x => x.design_id === id);
            setForm({ ...form, design_id: id, fabric_mark_interval: d?.average_meter ?? form.fabric_mark_interval });
          }}
          value={form.design_id}
        >
          <option value={0}>-- select --</option>
          {designs.map(d => <option key={d.design_id} value={d.design_id}>{d.design_no}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>Fabric Mark Interval (Lf) — editable</label>
        <input
          type="number"
          step="0.01"
          value={form.fabric_mark_interval || ""}
          onChange={e => setForm({ ...form, fabric_mark_interval: Number(e.target.value) })}
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>Roll length (meter) for roll planning</label>
        <input
          type="number"
          step="0.1"
          value={form.roll_per_meter}
          onChange={e => setForm({ ...form, roll_per_meter: Number(e.target.value) })}
        />
      </div>

      <div>
        <button onClick={handleIssue}>Issue Beam</button>
      </div>
    </div>
  );
}