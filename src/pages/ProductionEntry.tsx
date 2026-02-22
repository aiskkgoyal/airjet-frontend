// src/pages/ProductionEntry.tsx
import React, { useEffect, useState } from "react";
import { api } from "../api";

type Row = {
  meter: number;
  weight: number;
  damage_meter: number;
  damage_weight: number;
  marks: number[]; // absolute positions
};

export default function ProductionEntry() {
  const [beamNo, setBeamNo] = useState("");
  const [issue, setIssue] = useState<any | null>(null);
  const [designs, setDesigns] = useState<any[]>([]);
  const [designId, setDesignId] = useState<number | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/designs", { params: { plant_id: 1 } })
      .then(r => setDesigns(r.data.data || []))
      .catch(() => setDesigns([]));
  }, []);

  const fetchIssue = async () => {
    if (!beamNo) return alert("Enter beam no");
    try {
      const res = await api.get(`/beam-issues/active`, { params: { plant_id: 1, beam_no: beamNo } });
      if (!res.data.data) {
        alert("No active issue for this beam");
        setIssue(null);
      } else {
        setIssue(res.data.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Error fetching issue");
    }
  };

  const addRow = () => {
    setRows(r => [...r, { meter: 0, weight: 0, damage_meter: 0, damage_weight: 0, marks: [] }]);
  };

  const deleteRow = (i: number) => {
    setRows(r => r.filter((_, idx) => idx !== i));
  };

  const addMark = (rowIndex: number) => {
    setRows(r => {
      const copy = [...r];
      copy[rowIndex].marks = [...copy[rowIndex].marks, 0];
      return copy;
    });
  };

  // live validation of marks: increasing and last <= meter
  const validateRow = (row: Row) => {
    if (!row.meter || row.meter <= 0) return false;
    const net = row.meter - (row.damage_meter || 0);
    if (net <= 0) return false;
    // marks optional: if provided, check monotonic and <= meter
    for (let i = 0; i < row.marks.length; i++) {
      const m = Number(row.marks[i]);
      if (isNaN(m) || m < 0) return false;
      if (i > 0 && m <= row.marks[i - 1]) return false;
      if (m > row.meter + 0.0001) return false;
    }
    return true;
  };

  const isValid = () => {
    if (!issue || !designId) return false;
    if (rows.length === 0) return false;
    for (const r of rows) if (!validateRow(r)) return false;
    return true;
  };

  const handleSave = async () => {
    if (!isValid()) return alert("Validation failed. Check rows and design");
    try {
      setSaving(true);
      const payload = {
        plant_id: 1,
        issue_id: issue.issue_id,
        design_id: designId,
        rows,
        created_by: "labour1",
      };
      const res = await api.post("/production-entry", payload);
      alert(`Saved. Parent piece no: ${res.data.parent_piece_no || res.data.data?.parent_piece_no || "?"}`);
      // reset rows
      setRows([]);
      // refresh issue summary
      fetchIssue();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Error saving production");
    } finally {
      setSaving(false);
    }
  };

  const updateRowField = (i: number, key: keyof Row, value: any) => {
    setRows(r => {
      const copy = [...r];
      (copy[i] as any)[key] = value;
      return copy;
    });
  };

  const updateMark = (rowIndex: number, markIndex: number, value: number) => {
    setRows(r => {
      const copy = [...r];
      const marks = [...copy[rowIndex].marks];
      marks[markIndex] = value;
      copy[rowIndex].marks = marks;
      return copy;
    });
  };

  // helper: compute avg of intervals
  const avgInterval = (marks: number[]) => {
    if (!marks || marks.length < 2) return null;
    let sum = 0;
    for (let i = 1; i < marks.length; i++) sum += marks[i] - marks[i - 1];
    return +(sum / (marks.length - 1)).toFixed(3);
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Production Entry (Receive & Cutting)</h2>

      <div style={{ marginBottom: 8 }}>
        <label>Beam No</label>
        <input value={beamNo} onChange={e => setBeamNo(e.target.value)} />
        <button onClick={fetchIssue} style={{ marginLeft: 8 }}>Load Issue</button>
      </div>

      {issue && (
        <div style={{ marginBottom: 12, border: "1px solid #ddd", padding: 8 }}>
          <div><strong>Loom:</strong> {issue.loom_no}</div>
          <div><strong>Set:</strong> {issue.set_no}</div>
          <div><strong>Expected:</strong> {issue.expected_meter}</div>
          <div><strong>Produced so far:</strong> {issue.produced_meter}</div>
          <div><strong>Pending:</strong> {(issue.expected_meter || 0) - (issue.produced_meter || 0)}</div>
          <div><strong>Inward sizing Ls:</strong> {issue.sizing_mark_interval}</div>
          <div><strong>Issue Lf (prefill):</strong> {issue.fabric_mark_interval}</div>
        </div>
      )}

      <div style={{ marginBottom: 8 }}>
        <label>Select design for this receive</label>
        <select value={designId || 0} onChange={e => setDesignId(Number(e.target.value))}>
          <option value={0}>-- select --</option>
          {designs.map(d => <option key={d.design_id} value={d.design_id}>{d.design_no}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: 8 }}>
        <button onClick={addRow}>Add Roll (Row)</button>
      </div>

      {rows.map((row, i) => {
        const net_meter = +(row.meter - (row.damage_meter || 0)).toFixed(3);
        const net_weight = +(row.weight - (row.damage_weight || 0)).toFixed(3);
        const wpm = net_meter > 0 ? +(net_weight / net_meter).toFixed(4) : 0;
        const avgLf = avgInterval(row.marks);

        return (
          <div key={i} style={{ border: "1px solid #ccc", padding: 8, marginBottom: 8 }}>
            <div><strong>Roll #{i + 1}</strong></div>

            <div>
              <label>Meter</label>
              <input type="number" value={row.meter} onChange={e => updateRowField(i, "meter", Number(e.target.value))} />
            </div>

            <div>
              <label>Weight</label>
              <input type="number" value={row.weight} onChange={e => updateRowField(i, "weight", Number(e.target.value))} />
            </div>

            <div>
              <label>Damage Meter</label>
              <input type="number" value={row.damage_meter} onChange={e => updateRowField(i, "damage_meter", Number(e.target.value))} />
            </div>

            <div>
              <label>Damage Weight</label>
              <input type="number" value={row.damage_weight} onChange={e => updateRowField(i, "damage_weight", Number(e.target.value))} />
            </div>

            <div>
              <div>Net Meter: {net_meter}</div>
              <div>Net Weight: {net_weight}</div>
              <div>Wt/Meter: {wpm}</div>
            </div>

            <div style={{ marginTop: 8 }}>
              <div><strong>Mark points (absolute meters)</strong></div>
              {row.marks.map((mark, mi) => (
                <div key={mi}>
                  <input
                    type="number"
                    value={mark}
                    step="0.001"
                    onChange={e => updateMark(i, mi, Number(e.target.value))}
                  />
                </div>
              ))}
              <div style={{ marginTop: 6 }}>
                <button onClick={() => addMark(i)}>Add Mark</button>
              </div>
              <div style={{ marginTop: 4 }}>
                <small>Avg interval: {avgLf ?? "—"}  (Issue Lf ref: {issue?.fabric_mark_interval ?? "—"})</small>
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <button onClick={() => deleteRow(i)}>Delete Row</button>
            </div>
          </div>
        );
      })}

      <div style={{ marginTop: 8, borderTop: "1px solid #eee", paddingTop: 8 }}>
        <button onClick={handleSave} disabled={!isValid() || saving}>{saving ? "Saving…" : "Save Production"}</button>
      </div>
    </div>
  );
}