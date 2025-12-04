import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Lists } from './pages/Lists';
import { ListDetails } from './pages/ListDetails';
import { Recipients } from './pages/Recipients';
import { Gifts } from './pages/Gifts';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/lists" element={<Lists />} />
        <Route path="/lists/:id" element={<ListDetails />} />
        <Route path="/recipients" element={<Recipients />} />
        <Route path="/gifts" element={<Gifts />} />
        {/* Placeholder redirects for unimplemented routes */}
        <Route path="/occasions" element={<Navigate to="/" />} />
        <Route path="/stats" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
}
