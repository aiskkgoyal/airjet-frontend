// src/pages/DesignMaster.tsx
import React, { useEffect, useState } from "react";
import api from "../api/api";

export default function DesignMaster(){
  const [designNo, setDesignNo] = useState(""); const [desc,setDesc]=useState(""); const [avg,setAvg]=useState<number| "">("");
  const [list,setList]=useState<any[]>([]);
  useEffect(()=> {
    fetch();
  }, []);
  async function fetch(){ const r = await api.get("/designs?plant_id=1"); setList(r.data.data || []); }
  async function add(){ await api.post("/designs",{plant_id:1, design_no:designNo, description:desc, average_meter: avg? Number(avg): null}); setDesignNo(""); setDesc(""); setAvg(""); fetch(); }
  return (<div><h2>Design Master</h2><div className="card"><div className="form-row"><div className="col"><input className="input" placeholder="Design No" value={designNo} onChange={e=>setDesignNo(e.target.value)} /></div><div className="col"><input className="input" placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} /></div><div className="col"><input className="input" placeholder="Avg meter (Lf)" value={avg as any} onChange={e=>setAvg(e.target.value?Number(e.target.value): "")} /></div></div><div style={{marginTop:8}}><button className="btn" onClick={add}>Add Design</button></div></div><div className="card"><h3>Existing Designs</h3><table className="table"><thead><tr><th>Design</th><th>Avg meter</th></tr></thead><tbody>{list.map(d=> <tr key={d.design_id}><td>{d.design_no}</td><td>{d.average_meter}</td></tr>)}</tbody></table></div></div>);
}