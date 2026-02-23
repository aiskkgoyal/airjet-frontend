// src/pages/InactiveBeams.tsx
import React, { useEffect, useState } from "react";
import api from "../api/api";

export default function InactiveBeams(){
  const [days, setDays] = useState(30);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchList(){
    try{
      setLoading(true);
      const res = await api.get(`/beam-issues/inactive?days=${days}`);
      setRows(res.data.data || []);
    }catch(e){ console.error(e); alert("Error fetching"); } finally { setLoading(false); }
  }

  async function runCheck(){
    try{
      setLoading(true);
      const res = await api.post(`/beam-issues/inactive/check`, { days });
      alert("Inactive check run: " + JSON.stringify(res.data.data || "OK"));
      fetchList();
    }catch(e:any){ alert(e?.response?.data?.message || e?.message || "Error"); } finally { setLoading(false); }
  }

  useEffect(()=>{ fetchList(); }, []);

  return (
    <div>
      <h2>Inactive Issues (older than days)</h2>
      <div className="card">
        <div className="form-row">
          <div className="col">
            <input className="input" type="number" value={days} onChange={(e)=>setDays(Number(e.target.value))} />
          </div>
          <div>
            <button className="btn" onClick={fetchList}>Refresh</button>
          </div>
          <div>
            <button className="btn ghost" onClick={runCheck}>Run inactive-check</button>
          </div>
        </div>

        <table className="table" style={{marginTop:12}}>
          <thead><tr><th>Issue ID</th><th>Beam No</th><th>Issued At</th><th>Status</th><th>Produced</th><th>Expected</th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.issue_id}>
                <td>{r.issue_id}</td>
                <td>{r.beam_no}</td>
                <td>{new Date(r.issued_at).toLocaleString()}</td>
                <td>{r.status}</td>
                <td>{r.produced_meter}</td>
                <td>{r.expected_meter}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="small">No inactive issues</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}