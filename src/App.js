import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import Profile from './components/Profile';
import EmployeeForm from './components/EmployeeForm';
import ForgotPassword from   './components/ForgotPassword';

// In your routes configuration


function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={<Login />} />
        <Route path="/staff/add" element={<EmployeeForm mode="add" />} />
        <Route path="/staff/update/:id" element={<EmployeeForm mode="update" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </div>
  );
}

export default App; 