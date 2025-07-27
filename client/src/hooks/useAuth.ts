import { useEffect, useState } from "react";

/**
 * Authentication hook that connects to the server-side Auth0 session
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/auth/user', {
          method: 'GET',
          credentials: 'include', // Include cookies for session
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else if (response.status === 401) {
          // User is not authenticated
          setUser(null);
        } else {
          // Other error
          setError(`Authentication check failed: ${response.status}`);
          setUser(null);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setError(err.message || 'Authentication check failed');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = () => {
    window.location.href = '/api/auth/login';
  };

  const logout = () => {
    window.location.href = '/api/auth/logout';
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
  };
}