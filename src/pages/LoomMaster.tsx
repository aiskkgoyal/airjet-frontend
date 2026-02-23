// src/pages/LoomMaster.tsx
import React, { useEffect, useState } from "react";
import api from "../api/api";
export default function LoomMaster(){
  const [loomNo, setLoomNo] = useState("");
  const [looms, setLooms] = useState<any[]>([]);
  useEffect(()=> {
    fetch();
  }, []);
  async function fetch(){ const r = await api.get("/looms?plant_id=1"); setLooms(r.data.data || []); }
  async function add(){ await api.post("/looms", { plant_id:1, loom_no:loomNo }); setLoomNo(""); fetch(); }
  return (<div><h2>Loom Master</h2><div className="card"><input className="input" placeholder="Loom No" value={loomNo} onChange={e=>setLoomNo(e.target.value)} /><button className="btn" onClick={add}>Add</button></div><div className="card"><h3>Existing</h3><ul>{looms.map(l=> <li key={l.loom_id}>{l.loom_no}</li>)}</ul></div></div>);
}