import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Set to false since no storage check is needed

  const login = (email, password) => {
    setIsLoading(true);
    
    // Simulate an API call
    setTimeout(() => {
      console.log("Logged in with:", email);
      setIsLoggedIn(true);
      setIsLoading(false);
    }, 1000);
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Create the custom hook
export const useAuth = () => useContext(AuthContext);