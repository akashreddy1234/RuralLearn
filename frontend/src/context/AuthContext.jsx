import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Deep utf-8 safe base64 decoding matching user logic explicitly
const extractJWTPayload = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

const isTokenValid = (token) => {
  if (!token) return false;
  const payload = extractJWTPayload(token);
  if (!payload || !payload.exp) return false;
  // payload.exp is in seconds, Date.now() is in milliseconds
  return payload.exp * 1000 > Date.now();
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem('userInfo');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser.token && isTokenValid(parsedUser.token)) {
          // Strictly trust the token's secure role claim
          const tokenData = extractJWTPayload(parsedUser.token);
          if (tokenData && tokenData.role) {
            parsedUser.role = tokenData.role; 
          }
          return parsedUser;
        } else {
          sessionStorage.removeItem('userInfo');
          return null;
        }
      } catch (e) {
        sessionStorage.removeItem('userInfo');
        return null;
      }
    }
    return null;
  });

  const login = (userData) => {
    setUser(userData);
    sessionStorage.setItem('userInfo', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('userInfo');
  };

  const updateLanguagePreference = (lang) => {
    if (user) {
      const updatedUser = { ...user, languagePreference: lang };
      setUser(updatedUser);
      sessionStorage.setItem('userInfo', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateLanguagePreference }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
