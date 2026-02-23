// src/pages/ProductionEntry.tsx
import React, { useEffect, useState } from "react";
import api from "../api/api";
import Loader from "../components/Loader";

type Row = {
  meter: number | "";
  weight: number | "";
  damage_meter: number | "";
  damage_weight: number | "";
  marks: number[];
  avg_mark_interval?: number | null;
};

export default function ProductionEntry() {
  const [beamNo, setBeamNo] = useState("");
  const [issue, setIssue] = useState<any>(null);
  const [designs, setDesigns] = useState<any[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<number | "">("");
  const [rows, setRows] = useState<Row[]>([{ meter:"", weight:"", damage_meter:0, damage_weight:0, marks:[] }]);
  const [loading, setLoading] = useState(false);
  const [parentPieceNo, setParentPieceNo] = useState<number | null>(null);

  useEffect(()=>{ api.get("/designs?plant_id=1").then(r=>setDesigns(r.data.data||[])).catch(()=>{}); },[]);

  async function fetchIssue(){
    if(!beamNo) return alert("Enter beam no");
    try {
      setLoading(true);
      const res = await api.get(`/beam-issues/active?plant_id=1&beam_no=${encodeURIComponent(beamNo)}`);
      setIssue(res.data.data);
      if(!res.data.data) alert("No active issue found");
    } catch(e:any){ alert(e?.response?.data?.message || e?.message) } finally { setLoading(false) }
  }

  function addRow(){ setRows([...rows, {meter:"", weight:"", damage_meter:0, damage_weight:0, marks:[]}]); }
  function removeRow(i:number){ const a=[...rows]; a.splice(i,1); setRows(a); }

  function updateMark(rowIdx:number, markIdx:number, val:string){
    const a = [...rows];
    const marks = [...a[rowIdx].marks];
    if(val === "") marks.splice(markIdx,1);
    else marks[markIdx] = Number(val);
    a[rowIdx].marks = marks;
    // calculate avg
    const diffs:number[] = [];
    for(let i=1;i<marks.length;i++) if(typeof marks[i] === "number" && typeof marks[i-1] === "number") diffs.push(marks[i]-marks[i-1]);
    a[rowIdx].avg_mark_interval = diffs.length ? Number((diffs.reduce((s,n)=>s+n,0)/diffs.length).toFixed(4)) : null;
    setRows(a);
  }

  function updateRowField(rowIdx:number, field:keyof Row, v:any){
    const a=[...rows]; (a[rowIdx] as any)[field] = v; setRows(a);
  }

  function computeTotals(){
    const t = { meter:0, net_meter:0, weight:0, net_weight:0, damage_meter:0, damage_weight:0 };
    for(const r of rows){
      const meter = Number(r.meter || 0);
      const weight = Number(r.weight || 0);
      const dm = Number(r.damage_meter || 0);
      const dw = Number(r.damage_weight || 0);
      t.meter += meter; t.damage_meter += dm; t.damage_weight += dw; t.weight += weight; t.net_meter += Math.max(0, meter-dm); t.net_weight += Math.max(0, weight-dw);
    }
    return t;
  }

  async function handleSave(){
    if(!issue) return alert("Fetch issue first");
    if(!selectedDesign) return alert("Select design");
    for(let i=0;i<rows.length;i++){
      const r = rows[i];
      if(!r.meter || Number(r.meter) <= 0) return alert(`Row ${i+1} meter required`);
      const marks = r.marks || [];
      for(let j=1;j<marks.length;j++) if(marks[j] <= marks[j-1]) return alert(`Row ${i+1} marks must be increasing`);
      if(marks.length && marks[marks.length-1] > Number(r.meter)) return alert(`Row ${i+1} last mark cannot exceed roll meter`);
    }
    const payload = {
      plant_id: 1,
      issue_id: issue.issue_id,
      design_id: Number(selectedDesign),
      rows: rows.map(r => ({ meter: Number(r.meter), weight: Number(r.weight), damage_meter: Number(r.damage_meter||0), damage_weight: Number(r.damage_weight||0), marks: r.marks.map(Number) })),
      created_by: "labour1"
    };
    try {
      setLoading(true);
      const res = await api.post("/production-entry", payload);
      const result = res.data.data; // <--- backend returns { data: result }
      alert("Saved. Parent piece no: " + result.parent_piece_no);
      setParentPieceNo(result.parent_piece_no);
      // reset
      setRows([{ meter:"", weight:"", damage_meter:0, damage_weight:0, marks:[] }]);
      // refresh issue status
      const issueRes = await api.get(`/beam-issues/active?plant_id=1&beam_no=${encodeURIComponent(beamNo)}`).catch(()=>null);
      setIssue(issueRes?.data?.data || null);
    } catch (e:any) {
      alert(e?.response?.data?.message || e?.message || "Error saving");
    } finally {
      setLoading(false);
    }
  }

  const totals = computeTotals();
  const pending = issue ? (Number(issue.expected_meter || 0) - Number(issue.produced_meter || 0)) : null;

  return (
    <div>
      <h2>Production / Store Receive</h2>

      <div className="card">
        <div style={{display:'flex', gap:8}}>
          <input className="input" placeholder="Beam No (B-1)" value={beamNo} onChange={(e)=>setBeamNo(e.target.value)} />
          <button className="btn" onClick={fetchIssue}>Fetch Issue</button>
        </div>

        {loading && <Loader/>}

        {issue && (
          <div style={{marginTop:12}}>
            <div className="small">Beam: <strong>{issue.beam_no}</strong> | Expected: {issue.expected_meter} | Produced: {issue.produced_meter} | Pending: {pending !== null ? pending.toFixed(3) : '—'}</div>

            <div style={{marginTop:12}} className="form-row">
              <div className="col">
                <label>Design for this receive</label>
                <select className="input" value={selectedDesign} onChange={(e)=>setSelectedDesign(e.target.value ? Number(e.target.value) : "")}>
                  <option value="">Select design</option>
                  {designs.map(d=> <option key={d.design_id} value={d.design_id}>{d.design_no}{d.average_meter?` (Lf ${d.average_meter})`:''}</option>)}
                </select>
              </div>
            </div>

            {rows.map((r, ri)=>(
              <div key={ri} className="card" style={{marginTop:12}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div><strong>Row #{ri+1}</strong></div>
                  <div><button className="btn ghost" onClick={()=>removeRow(ri)}>Delete</button></div>
                </div>

                <div className="form-row" style={{marginTop:8}}>
                  <div className="col"><label>Roll Meter</label><input className="input" value={r.meter as any} onChange={(e)=>updateRowField(ri,'meter', e.target.value)} /></div>
                  <div className="col"><label>Roll Weight</label><input className="input" value={r.weight as any} onChange={(e)=>updateRowField(ri,'weight', e.target.value)} /></div>
                  <div className="col"><label>Damage Meter</label><input className="input" value={r.damage_meter as any} onChange={(e)=>updateRowField(ri,'damage_meter', Number(e.target.value))} /></div>
                  <div className="col"><label>Damage Weight</label><input className="input" value={r.damage_weight as any} onChange={(e)=>updateRowField(ri,'damage_weight', Number(e.target.value))} /></div>
                </div>

                <div style={{marginTop:8}}>
                  <div className="small">Marks (absolute meter). Add by typing a number and pressing Enter in the input below.</div>
                  <div style={{marginTop:8}}>
                    { (r.marks||[]).map((m, mi)=>(
                      <div key={mi} style={{display:'flex', gap:8, marginBottom:6}}>
                        <input className="input" style={{width:160}} value={m} onChange={(e)=>updateMark(ri, mi, e.target.value)} />
                        <div className="small">index {mi+1}</div>
                      </div>
                    ))}

                    <div style={{display:'flex', gap:8, marginTop:6}}>
                      <input className="input" placeholder="Add mark (meter) then press Enter" style={{width:260}} onKeyDown={(e)=>{
                        if(e.key === 'Enter'){
                          const val = (e.target as HTMLInputElement).value;
                          if(!val) return;
                          const a = [...rows];
                          a[ri].marks = [...(a[ri].marks||[]), Number(val)];
                          // recalc avg
                          const marks = a[ri].marks;
                          const diffs:number[] = [];
                          for(let i=1;i<marks.length;i++) diffs.push(marks[i]-marks[i-1]);
                          a[ri].avg_mark_interval = diffs.length ? Number((diffs.reduce((s,n)=>s+n,0)/diffs.length).toFixed(4)) : null;
                          setRows(a);
                          (e.target as HTMLInputElement).value = "";
                        }
                      }} />
                    </div>
                    <div className="small" style={{marginTop:8}}>Avg mark interval: {r.avg_mark_interval ?? '—'}</div>
                  </div>
                </div>

              </div>
            ))}

            <div style={{marginTop:12, display:'flex', gap:8}}>
              <button className="btn" onClick={addRow}>Add Row</button>
              <button className="btn" onClick={handleSave}>Save Receive</button>
            </div>

            <div style={{marginTop:12}}>
              <div className="small">Totals: Sum meter {totals.meter.toFixed(3)} • Net meter {totals.net_meter.toFixed(3)} • Sum weight {totals.weight.toFixed(3)}</div>
              {pending !== null && totals.meter > pending && <div className="alert" style={{marginTop:8}}>Warning: receive exceeds pending by {(totals.meter-pending).toFixed(3)} m — office will be alerted.</div>}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}