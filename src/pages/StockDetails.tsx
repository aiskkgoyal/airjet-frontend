import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";

export default function StockDetails() {

  const [searchParams] = useSearchParams();
  const warehouse_id = searchParams.get("warehouse_id");

  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    if (!warehouse_id) return;

    api.get(
      `/stock/details?plant_id=1&warehouse_id=${warehouse_id}`
    )
      .then(res => setRows(res.data.data))
      .catch(err => console.log(err));

  }, [warehouse_id]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Warehouse Stock Details</h2>

      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>Parent Piece</th>
            <th>Full Piece No</th>
            <th>Meter</th>
            <th>Weight</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, index) => (
            <tr key={index}>
              <td>{r.parent_piece_no}</td>
              <td>{r.full_piece_no}</td>
              <td>{r.meter}</td>
              <td>{r.weight}</td>
              <td>{new Date(r.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}