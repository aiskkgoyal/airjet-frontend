// src/components/NavBar.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

const NavBar: React.FC = () => {
  const loc = useLocation();
  return (
    <header className="navbar">
      <div className="nav-left">
        <div style={{fontSize:18}}>Airjet ERP</div>
        <nav className="nav-links">
          <Link to="/beam-inward" className={loc.pathname.startsWith("/beam-inward") ? "active" : ""}>Inward</Link>
          <Link to="/beam-issue" className={loc.pathname.startsWith("/beam-issue") ? "active" : ""}>Issue</Link>
          <Link to="/production-entry" className={loc.pathname.startsWith("/production-entry") ? "active" : ""}>Production</Link>
          <Link to="/stock" className={loc.pathname.startsWith("/stock") ? "active" : ""}>Stock</Link>
          <Link to="/beam-name-master">Beam Master</Link>
          <Link to="/inactive-beams">Beam Master</Link>
          <Link to="/stock-alerts">Beam Master</Link>
          <Link to="/loom-master">Looms</Link>
          <Link to="/design-master">Designs</Link>
        </nav>
      </div>
      <div className="nav-right small">Plant: Main Plant</div>
    </header>
  );
};

export default NavBar;