// src/pages/Alerts.tsx
import { useEffect, useState } from "react";
import { api } from "../api";

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    api.get("/system-alerts?plant_id=1")
      .then(r => setAlerts(r.data?.data || []))
      .catch(() => setAlerts([]));
  }, []);

  return (
    <div>
      <h2>System Alerts</h2>
      {alerts.length === 0 && <p>No alerts</p>}
      {alerts.map(a => (
        <div key={a.id || a.alert_id} style={{ background: "#fff3cd", padding: 10, marginBottom: 8 }}>
          <strong>{a.alert_type || "ALERT"}</strong> — {a.message}
        </div>
      ))}
    </div>
  );
}