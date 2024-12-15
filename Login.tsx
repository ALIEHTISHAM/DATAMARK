import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './Register.css';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      await login(email, password);
      setPopupMessage('Login successful!');
      setTimeout(() => {
        setPopupMessage(null); // Clear the popup after 2 seconds
        navigate('/my-content'); // Navigate to the landing page
      }, 2000);
    } catch (err) {
      setError('Incorrect email/password ! Try Again.');
    }
  };

  return (
    <div className="register-container">
      <h2>Login</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button onClick={handleLogin}>Login</button>
      {error && <p>{error}</p>}
      {popupMessage && (
        <div className="floating-popup">
          {popupMessage}
        </div>
      )}
      <p>
        Don't have an account?{' '}
        <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default Login;
