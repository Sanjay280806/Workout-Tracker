import { useState } from "react";
import { AuthContext } from "./AuthContext";

function getStoredUser() {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);

  function login(userData) {
    console.log("LOGIN RESPONSE:", userData);

    const token =
      userData.token ||
      userData.accessToken ||
      userData.data?.token ||
      userData.data?.accessToken;

    if (token) {
      localStorage.setItem("token", token);
    }

    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}