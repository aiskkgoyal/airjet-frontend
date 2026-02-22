import { useEffect, useState } from "react";
import { api } from "../api";

export default function DesignMaster() {

  const [designNo, setDesignNo] = useState("");
  const [description, setDescription] = useState("");
  const [designs, setDesigns] = useState<any[]>([]);

  const fetchDesigns = () => {
    api.get("/designs?plant_id=1")
      .then(res => setDesigns(res.data.data))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  const handleAdd = async () => {
    if (!designNo) return alert("Enter Design Number");

    try {
      await api.post("/designs", {
        plant_id: 1,
        design_no: designNo,
        description: description
      });

      alert("Design Added Successfully");
      setDesignNo("");
      setDescription("");
      fetchDesigns();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Design Master</h2>

      <input
        placeholder="Design Number"
        value={designNo}
        onChange={e => setDesignNo(e.target.value)}
      />

      <input
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />

      <button onClick={handleAdd}>Add Design</button>

      <hr />

      <h3>Existing Designs</h3>

      <ul>
        {designs.map(d => (
          <li key={d.design_id}>{d.design_no}</li>
        ))}
      </ul>

    </div>
  );
}