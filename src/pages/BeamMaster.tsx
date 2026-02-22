// src/pages/BeamMaster.tsx
import { useState } from "react";
import { api } from "../api";

export default function BeamMaster() {
  const [form, setForm] = useState({ beam_name: "", yarn: "", total_end: "", rs: "" });

  const handleSave = async () => {
    try {
      await api.post("/beam-names", form);
      alert("Beam Name saved");
      setForm({ beam_name: "", yarn: "", total_end: "", rs: "" });
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div>
      <h2>Beam Name Master</h2>
      <div style={{ maxWidth: 700 }}>
        <input placeholder="Beam Name" value={form.beam_name} onChange={e => setForm({ ...form, beam_name: e.target.value })} style={inputStyle} />
        <input placeholder="Yarn" value={form.yarn} onChange={e => setForm({ ...form, yarn: e.target.value })} style={inputStyle} />
        <input placeholder="Total End" value={form.total_end} onChange={e => setForm({ ...form, total_end: e.target.value })} style={inputStyle} />
        <input placeholder="RS" value={form.rs} onChange={e => setForm({ ...form, rs: e.target.value })} style={inputStyle} />

        <button onClick={handleSave}>Save Beam Name</button>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = { display: "block", width: "100%", padding: 8, marginBottom: 10 };