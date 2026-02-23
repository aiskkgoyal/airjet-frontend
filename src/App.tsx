// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";

import BeamInward from "./pages/BeamInward";
import BeamIssue from "./pages/BeamIssue";
import ProductionEntry from "./pages/ProductionEntry";
import BeamNameMaster from "./pages/BeamNameMaster";
import LoomMaster from "./pages/LoomMaster";
import DesignMaster from "./pages/DesignMaster";
import Stock from "./pages/Stock";
import StockAlerts from "./pages/StockAlerts";
import StockDetails from "./pages/StockDetails";
import InactiveBeams from "./pages/InactiveBeams";

export default function App() {
  return (
    <div className="app-root">
      <NavBar />
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Navigate to="/beam-inward" replace />} />
          <Route path="/beam-inward" element={<BeamInward />} />
          <Route path="/beam-issue" element={<BeamIssue />} />
          <Route path="/production-entry" element={<ProductionEntry />} />
          <Route path="/beam-name-master" element={<BeamNameMaster />} />
          <Route path="/loom-master" element={<LoomMaster />} />
          <Route path="/design-master" element={<DesignMaster />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/stock-alerts" element={<StockAlerts />} />
          <Route path="/stock-details" element={<StockDetails />} />
          <Route path="/inactive-beams" element={<InactiveBeams />} />
        </Routes>
      </main>
    </div>
  );
}