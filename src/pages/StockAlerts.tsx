// src/pages/StockAlerts.tsx
import React, { useEffect, useState } from "react";
import api from "../api/api";

export default function StockAlerts(){
  const [alerts, setAlerts] = useState<any[]>([]);
  useEffect(()=> {
    api.get("/stock/alerts?plant_id=1").then(r=>setAlerts(r.data.data || [])).catch(err=>console.error(err));
  },[]);
  return (
    <div>
      <h2>System Alerts</h2>
      <div className="card">
        <table className="table">
          <thead><tr><th>Date</th><th>Type</th><th>Issue ID</th><th>Message</th></tr></thead>
          <tbody>
            {alerts.map(a => (
              <tr key={a.alert_id}>
                <td>{new Date(a.created_at).toLocaleString()}</td>
                <td>{a.alert_type}</td>
                <td>{a.issue_id}</td>
                <td>{a.message}</td>
              </tr>
            ))}
            {alerts.length===0 && <tr><td colSpan={4} className="small">No alerts</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}