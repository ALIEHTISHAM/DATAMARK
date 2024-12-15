import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './Register.css';
import { useNavigate, Link } from 'react-router-dom';

const Register: React.FC = () => {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [popupMessage, setPopupMessage] = useState<string | null>(null); // State for popup message
  const navigate = useNavigate();

  const handleRegister = async () => {
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email address');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await register(email, password);
      setPopupMessage('Registration successful!');
      setTimeout(() => {
        setPopupMessage(null); // Clear the popup after 2 seconds
        navigate('/login'); // Navigate to the login page
      }, 2000);
    } catch (err) {
      setError('Registration failed. Please check your details and try again.');
    }
  };

  return (
    <div className="bodycolor">
      <div className="register-container">
        <h2>Sign Up</h2>
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
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
        />
        <button onClick={handleRegister}>Sign Up</button>
        {error && <p className="error-message">{error}</p>}
        {popupMessage && (
          <div className="floating-popup">
            {popupMessage}
          </div>
        )}
        <p>
          Already have an account?{' '}
          <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
