import { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  // =====================================================
  // INITIAL STATE
  // =====================================================

  const [token, setToken] = useState(() => {

    const adminUser = localStorage.getItem("adminUser");

    if (adminUser) {
      return localStorage.getItem("adminToken");
    }

    return localStorage.getItem("token");
  });


  const [user, setUser] = useState(() => {

    const adminUser = localStorage.getItem("adminUser");

    if (adminUser) {
      return adminUser
        ? JSON.parse(adminUser)
        : null;
    }

    const storedUser = localStorage.getItem("user");

    return storedUser
      ? JSON.parse(storedUser)
      : null;
  });


  // =====================================================
  // LOGIN
  // =====================================================

  const login = (response) => {

    const userData = {
      id: response.id,
      name: response.name,
      email: response.email,
      role: response.role,
    };


    // ===================================================
    // ADMIN LOGIN
    // ===================================================

    if (response.role === "Admin") {

      localStorage.setItem(
        "adminToken",
        response.token
      );

      localStorage.setItem(
        "adminRefreshToken",
        response.refreshToken
      );

      localStorage.setItem(
        "adminUser",
        JSON.stringify(userData)
      );

      setToken(response.token);
      setUser(userData);

      return;
    }


    // ===================================================
    // HR / EMPLOYEE LOGIN
    // ===================================================

    localStorage.setItem(
      "token",
      response.token
    );

    localStorage.setItem(
      "refreshToken",
      response.refreshToken
    );

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    setToken(response.token);
    setUser(userData);
  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = async () => {

    const storedAdminUser =
      localStorage.getItem("adminUser");

    const storedUser =
      localStorage.getItem("user");


    const currentAdmin =
      storedAdminUser
        ? JSON.parse(storedAdminUser)
        : null;

    const currentUser =
      storedUser
        ? JSON.parse(storedUser)
        : null;


    // ===================================================
    // ADMIN LOGOUT
    // ===================================================

    if (currentAdmin?.role === "Admin") {

      const refreshToken =
        localStorage.getItem("adminRefreshToken");

      try {

        if (refreshToken) {

          await axios.post(
            "http://localhost:5115/api/admin/logout",
            {
              refreshToken: refreshToken,
            }
          );

        }

      } catch (error) {

        console.error(
          "Admin logout API failed:",
          error
        );

      } finally {

        localStorage.removeItem(
          "adminToken"
        );

        localStorage.removeItem(
          "adminRefreshToken"
        );

        localStorage.removeItem(
          "adminUser"
        );

        setToken(null);
        setUser(null);
      }

      return;
    }


    // ===================================================
    // HR / EMPLOYEE LOGOUT
    // ===================================================

    const refreshToken =
      localStorage.getItem("refreshToken");

    try {

      if (refreshToken) {

        await axios.post(
          "http://localhost:5115/api/auth/logout",
          {
            refreshToken: refreshToken,
          }
        );

      }

    } catch (error) {

      console.error(
        "Logout API failed:",
        error
      );

    } finally {

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "refreshToken"
      );

      localStorage.removeItem(
        "user"
      );

      setToken(null);
      setUser(null);
    }
  };


  // =====================================================
  // CONTEXT
  // =====================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  return useContext(AuthContext);
}