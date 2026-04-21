import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import PublicSearch from './components/PublicSearch';
import LoginPage from './pages/LoginPage';
import DetailsPage from './pages/DetailsPage';
import { useAuth } from './context/AuthContext';
import DirectoryPage from './pages/DirectoryPage';
import MaintenanceForm from './pages/MaintenanceForm';
import ReclamationForm from './pages/ReclamationForm';
import './index.css';

function App() {
  const { user, logout } = useAuth();

  return (
    <div className="App">
      <Header user={user} onLogout={logout} />
      <main>
        <Routes>
          <Route path="/" element={<PublicSearch />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
          <Route path="/machine/:id" element={<DetailsPage />} />
          <Route path="/directory/:type/:id" element={<DirectoryPage />} />
          <Route path="/maintenance/add" element={<MaintenanceForm />} />
          <Route path="/reclamation/add" element={<ReclamationForm />} />
          <Route path="*" element={<Navigate to="/" />} />
          
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;