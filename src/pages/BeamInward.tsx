// src/pages/BeamInward.tsx
import React, { useEffect, useState } from "react";
import api from "../api/api"; // your axios wrapper
import Loader from "../components/Loader";

type Row = {
  set_no: string;
  beam_name_id: number | null;
  sizing_meter: string; // string so it can be empty ""
  sizing_mark_interval: number;
  preview?: string;
};

function formatBeam(num: number) {
  return `B-${num.toString().padStart(4, "0")}`;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function BeamInward() {
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [inwardDate, setInwardDate] = useState<string>(todayISO());

  // rows start with empty sizing_meter
  const [rows, setRows] = useState<Row[]>([
    { set_no: "", beam_name_id: null, sizing_meter: "", sizing_mark_interval: 110, preview: undefined }
  ]);

  const [beamNames, setBeamNames] = useState<{ beam_name_id: number; beam_name: string }[]>([]);
  const plant_id = 1;

  useEffect(() => {
    fetchBeamNames();
    fetchPreviewAndSet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchBeamNames() {
    try {
      const res = await api.get(`/beam-names?plant_id=${plant_id}`);
      if (res?.data?.data) setBeamNames(res.data.data);
    } catch (err) {
      // optional endpoint
    }
  }

  async function fetchPreviewAndSet() {
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const res = await api.get(`/beam-inwards/preview-next?plant_id=${plant_id}`);
      const data = res?.data || {};
      let startNum: number | null = null;

      if (typeof data.current_number === "number") {
        startNum = data.current_number + 1;
      } else if (typeof data.next_beam_no === "string") {
        const m = data.next_beam_no.match(/\d+/);
        if (m) startNum = parseInt(m[0], 10);
      } else if (typeof data.next === "string") {
        const m = data.next.match(/\d+/);
        if (m) startNum = parseInt(m[0], 10);
      }

      if (startNum === null) {
        setPreviewError("Preview not available");
        setPreviewLoading(false);
        return;
      }

      setRows((prevRows) => {
        const mapped = prevRows.length ? prevRows : [{ set_no: "", beam_name_id: null, sizing_meter: "", sizing_mark_interval: 110 }];
        return mapped.map((r, idx) => ({
          ...r,
          // keep sizing_meter as-is (empty if user hasn't filled)
          preview: formatBeam(startNum! + idx)
        }));
      });
    } catch (err: any) {
      setPreviewError(err?.response?.data?.message || err?.message || "Failed to fetch preview");
    } finally {
      setPreviewLoading(false);
    }
  }

  function parseFirstPreviewNumber(currentRows: Row[]) {
    const p = currentRows[0]?.preview;
    if (!p) return null;
    const m = p.match(/\d+/);
    if (!m) return null;
    return parseInt(m[0], 10);
  }

  function addRow() {
    setRows((prev) => {
      const first = parseFirstPreviewNumber(prev);
      const newRow: Row = { set_no: "", beam_name_id: null, sizing_meter: "", sizing_mark_interval: 110 };
      const newRows = [...prev, newRow];
      if (first != null) {
        return newRows.map((r, idx) => ({ ...r, preview: formatBeam(first + idx) }));
      }
      return newRows;
    });
  }

  function removeRow(index: number) {
    setRows((prev) => {
      const previousFirst = parseFirstPreviewNumber(prev);
      const n = prev.filter((_, i) => i !== index);
      if (previousFirst != null) {
        return n.map((r, idx) => ({ ...r, preview: formatBeam(previousFirst + idx) }));
      }
      return n;
    });
  }

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((prev) => {
      const n = prev.slice();
      n[index] = { ...n[index], ...patch };
      return n;
    });
  }

  async function handleSaveAll() {
    setLoading(true);
    try {
      if (!rows || rows.length === 0) throw new Error("No rows to save");
      for (const r of rows) {
        if (!r.beam_name_id) throw new Error("Select beam name for all rows");
        if (r.sizing_meter === "") throw new Error("Sizing meter is required for all rows");
        const meterNum = Number(r.sizing_meter);
        if (!isFinite(meterNum) || meterNum <= 0) throw new Error("Sizing meter must be a positive number");
      }

      const payload = {
        plant_id,
        inward_date: inwardDate,
        rows: rows.map((r) => ({
          set_no: r.set_no || null,
          beam_name_id: r.beam_name_id,
          sizing_meter: Number(r.sizing_meter),
          sizing_mark_interval: Number(r.sizing_mark_interval || 110)
        })),
        created_by: "operator1"
      };

      const res = await api.post("/beam-inwards", payload);
      if (res?.data?.success) {
        const assigned = res.data.data?.assigned_beams || res.data.data?.assigned || res.data.data || res.data;
        alert("Saved. Assigned: " + JSON.stringify(assigned));
        resetForm();
      } else {
        throw new Error(res?.data?.message || "Save failed");
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Error saving");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setInwardDate(todayISO());
    setRows([{ set_no: "", beam_name_id: null, sizing_meter: "", sizing_mark_interval: 110 }]);
    fetchPreviewAndSet();
  }

  const todayDisplay = new Date(inwardDate).toLocaleDateString("en-GB");

  return (
    <div>
      <h2>Beam Inward</h2>

      <div className="card" autoComplete="off">
        <div style={{ marginBottom: 12 }}>
          <div style={{ marginBottom: 6 }}>Date</div>
          <input
            type="date"
            className="input"
            value={inwardDate}
            onChange={(e) => setInwardDate(e.target.value)}
            autoComplete="off"
          />
          <div style={{ marginTop: 6, color: "#666", fontSize: 12 }}>Display: {todayDisplay}</div>
        </div>

        <table className="table" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th style={{ width: 180 }}>Beam No (Preview)</th>
              <th>Set No</th>
              <th style={{ width: 220 }}>Beam Name</th>
              <th style={{ width: 140 }}>Sizing Meter</th>
              <th style={{ width: 120 }}>L-to-L</th>
              <th style={{ width: 80 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx}>
                <td>
                  {previewLoading ? (
                    <span>Loading...</span>
                  ) : previewError ? (
                    <span style={{ color: "crimson" }}>{previewError}</span>
                  ) : (
                    <strong>{r.preview}</strong>
                  )}
                </td>
                <td>
                  <input
                    className="input"
                    value={r.set_no}
                    onChange={(e) => updateRow(idx, { set_no: e.target.value })}
                    autoComplete="off"
                  />
                </td>
                <td>
                  <select
                    className="input"
                    value={r.beam_name_id ?? ""}
                    onChange={(e) =>
                      updateRow(idx, {
                        beam_name_id: e.target.value ? Number(e.target.value) : null
                      })
                    }
                    autoComplete="off"
                  >
                    <option value="">Select</option>
                    {beamNames.map((b) => (
                      <option key={b.beam_name_id} value={b.beam_name_id}>
                        {b.beam_name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    className="input"
                    value={r.sizing_meter}
                    onChange={(e) => updateRow(idx, { sizing_meter: e.target.value })}
                    placeholder=""
                    autoComplete="off"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="input"
                    value={r.sizing_mark_interval}
                    onChange={(e) => updateRow(idx, { sizing_mark_interval: Number(e.target.value || 0) })}
                    autoComplete="off"
                  />
                </td>
                <td>
                  <button
                    className="btn ghost"
                    onClick={() => removeRow(idx)}
                    disabled={rows.length === 1}
                    title="Remove row"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 12 }}>
          <button className="btn ghost" onClick={addRow}>
            + Add Beam
          </button>
        </div>

        <div style={{ marginTop: 18, display: "flex", gap: 8 }}>
          <button className="btn" onClick={handleSaveAll} disabled={loading}>
            {loading ? "Saving..." : "Save All"}
          </button>
          <button className="btn ghost" onClick={resetForm}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}