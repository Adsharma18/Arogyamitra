import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Dashboard from './pages/Dashboard/Dashboard';
import WorkoutHub from './pages/Workouts/WorkoutHub';
import NutritionHub from './pages/Nutrition/NutritionHub';
import HealthHub from './pages/Health/HealthHub';
import Settings from './pages/Settings/Settings';
import Profile from './pages/Profile/Profile';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes using Layout container */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workouts/*" element={<WorkoutHub />} />
            <Route path="/nutrition/*" element={<NutritionHub />} />
            <Route path="/health/*" element={<HealthHub />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />

            {/* Redirect root authenticated to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
