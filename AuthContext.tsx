import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { connectMetaMask } from './metamaskAuth';
import { initContract, registerUser, authenticateUser } from '../contractservice';
import { hashEmail, hashPassword } from './hashUtils';

interface AuthContextProps {
  walletAddress: string | null;
  email: string | null; // Add email to context
  emailHash: string | null; // Email hash to be used
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setWalletAddress: React.Dispatch<React.SetStateAction<string | null>>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null); // Manage email state
  const [emailHash, setEmailHash] = useState<string | null>(null); // Manage emailHash state

  useEffect(() => {
    if (email) {
      const computedEmailHash = hashEmail(email);
      setEmailHash(computedEmailHash);
    }
  }, [email]);

  const register = async (email: string, password: string) => {
    try {
      const address = await connectMetaMask();
      const emailHash = hashEmail(email);
      const passwordHash = hashPassword(password); // Hash the password before sending

      await initContract();

      // Call smart contract function to register user with email hash
      await registerUser(emailHash);

      // Send registration request to the server
      const response = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailHash, passwordHash, walletAddress: address }),
      });

      if (!response.ok) {
        const errorText = await response.text(); // Get error text from response
        throw new Error(`Failed to register: ${errorText}`);
      }

      setEmail(email); // Set email after registration
      setWalletAddress(address);
    } catch (error) {
      console.error('Registration failed:', error);
      const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown error occurred";

    // Truncate the error message for the alert/popup
    const truncatedMessage =
      errorMessage.length > 100
        ? `${errorMessage.substring(21, 69)}...`
        : errorMessage;

    alert(truncatedMessage);


      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log("Starting login process...");
      
      // Force MetaMask to connect and return the selected address
      const address = await connectMetaMask();
  
      // Hash email and password for secure verification
      const emailHash = hashEmail(email);
      const passwordHash = hashPassword(password);
  
      console.log("Initializing contract...");
      await initContract();
  
      // Verify the user using the smart contract
      console.log("Authenticating user on-chain...");
      const isAuthenticated = await authenticateUser(address, emailHash);
  
      if (!isAuthenticated) {
        throw new Error("On-chain authentication failed");
      }
  
      console.log("Authenticating user with server...");
      // Authenticate with the server
      const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailHash, passwordHash }),
      });
  
      const result = await response.json();
  
      if (response.ok && result.success) {
        console.log("Login successful. Setting user state...");
        setEmail(email); // Save email to state
        setWalletAddress(address); // Save wallet address to state
      } else {
        console.error("Server authentication failed:", result.error);
        throw new Error(result.error || "Authentication failed");
      }
    } catch (error) {
      console.error("Login failed:", error);
  
      // Narrow the type of `error` to handle it safely
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unknown error occurred";
  
      // Truncate the error message for the alert/popup
      const truncatedMessage =
        errorMessage.length > 100
          ? `${errorMessage.substring(21, 67)}...`
          : errorMessage;
  
      alert(truncatedMessage);
      throw error; // Optionally re-throw for further handling upstream
    }
  };
  

  const logout = () => {
    setWalletAddress(null);
    setEmail(null); // Clear email on logout
    setEmailHash(null); // Clear emailHash on logout
  };

  return (
    <AuthContext.Provider value={{ walletAddress, email, emailHash, register, login, logout, setWalletAddress }}>
      {children}
    </AuthContext.Provider>
  );
};
