// src/layouts/SidebarLayout.tsx
import { Link, Outlet } from "react-router-dom";

export default function SidebarLayout() {
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Inter, sans-serif" }}>

      {/* Sidebar */}
      <aside style={{
        width: 260,
        background: "#0f172a",
        color: "white",
        padding: 20,
        boxSizing: "border-box"
      }}>
        <h2 style={{ margin: 0 }}>Airjet ERP</h2>
        <div style={{ marginTop: 18, lineHeight: 2 }}>
          <Link to="/office/dashboard" style={linkStyle}>Dashboard</Link>
          <Link to="/office/beam-inward" style={linkStyle}>Beam Inward</Link>
          <Link to="/office/beam-issue" style={linkStyle}>Beam Issue</Link>
          <Link to="/office/beam-master" style={linkStyle}>Beam Master</Link>
          <Link to="/office/active-looms" style={linkStyle}>Active Looms</Link>
          <Link to="/office/stock" style={linkStyle}>Stock</Link>
          <Link to="/office/design-master" style={linkStyle}>Design Master</Link>
          <Link to="/office/alerts" style={linkStyle}>Alerts</Link>
        </div>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, padding: 20, overflowY: "auto", background: "#f8fafc" }}>
        <Outlet />
      </main>
    </div>
  );
}

const linkStyle: React.CSSProperties = {
  display: "block",
  color: "white",
  textDecoration: "none",
  padding: "6px 0",
};