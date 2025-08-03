import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import Profile from './components/Profile';
import ForgotPassword from './components/ForgotPassword';
import BoxLoader from './components/BoxLoader';
import Billing from './components/Billing';
import RandomColorLoader from './components/RandomColorLoader';
import Invoice from './components/inovice';
import Wholesaler from './components/wholesaler';
import AccessDenied from './components/AccessDenial';
import Worker from './components/Worker';
// We'll move the imports for AddStock and StockManagement into the Home component

function App() {
  return (
    <div className="App">
      <Routes>
        {/* These routes will not have the Home layout */}
         <Route path="/invoice" element={<Invoice />} />
        <Route path="/" element={<Login />} />
        <Route path='/billing' element={<Billing />}/>
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/BoxLoader" element={<BoxLoader />} />
           <Route path="/RandomColorLoader" element={<RandomColorLoader />} />
         <Route path="/forgot-password" element={<ForgotPassword />} />
       <Route path="/Access-Denied" element={<AccessDenied />} />
       <Route path="/Worker" element={<Worker />} />
        {/*
          This is the new parent route for all dashboard-related pages.
          The '*' means that any path starting with "/home" will match.
        */}
        <Route path="/billing" element={<Billing />} /> {/* Add this line */}
        <Route path="/home/*" element={<Home />} />
   
      </Routes>
    </div>
  );
}

export default App;