import { useEffect, useState } from "react";
import { api } from "../api";

export default function OfficePanel() {

  const [beams, setBeams] = useState<any[]>([]);

  const fetchData = async () => {
    const res = await api.get("/beam-issues/office-list?plant_id=1");
    setBeams(res.data.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const completeBeam = async (issue_id: number) => {
    await api.post("/beam-issues/complete", { issue_id });
    fetchData();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Office Control Panel</h2>

      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>Beam</th>
            <th>Loom</th>
            <th>Expected</th>
            <th>Produced</th>
            <th>Balance</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {beams.map(b => {

            const overProduced = b.produced_meter > b.expected_meter;
            const inactive =
              new Date(b.issued_at) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

            return (
              <tr key={b.issue_id}
                  style={{
                    background: overProduced
                      ? "#ffe5e5"
                      : inactive
                        ? "#fff3cd"
                        : "white"
                  }}
              >
                <td>{b.beam_no}</td>
                <td>{b.loom_no}</td>
                <td>{b.expected_meter}</td>
                <td>{b.produced_meter}</td>
                <td>{b.balance_meter}</td>
                <td>{b.status}</td>
                <td>
                  {b.active && (
                    <button onClick={() => completeBeam(b.issue_id)}>
                      Complete
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}