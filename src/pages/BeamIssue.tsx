// src/pages/BeamIssue.tsx
import React, { useEffect, useState } from "react";
import api from "../api/api";
import Loader from "../components/Loader";

export default function BeamIssue() {
  const [beamNo, setBeamNo] = useState("");
  const [inward, setInward] = useState<any>(null);
  const [issue, setIssue] = useState<any>(null);
  const [looms, setLooms] = useState<any[]>([]);
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    plant_id: 1,
    inward_id: null as any,
    beam_id: null as any,
    loom_id: "",
    design_id: "",
    fabric_mark_interval: "",
    roll_per_meter: 400,
    issued_by: "office1",
  });

  useEffect(() => {
    api.get("/looms?plant_id=1").then((r) => setLooms(r.data.data || [])).catch(() => {});
    api.get("/designs?plant_id=1").then((r) => setDesigns(r.data.data || [])).catch(() => {});
  }, []);

  async function fetchInward() {
    if (!beamNo) return alert("Enter Beam No (e.g. B-1)");
    try {
      setLoading(true);
      const res = await api.get(`/beam-inwards/by-beam/${encodeURIComponent(beamNo)}?plant_id=1`);
      setInward(res.data.data);
      // also fetch active issue for this beam
      const issueRes = await api.get(`/beam-issues/active?plant_id=1&beam_no=${encodeURIComponent(beamNo)}`).catch(()=>null);
      setIssue(issueRes?.data?.data || null);
      if (res.data.data) {
        setForm({
          ...form,
          inward_id: res.data.data.inward_id,
          beam_id: res.data.data.beam_id,
          fabric_mark_interval: res.data.data.sizing_mark_interval,
        });
      } else {
        alert("No inward found for this beam");
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Error fetching inward");
    } finally {
      setLoading(false);
    }
  }

  // fetch active issue by loom
  async function fetchActiveByLoom(loom_id: number) {
    try {
      setLoading(true);
      const res = await api.get(`/beam-issues/active/loom/${loom_id}?plant_id=1`);
      setIssue(res.data.data || null);
      if (!res.data.data) alert("No active issue on this loom");
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  async function handleIssue() {
    if (!form.inward_id) return alert("Fetch inward first");
    if (!form.loom_id) return alert("Select Loom");
    if (!form.design_id) return alert("Select Design");
    try {
      setLoading(true);
      const payload: any = {
        plant_id: form.plant_id,
        inward_id: Number(form.inward_id),
        beam_id: Number(form.beam_id),
        loom_id: Number(form.loom_id),
        design_id: Number(form.design_id),
        fabric_mark_interval: form.fabric_mark_interval ? Number(form.fabric_mark_interval) : null,
        roll_per_meter: form.roll_per_meter ? Number(form.roll_per_meter) : null,
        issued_by: form.issued_by,
      };
      const res = await api.post("/beam-issues", payload);
      // backend may return { success:true, warning:true, data: ... } or { success:true, data: ... }
      if (res.data.warning) {
        alert("Warning: " + JSON.stringify(res.data.data || res.data.warning));
      } else {
        alert("Issue created: " + JSON.stringify(res.data.data));
      }
      // refresh active issue
      const issueRes = await api.get(`/beam-issues/active?plant_id=1&beam_no=${encodeURIComponent(beamNo)}`).catch(()=>null);
      setIssue(issueRes?.data?.data || null);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Error creating issue");
    } finally {
      setLoading(false);
    }
  }

  // COMPLETE: note backend expects POST /api/beam-issues/complete with { issue_id, completed_by }
  async function handleComplete() {
    if (!issue || !issue.issue_id) return alert("No active issue selected");
    if (!window.confirm(`Complete issue ${issue.issue_id} for beam ${issue.beam_no}?`)) return;
    const reason = window.prompt("Optional reason / note for completing the issue:", "");
    try {
      setLoading(true);
      const payload: any = { issue_id: issue.issue_id, completed_by: "office1" };
      // reason will be stored on system_alerts if needed (backend may or may not accept reason field)
      if (reason) payload.reason = reason;
      const res = await api.post("/beam-issues/complete", payload);
      if (res.data?.success) {
        alert("Issue completed.");
        // refresh inward/issue
        setIssue(null);
        const inwardRes = await api.get(`/beam-inwards/by-beam/${encodeURIComponent(beamNo)}?plant_id=1`).catch(()=>null);
        setInward(inwardRes?.data?.data || null);
      } else {
        alert("Complete response: " + JSON.stringify(res.data));
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Error completing");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Beam Issue</h2>

      <div className="card">
        <div className="form-row">
          <div className="col">
            <input className="input" placeholder="Enter Beam No (e.g. B-1)" value={beamNo} onChange={(e)=>setBeamNo(e.target.value)} />
          </div>
          <div>
            <button className="btn" onClick={fetchInward}>Fetch</button>
          </div>
        </div>

        {loading && <Loader/>}

        {inward && (
          <div style={{marginTop:12}}>
            <div className="small">Beam: <strong>{inward.beam_no}</strong> • Sizing: {inward.sizing_meter} m • L-to-L: {inward.sizing_mark_interval}</div>

            {issue ? (
              <div className="card" style={{marginTop:12}}>
                <div className="small">Active Issue</div>
                <div>Issue ID: {issue.issue_id} • Design: {issue.design_id} • Expected: {issue.expected_meter} • Produced: {issue.produced_meter}</div>
                <div style={{marginTop:8}}>
                  <button className="btn ghost" onClick={() => { navigator.clipboard?.writeText(JSON.stringify(issue)); alert('Copied issue JSON'); }}>Copy</button>
                  <button className="btn" onClick={handleComplete} style={{marginLeft:8}}>Complete Issue</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{height:10}} />
                <div className="form-row">
                  <div className="col">
                    <label>Select Loom</label>
                    <select className="input" value={form.loom_id} onChange={(e)=>{ setForm({...form, loom_id: e.target.value}); }}>
                      <option value="">Select Loom</option>
                      {looms.map(l => <option key={l.loom_id} value={l.loom_id}>{l.loom_no}</option>)}
                    </select>
                  </div>
                  <div className="col">
                    <label>Select Design</label>
                    <select className="input" value={form.design_id} onChange={(e)=>{ setForm({...form, design_id: e.target.value, fabric_mark_interval: designs.find(d => d.design_id == Number(e.target.value))?.average_meter || form.fabric_mark_interval}); }}>
                      <option value="">Select Design</option>
                      {designs.map(d => <option key={d.design_id} value={d.design_id}>{d.design_no}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{marginTop:10}} className="form-row">
                  <div className="col">
                    <label>Fabric mark interval (Lf)</label>
                    <input className="input" value={form.fabric_mark_interval} onChange={(e)=>setForm({...form, fabric_mark_interval: e.target.value})} />
                  </div>
                  <div className="col">
                    <label>Roll per meter</label>
                    <input className="input" type="number" value={form.roll_per_meter} onChange={(e)=>setForm({...form, roll_per_meter: Number(e.target.value)})} />
                  </div>
                </div>

                <div style={{marginTop:10}}>
                  <button className="btn" onClick={handleIssue}>Issue Beam</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="card" style={{marginTop:16}}>
        <h4>Lookup active issue by Loom</h4>
        <div className="form-row">
          <div className="col">
            <select className="input" onChange={(e)=>{ const v = Number(e.target.value); if (v) fetchActiveByLoom(v); }}>
              <option value="">Select loom to check active issue</option>
              {looms.map(l => <option key={l.loom_id} value={l.loom_id}>{l.loom_no}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}