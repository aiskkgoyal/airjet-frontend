// src/pages/StockDetails.tsx
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/api";

type LedgerRow = any;

export default function StockDetails(){
  const [params] = useSearchParams();
  const warehouse_id = params.get("warehouse_id");
  const [rows, setRows] = useState<LedgerRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  useEffect(()=>{
    if(!warehouse_id) return;
    setLoading(true); setError(null);
    api.get(`/stock/pieces?plant_id=1&warehouse_id=${warehouse_id}`)
      .then(r=>setRows(r.data.data || []))
      .catch(e=>{ setError(e?.response?.data?.message || e?.message || "Error"); })
      .finally(()=>setLoading(false));
  },[warehouse_id]);

  // simple transfer flow (prompt-based)
  async function doTransfer(){
    const to = window.prompt("Enter destination warehouse_id:");
    if(!to) return;
    const meter = window.prompt("Enter meter to transfer (comma-separated for 1 item) e.g. 100");
    if(!meter) return;
    const weight = window.prompt("Enter weight for transfer:");
    if(!weight) return;
    const ok = window.confirm(`Transfer ${meter} m (${weight} w) from warehouse ${warehouse_id} -> ${to}?`);
    if(!ok) return;
    try{
      const payload = {
        plant_id: 1,
        from_warehouse_id: Number(warehouse_id),
        to_warehouse_id: Number(to),
        rows: [{ meter: Number(meter), weight: Number(weight) }],
        transferred_by: "ui-user",
        reason: "manual transfer via UI"
      };
      const res = await api.post("/stock/transfer", payload);
      alert("Transfer done: " + JSON.stringify(res.data.data));
      // refresh
      const r2 = await api.get(`/stock/pieces?plant_id=1&warehouse_id=${warehouse_id}`);
      setRows(r2.data.data || []);
    }catch(e:any){ alert(e?.response?.data?.message || e?.message) }
  }

  async function doAdjust(){
    const meter = window.prompt("Meter adjust (use negative to reduce):", "0");
    if(meter === null) return;
    const weight = window.prompt("Weight adjust (use negative to reduce):", "0");
    if(weight === null) return;
    const reason = window.prompt("Reason for adjustment:", "reconciliation");
    try{
      const payload = { plant_id:1, warehouse_id: Number(warehouse_id), meter_adjust: Number(meter), weight_adjust: Number(weight), action_by: "ui-user", reason };
      const res = await api.post("/stock/audit/adjust", payload);
      alert("Adjusted ledger id: " + JSON.stringify(res.data.data));
      // refresh
      const r2 = await api.get(`/stock/pieces?plant_id=1&warehouse_id=${warehouse_id}`);
      setRows(r2.data.data || []);
    }catch(e:any){ alert(e?.response?.data?.message || e?.message) }
  }

  async function doLock(){
    const reason = window.prompt("Reason to lock for audit:", "audit");
    if(reason === null) return;
    try{
      const res = await api.post("/stock/audit/lock", { plant_id:1, warehouse_id: Number(warehouse_id), action_by: "ui-user", reason });
      alert("Locked: " + JSON.stringify(res.data.data));
    }catch(e:any){ alert(e?.response?.data?.message || e?.message) }
  }

  return (
    <div>
      <h2>Warehouse Details - {warehouse_id}</h2>
      <div className="card">
        <div style={{display:'flex', gap:8, marginBottom:12}}>
          <button className="btn" onClick={doTransfer}>Transfer Stock</button>
          <button className="btn ghost" onClick={doAdjust}>Adjust / Reconcile</button>
          <button className="btn ghost" onClick={doLock}>Lock for Audit</button>
        </div>

        {loading && <div className="small">Loading...</div>}
        {error && <div className="alert">{error}</div>}

        <table className="table">
          <thead><tr><th>Ledger ID</th><th>Parent Piece</th><th>Full Piece</th><th>Meter</th><th>Weight</th><th>Type</th><th>Date</th></tr></thead>
          <tbody>
            {rows.length===0 && <tr><td colSpan={7} className="small">No records</td></tr>}
            {rows.map((r:any)=>(
              <tr key={r.ledger_id}>
                <td>{r.ledger_id}</td>
                <td>{r.parent_piece_no ?? "-"}</td>
                <td>{r.full_piece_no ?? "-"}</td>
                <td>{typeof r.meter === 'number' ? r.meter.toFixed(3) : r.meter}</td>
                <td>{typeof r.weight === 'number' ? r.weight.toFixed(3) : r.weight}</td>
                <td>{r.type}</td>
                <td>{r.created_at ? new Date(r.created_at).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}