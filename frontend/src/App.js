import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import './App.css';

// Import page components
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import RegistrationPage from './components/RegistrationPage';

// --- START MODIFICATIONS ---

// 1. DEFINE ProtectedRoute OUTSIDE of the App component.
// It needs 'isLoggedIn' to work, so we will pass it as a prop.
const ProtectedRoute = ({ isLoggedIn, children }) => {
  if (!isLoggedIn) {
    // If not logged in, redirect to the /login page.
    return <Navigate to="/login" replace />;
  }
  // If logged in, render the child component (e.g., DashboardPage).
  return children;
};

// 2. DEFINE Navigation OUTSIDE of the App component.
// It needs 'isLoggedIn' and 'handleLogout' to work, so we pass them as props.
const Navigation = ({ isLoggedIn, handleLogout }) => (
  <nav style={{ padding: '10px', backgroundColor: '#f0f0f0', marginBottom: '20px' }}>
    <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
    <Link to="/register" style={{ marginRight: '10px' }}>Register</Link>
    {isLoggedIn && <Link to="/dashboard" style={{ marginRight: '10px' }}>Dashboard</Link>}
    {isLoggedIn && (
      <button onClick={handleLogout} style={{ float: 'right' }}>
        Logout
      </button>
    )}
  </nav>
);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('accessToken'));
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = () => {
      setIsLoggedIn(!!localStorage.getItem('accessToken'));
    };
    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
    navigate('/login');
  }, [navigate]);

  const handleLoginSuccess = useCallback((status) => {
    setIsLoggedIn(status);
    if (status) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="App">
      {/* 3. PASS PROPS to the Navigation component */}
      <Navigation isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
      <header className="App-header">
        <Routes>
          <Route
            path="/login"
            element={<LoginPage setIsLoggedInGlobally={handleLoginSuccess} />}
          />
          <Route
            path="/register"
            element={<RegistrationPage />}
          />
          <Route
            path="/dashboard"
            element={
              // 4. PASS PROPS to the ProtectedRoute component
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <DashboardPage onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
          />
          <Route path="*" element={<div><h2>404 Not Found</h2><Link to="/">Go Home</Link></div>} />
        </Routes>
      </header>
    </div>
  );
}

export default App;