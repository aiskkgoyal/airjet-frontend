// src/pages/Stock.tsx

import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate, Link } from "react-router-dom";

export default function Stock() {
  const [rows, setRows] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/stock/summary?plant_id=1")
      .then((r) => setRows(r.data.data || []))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>Stock Summary</h2>

      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div className="small">Warehouse totals (meter & weight)</div>
          <div>
            <Link to="/stock-alerts" className="btn ghost">
              View Alerts
            </Link>
          </div>
        </div>

        <table className="table" style={{ marginTop: 12 }}>
          <thead>
            <tr>
              <th>Warehouse</th>
              <th>Type</th>
              <th>Total Meter</th>
              <th>Total Weight</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr
                key={r.warehouse_id}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  navigate(`/stock-details?warehouse_id=${r.warehouse_id}`)
                }
              >
                <td
                  style={{
                    color: "#2563eb",
                    textDecoration: "underline",
                  }}
                >
                  {r.warehouse_name}
                </td>
                <td>{r.type}</td>
                <td>{Number(r.total_meter).toFixed(3)}</td>
                <td>{Number(r.total_weight).toFixed(3)}</td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="small">
                  No stock data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}