// src/pages/BeamInward.tsx
import React, { useEffect, useState } from "react";
import { api } from "../api";

type Form = {
  plant_id: number;
  set_no?: string;
  beam_name_id?: number | "";
  sizing_meter: number;
  sizing_mark_interval: number;
  created_by?: string;
};

export default function BeamInward() {
  const [form, setForm] = useState<Form>({
    plant_id: 1,
    set_no: "",
    beam_name_id: "",
    sizing_meter: 0,
    sizing_mark_interval: 110,
    created_by: "operator1",
  });

  const [suggested, setSuggested] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSuggested();
  }, []);

  const fetchSuggested = async () => {
    try {
      const res = await api.get("/beam-inwards/suggest-next", { params: { plant_id: 1 } });
      setSuggested(res.data.next_beam_no || null);
    } catch (e) {
      console.warn("Could not fetch suggestion", e);
      setSuggested(null);
    }
  };

  const handleChange = (k: keyof Form, v: any) => {
    setForm(f => ({ ...f, [k]: v }));
  };

  const handleSave = async () => {
    if (!form.sizing_meter || form.sizing_meter <= 0) return alert("Enter sizing meter > 0");
    try {
      setSaving(true);
      const payload: any = {
        plant_id: form.plant_id,
        set_no: form.set_no || null,
        beam_name_id: form.beam_name_id || null,
        sizing_meter: form.sizing_meter,
        sizing_mark_interval: form.sizing_mark_interval,
        created_by: form.created_by,
      };
      const res = await api.post("/beam-inwards", payload);
      alert(`Beam Inward saved. Assigned Beam No: ${res.data.data.beam.beam_no}`);
      // refresh suggestion
      setForm({
        plant_id: 1,
        set_no: "",
        beam_name_id: "",
        sizing_meter: 0,
        sizing_mark_interval: 110,
        created_by: "operator1",
      });
      fetchSuggested();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Error saving");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Beam Inward</h2>

      <div style={{ marginBottom: 8 }}>
        <strong>Suggested Beam No:</strong> {suggested ?? "—"}
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>Set No</label>
        <input value={form.set_no} onChange={e => handleChange("set_no", e.target.value)} />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>Beam Name (optional)</label>
        <input
          value={form.beam_name_id as any}
          onChange={e => handleChange("beam_name_id", e.target.value ? Number(e.target.value) : "")}
          placeholder="(optional id)"
        />
        <div style={{ fontSize: 12, color: "#666" }}>
          (You can enter an existing beam_name_id or leave blank)
        </div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>Sizing Meter</label>
        <input
          type="number"
          value={form.sizing_meter}
          onChange={e => handleChange("sizing_meter", Number(e.target.value))}
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>Sizing Mark Interval (L to L) — default 110</label>
        <input
          type="number"
          step="0.1"
          value={form.sizing_mark_interval}
          onChange={e => handleChange("sizing_mark_interval", Number(e.target.value))}
        />
      </div>

      <div>
        <button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Beam Inward"}
        </button>
      </div>
    </div>
  );
}