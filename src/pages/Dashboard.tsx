import { useEffect, useState } from "react";
import { api } from "../api";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get("/dashboard?plant_id=1")
      .then(res => setData(res.data.data));
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard</h2>
      <p>Active Beams: {data.active_beams}</p>
      <p>Grey Stock: {data.grey_stock_meter}</p>
      <p>Scrap Stock: {data.scrap_stock_meter}</p>
    </div>
  );
}