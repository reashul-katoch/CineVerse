import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('User');
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedName = localStorage.getItem('name');
      const storedRole = localStorage.getItem('role');
      const storedEmail = localStorage.getItem('email');

      if (storedToken && storedName && storedRole && storedEmail) {
        try {
          const res = await authService.validateToken(storedToken);
          if (res.valid) {
            setUserName(res.name);
            setUserRole(res.role);
            setToken(storedToken);
            setEmail(res.email || storedEmail);
            setIsLoggedIn(true);
          } else {
            clearSession();
          }
        } catch (e) {
          // Fallback to local session details in offline mode
          setUserName(storedName);
          setUserRole(storedRole);
          setToken(storedToken);
          setEmail(storedEmail);
          setIsLoggedIn(true);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const clearSession = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserName('');
    setUserRole('User');
    setToken('');
    setEmail('');
  };

  const login = async (emailVal, password, roleVal) => {
    try {
      const data = await authService.login(emailVal, password, roleVal);
      localStorage.setItem('token', data.token);
      localStorage.setItem('name', data.name);
      localStorage.setItem('role', data.role);
      localStorage.setItem('email', data.email || emailVal);

      setUserName(data.name);
      setUserRole(data.role);
      setToken(data.token);
      setEmail(data.email || emailVal);
      setIsLoggedIn(true);
      return data;
    } catch (err) {
      throw err;
    }
  };

  const register = async (emailVal, name, password, roleVal) => {
    try {
      const data = await authService.register(emailVal, name, password, roleVal);
      localStorage.setItem('token', data.token);
      localStorage.setItem('name', data.name);
      localStorage.setItem('role', data.role);
      localStorage.setItem('email', data.email || emailVal);

      setUserName(data.name);
      setUserRole(data.role);
      setToken(data.token);
      setEmail(data.email || emailVal);
      setIsLoggedIn(true);
      return data;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    clearSession();
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      userName,
      userRole,
      token,
      email,
      loading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
