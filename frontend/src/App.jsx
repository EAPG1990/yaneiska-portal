import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Alumnas from './pages/Alumnas';
import Docentes from './pages/Docentes';
import Alquileres from './pages/Alquileres';
import Talleres from './pages/Talleres';
import Gastos from './pages/Gastos';
import Aranceles from './pages/Aranceles';
import Configuracion from './pages/Configuracion';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Rutas Protegidas */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/alumnas" element={<Alumnas />} />
          <Route path="/docentes" element={<Docentes />} />
          <Route path="/alquileres" element={<Alquileres />} />
          <Route path="/alquiler-sala" element={<Navigate to="/alquileres" replace />} />
          <Route path="/gastos" element={<Gastos />} />
          <Route path="/talleres" element={<Talleres />} />
          <Route path="/aranceles" element={<Aranceles />} />
          <Route path="/publicidad" element={<Dashboard />} />
          <Route path="/configuracion" element={<Configuracion />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
