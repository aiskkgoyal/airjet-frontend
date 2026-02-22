// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SidebarLayout from "./layouts/SidebarLayout";
import LabourLayout from "./layouts/LabourLayout";

import Dashboard from "./pages/Dashboard";
import BeamIssue from "./pages/BeamIssue";
import ProductionEntry from "./pages/ProductionEntry";
import LoomMaster from "./pages/LoomMaster";
import DesignMaster from "./pages/DesignMaster";
import Stock from "./pages/Stock";
import BeamInward from "./pages/BeamInward";
import BeamMaster from "./pages/BeamMaster";
import Alerts from "./pages/Alerts";
import ActiveLooms from "./pages/ActiveLooms";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Labour Routes */}
        <Route path="/" element={<LabourLayout />}>
          <Route index element={<ProductionEntry />} />
        </Route>

        {/* Office (Sidebar) Routes */}
        <Route path="/office" element={<SidebarLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="beam-inward" element={<BeamInward />} />
          <Route path="beam-issue" element={<BeamIssue />} />
          <Route path="beam-master" element={<BeamMaster />} />
          <Route path="active-looms" element={<ActiveLooms />} />
          <Route path="stock" element={<Stock />} />
          <Route path="design-master" element={<DesignMaster />} />
          <Route path="alerts" element={<Alerts />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;