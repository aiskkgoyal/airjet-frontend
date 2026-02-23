// src/pages/BeamInward.tsx
import React, { useEffect, useState } from "react";
import api from "../api/api";
import Loader from "../components/Loader";

export default function BeamInward(){
  const [loading, setLoading] = useState(false);
  const [suggest, setSuggest] = useState<string | null>(null);
  const [form, setForm] = useState({
    plant_id: 1,
    set_no: "",
    beam_name_id: "" as any,
    beam_no: "", // optional manual override
    sizing_meter: 10000,
    sizing_mark_interval: 110,
    created_by: "operator1"
  });

  useEffect(()=> {
    fetchSuggest();
  },[]);

  async function fetchSuggest(){
    try{
      const res = await api.get("/beam-inwards/suggest-next?plant_id=1");
      setSuggest(res.data?.next_beam_no || null);
    }catch(e){ console.log(e); setSuggest(null); }
  }

  async function handleSubmit(){
    setLoading(true);
    try{
      const payload = {
        plant_id: form.plant_id,
        set_no: form.set_no || null,
        beam_name_id: form.beam_name_id? Number(form.beam_name_id) : null,
        beam_no: form.beam_no || undefined,
        sizing_meter: Number(form.sizing_meter),
        sizing_mark_interval: Number(form.sizing_mark_interval),
        created_by: form.created_by
      };
      const res = await api.post("/beam-inwards", payload);
      alert("Inward created: " + JSON.stringify(res.data.data));
      // refresh suggestion
      fetchSuggest();
      setForm({...form, beam_no: ""});
    }catch(err:any){
      alert(err?.response?.data?.message || err?.message || "Error");
    } finally { setLoading(false); }
  }

  return (
    <div>
      <h2>Beam Inward</h2>

      <div className="card">
        <div className="small">Suggested Beam No (final assigned at Save): <strong>{suggest || "—"}</strong></div>
        <div style={{height:10}}/>
        <div className="form-row">
          <div className="col">
            <label>Set No</label>
            <input className="input" value={form.set_no} onChange={e=>setForm({...form,set_no:e.target.value})} />
          </div>
          <div className="col">
            <label>Beam No (Manual override optional, supervisor only)</label>
            <input className="input" value={form.beam_no} onChange={e=>setForm({...form,beam_no:e.target.value})} />
          </div>
        </div>

        <div className="form-row">
          <div className="col">
            <label>Sizing Meter</label>
            <input type="number" className="input" value={form.sizing_meter} onChange={e=>setForm({...form,sizing_meter:Number(e.target.value)})}/>
          </div>
          <div className="col">
            <label>Sizing Mark Interval (L-to-L)</label>
            <input type="number" className="input" value={form.sizing_mark_interval} onChange={e=>setForm({...form,sizing_mark_interval:Number(e.target.value)})}/>
          </div>
        </div>

        <div style={{display:'flex',gap:8}}>
          <button className="btn" onClick={handleSubmit} disabled={loading}>{loading? "Saving...":"Save Inward"}</button>
          <button className="btn ghost" onClick={()=>{ setForm({...form, set_no:"", beam_no:"", sizing_meter:10000}) }}>Reset</button>
        </div>

      </div>
    </div>
  );
}