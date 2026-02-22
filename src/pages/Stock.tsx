import { useEffect, useState } from "react";
import { api } from "../api";

export default function Stock() {

  const [stocks, setStocks] = useState<any[]>([]);

  useEffect(() => {
    api.get("/stock/summary?plant_id=1")
      .then(res => setStocks(res.data.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Stock Summary</h2>

      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>Warehouse</th>
            <th>Type</th>
            <th>Total Meter</th>
            <th>Total Weight</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((s) => (
            <tr key={s.warehouse_id}>
              <td>
                <a href={`/stock-details?warehouse_id=${s.warehouse_id}`}>
                  {s.warehouse_name}
                </a>
              </td>
              <td>{s.warehouse_type}</td>
              <td>{s.total_meter}</td>
              <td>{s.total_weight}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}