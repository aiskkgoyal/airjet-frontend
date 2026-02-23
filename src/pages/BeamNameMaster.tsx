// src/pages/BeamNameMaster.tsx
import React, { useEffect, useState } from "react";
import api from "../api/api";

export default function BeamNameMaster(){
  const [name, setName] = useState("");
  const [yarn, setYarn] = useState("");
  const [ends, setEnds] = useState<number | "">("");
  const [rs, setRs] = useState("");
  const [list, setList] = useState<any[]>([]);

  useEffect(()=> {
    fetch();
  }, []);
  async function fetchList(){ const r = await api.get("/beam-names?plant_id=1"); setList(r.data.data || []); }

  async function add(){
    if(!name) return alert("Name");
    try{
      await api.post("/beam-names", { plant_id:1, beam_name: name, yarn, total_end: ends? Number(ends): null, rs });
      setName(""); setYarn(""); setEnds(""); setRs("");
      fetchList();
    }catch(e:any){ alert(e?.response?.data?.message || e?.message) }
  }

  return (
    <div>
      <h2>Beam Name Master</h2>
      <div className="card">
        <div className="form-row">
          <div className="col"><input className="input" placeholder="Beam Name" value={name} onChange={e=>setName(e.target.value)} /></div>
          <div className="col"><input className="input" placeholder="Yarn" value={yarn} onChange={e=>setYarn(e.target.value)} /></div>
          <div className="col"><input className="input" placeholder="Total end" value={ends as any} onChange={e=>setEnds(e.target.value? Number(e.target.value): "")} /></div>
          <div className="col"><input className="input" placeholder="RS" value={rs} onChange={e=>setRs(e.target.value)} /></div>
        </div>
        <div style={{marginTop:8}}>
          <button className="btn" onClick={add}>Add Beam Name</button>
        </div>
      </div>

      <div className="card">
        <h3>Existing</h3>
        <table className="table">
          <thead><tr><th>Beam Name</th><th>Yarn</th><th>Ends</th><th>RS</th></tr></thead>
          <tbody>
            {list.map(b=> <tr key={b.beam_name_id}><td>{b.beam_name}</td><td>{b.yarn}</td><td>{b.total_end}</td><td>{b.rs}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}