import React, { createContext, useContext, useState, useEffect } from "react";

// Create the AuthContext
const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // This function calls your backend API with the idToken and sets the user state
  const googleLogin = async (idToken) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        // Optionally save the token or user data in localStorage if needed.
        return data;
      } else {
        throw new Error(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  };

  useEffect(() => {
    // On mount, try to rehydrate the user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, googleLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access to the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};
