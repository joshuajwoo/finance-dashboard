// src/components/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Import the configured axiosInstance instead of the raw axios library
import axiosInstance from '../api/axiosInstance';

function LoginPage({ setIsLoggedInGlobally }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      // Use the configured axiosInstance.
      // The baseURL is already set, so we only need the relative path.
      const response = await axiosInstance.post('/token/', {
        username,
        password
      });

      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      setIsLoggedInGlobally(true);
      setMessage('Login successful! Redirecting...');
      navigate('/dashboard');

    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setIsLoggedInGlobally(false);

      if (error.response && error.response.data && error.response.data.detail) {
        setMessage(`Login failed: ${error.response.data.detail}`);
      } else {
        setMessage('Login failed: No response or network error.');
        console.error("Login error details:", error);
      }
    }
  };

  return (
    <div className="login-page-content-wrapper">
      <h1>Login</h1>
      <form onSubmit={handleSubmit} className="login-form-container">
        <div>
          <label htmlFor="login-username">Username:</label>
          <input className="form-input" type="text" id="login-username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="login-password">Password:</label>
          <input className="form-input" type="password" id="login-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Login</button>
      </form>
      <p
        className="login-form-message"
        style={{
            color: message.startsWith('Login failed') ? 'red' : (message.startsWith('Login successful') ? 'green' : 'transparent'),
        }}
        >
        {message || <>&nbsp;</>}
      </p>
    </div>
  );
}

export default LoginPage;