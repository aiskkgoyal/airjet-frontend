import { useEffect, useState } from "react";
import { api } from "../api";

export default function LoomMaster() {

  const [loomNo, setLoomNo] = useState("");
  const [looms, setLooms] = useState<any[]>([]);

  const fetchLooms = () => {
    api.get("/looms?plant_id=1")
      .then(res => setLooms(res.data.data))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchLooms();
  }, []);

  const handleAdd = async () => {
    if (!loomNo) return alert("Enter Loom Number");

    try {
      await api.post("/looms", {
        plant_id: 1,
        loom_no: loomNo
      });

      alert("Loom Added Successfully");
      setLoomNo("");
      fetchLooms();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Loom Master</h2>

      <input
        placeholder="Enter Loom Number"
        value={loomNo}
        onChange={e => setLoomNo(e.target.value)}
      />

      <button onClick={handleAdd}>Add Loom</button>

      <hr />

      <h3>Existing Looms</h3>

      <ul>
        {looms.map(l => (
          <li key={l.loom_id}>{l.loom_no}</li>
        ))}
      </ul>

    </div>
  );
}