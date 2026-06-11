import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Drivers from "@/pages/Drivers";
import Vehicles from "@/pages/Vehicles";
import VehicleLedger from "@/pages/VehicleLedger";
import Orders from "@/pages/Orders";
import Settlements from "@/pages/Settlements";
import Statistics from "@/pages/Statistics";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/vehicle-ledger" element={<VehicleLedger />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/settlements" element={<Settlements />} />
          <Route path="/statistics" element={<Statistics />} />
        </Route>
      </Routes>
    </Router>
  );
}
