import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/dashboard';
import Project from './pages/project';
import Forest from './pages/forest';
import Monitoring from './pages/monitoring';
import Accounting from './pages/accounting';
import Trading from './pages/trading';
import Management from './pages/management';
import Revenue from './pages/revenue';

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="project" element={<Project />} />
          <Route path="forest" element={<Forest />} />
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="accounting" element={<Accounting />} />
          <Route path="trading" element={<Trading />} />
          <Route path="management" element={<Management />} />
          <Route path="revenue" element={<Revenue />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
