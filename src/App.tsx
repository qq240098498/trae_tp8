import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Drivers from "@/pages/Drivers";
import Vehicles from "@/pages/Vehicles";
import VehicleLedger from "@/pages/VehicleLedger";
import RepairOrders from "@/pages/RepairOrders";
import Orders from "@/pages/Orders";
import FlowerPackages from "@/pages/FlowerPackages";
import CarDecorations from "@/pages/CarDecorations";
import Settlements from "@/pages/Settlements";
import Statistics from "@/pages/Statistics";
import Inventory from "@/pages/Inventory";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/vehicle-ledger" element={<VehicleLedger />} />
          <Route path="/repair-orders" element={<RepairOrders />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/flower-packages" element={<FlowerPackages />} />
          <Route path="/car-decorations" element={<CarDecorations />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/settlements" element={<Settlements />} />
          <Route path="/statistics" element={<Statistics />} />
        </Route>
      </Routes>
    </Router>
  );
}
