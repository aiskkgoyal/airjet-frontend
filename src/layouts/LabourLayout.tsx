// src/layouts/LabourLayout.tsx
import { Outlet } from "react-router-dom";

export default function LabourLayout() {
  return (
    <div style={{
      padding: 18,
      minHeight: "100vh",
      background: "#f3f4f6",
      fontFamily: "Inter, sans-serif"
    }}>
      <Outlet />
    </div>
  );
}