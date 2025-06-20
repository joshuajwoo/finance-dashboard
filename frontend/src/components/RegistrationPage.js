import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';

function RegistrationPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors([]);
    if (password !== password2) {
      setErrors(['Passwords do not match!']);
      return;
    }
    try {
      const payload = { username, password, email };
      await axiosInstance.post('/core/register/', payload);
      setErrors(['Registration successful! Redirecting to login...']);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      console.error('Registration error:', error.response ? error.response.data : error.message);
      if (error.response && error.response.data) {
        const backendErrors = error.response.data;
        const errorMessages = [];
        for (const key in backendErrors) {
          const message = Array.isArray(backendErrors[key]) ? backendErrors[key].join(' ') : String(backendErrors[key]);
          errorMessages.push(message);
        }
        setErrors(errorMessages);
      } else {
        setErrors(['Registration failed: An unexpected error occurred.']);
      }
    }
  };

  return (
    <div className="login-page-content-wrapper">
      <h2>Register New Account</h2>
      <form onSubmit={handleSubmit} className="login-form-container">
        <div>
          <label htmlFor="reg-username">Username:</label>
          <input className="form-input" type="text" id="reg-username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="reg-email">Email:</label>
          <input className="form-input" type="email" id="reg-email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="reg-password">Password:</label>
          <input className="form-input" type="password" id="reg-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="reg-password2">Confirm Password:</label>
          <input className="form-input" type="password" id="reg-password2" value={password2} onChange={(e) => setPassword2(e.target.value)} required />
        </div>
        <button type="submit">Register</button>
      </form>
      {errors.length > 0 && (
        <div>
          {errors.map((error, index) => (
            <p key={index} style={{ color: error.startsWith('Registration successful') ? 'green' : 'red' }}>
              {error}
            </p>
          ))}
        </div>
      )}
      <p style={{ marginTop: '20px' }}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}

export default RegistrationPage;