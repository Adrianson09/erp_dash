import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./components/DashboardLayout";
import Replicas from "./pages/Replicas";
import NuevoTicket from "./pages/NuevoTicket";
import Reportes from "./pages/Reportes";
import { Ordenes } from "./pages/Ordenes";
import { OrderDetails } from "./pages/OrderDetails";

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <Router>
      <Routes>
        {/* Login */}
        <Route
          path="/"
          element={
            !token ? <LoginPage onLogin={setToken} /> : <Navigate to="/dashboard/ordenes" />
          }
        />

        {/* Rutas protegidas */}
        {token && (
          <Route path="/dashboard" element={<DashboardLayout onLogout={handleLogout} />}>
            <Route path="replicas" element={<Replicas />} />
            {/* <Route path="nuevo-ticket" element={<NuevoTicket />} />
            <Route path="reportes" element={<Reportes />} /> */}
            <Route path="ordenes" element={<Ordenes />} />
            <Route path="ordenes/:company/:id" element={<OrderDetails />} />
          </Route>
        )}

        {/* Redirección a login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
