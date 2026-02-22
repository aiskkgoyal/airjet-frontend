// src/pages/ActiveLooms.tsx
import { useEffect, useState } from "react";
import { api } from "../api";

export default function ActiveLooms() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    api.get("/active-looms?plant_id=1")
      .then(r => setRows(r.data?.data || []))
      .catch(() => setRows([]));
  }, []);

  return (
    <div>
      <h2>Active Looms</h2>
      {rows.length === 0 && <p>No active loom</p>}
      {rows.map(r => (
        <div key={r.loom_id} style={{ padding: 10, background: "#e6f7ff", marginBottom: 8 }}>
          <div><strong>Loom:</strong> {r.loom_no}</div>
          <div><strong>Beam:</strong> {r.beam_no}</div>
          <div><strong>Design:</strong> {r.design_no}</div>
          <div><strong>Issued At:</strong> {r.issued_at}</div>
        </div>
      ))}
    </div>
  );
}