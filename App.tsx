import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/Landingpage';
import ServicesPage from './components/ServicesPage';
import Royalties from './components/Royalty';
import Register from './components/Register';
import Login from './components/Login'; // Import the Login component
import MyContent from './components/MyContent'; // Import the MyContent component
import ContentDisplay from './components/ContentDisplay'; // Import the ContentDisplay component
import { AuthProvider } from './components/AuthContext';
import { ContentProvider } from './components/Contentcontext';
import { RoyaltyProvider } from './components/royalitycontext'; // Import the RoyaltyProvider
import './App.css';
function App() {
  return (
    <Router>
      <AuthProvider>
        <RoyaltyProvider> {/* Wrap with RoyaltyProvider */}
          <ContentProvider>
            <div className='dady'>
              <Navbar />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/royalties" element={<Royalties />} />
                <Route path="/login" element={<Login />} /> {/* Add login route */}
                <Route path="/my-content" element={<MyContent />} /> {/* Add MyContent route */}
                <Route path="/:contentURL" element={<ContentDisplay />} /> {/* Add ContentDisplay route */}
              </Routes>
            </div>
          </ContentProvider>
        </RoyaltyProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
