import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import AssetManagement from './pages/admin/AssetManagement';
import SuperDashboard from './pages/super/SuperDashboard';
import TicketList from './pages/admin/TicketList';
import PublicOpenTicket from './pages/public/PublicOpenTicket';
import PublicTicketList from './pages/public/PublicTicketList';
import PublicTicketDetail from './pages/public/PublicTicketDetail';
import Layout from './components/Layout';
import PublicLayout from './components/PublicLayout';
import PrivateRoute from './components/PrivateRoute';

const LayoutRoute = ({ component: Component, layout: LayoutComponent }) => (
  <LayoutComponent><Component /></LayoutComponent>
);

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* ROTAS PÚBLICAS */}
        <Route path="/abrir-chamado" element={<LayoutRoute component={PublicOpenTicket} layout={PublicLayout} />} />
        <Route path="/acompanhar" element={<LayoutRoute component={PublicTicketList} layout={PublicLayout} />} />
        <Route path="/acompanhar/:id" element={<LayoutRoute component={PublicTicketDetail} layout={PublicLayout} />} />

        {/* ADMIN (GESTOR/TECNICO) */}
        <Route path="/dashboard" element={<PrivateRoute roles={['GESTOR', 'SUPER_ADMIN']}><LayoutRoute component={Dashboard} layout={Layout} /></PrivateRoute>} />
        <Route path="/chamados" element={<PrivateRoute roles={['GESTOR', 'TECNICO', 'SUPER_ADMIN']}><LayoutRoute component={TicketList} layout={Layout} /></PrivateRoute>} />
        <Route path="/usuarios" element={<PrivateRoute roles={['GESTOR', 'SUPER_ADMIN']}><LayoutRoute component={UserManagement} layout={Layout} /></PrivateRoute>} />
        <Route path="/ativos" element={<PrivateRoute roles={['GESTOR', 'SUPER_ADMIN', 'TECNICO']}><LayoutRoute component={AssetManagement} layout={Layout} /></PrivateRoute>} />

        {/* SUPER ADMIN */}
        <Route path="/admin" element={<PrivateRoute roles={['SUPER_ADMIN']}><LayoutRoute component={SuperDashboard} layout={Layout} /></PrivateRoute>} />
        
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
