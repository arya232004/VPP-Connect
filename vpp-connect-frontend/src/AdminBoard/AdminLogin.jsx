import React, { useState } from "react";
import AdminLoginHeader from "./AdminLoginHeader";
import { useNavigate } from "react-router-dom";
const AdminLogin = () => {
  // State to manage the input values
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // State for error message
  const [error, setError] = useState("");

  // Handle login function
  const handleLogin = (e) => {
    e.preventDefault();

    // Example credentials (you can replace this with actual logic, e.g., an API call)
    const validUsername = "admin";
    const validPassword = "admin123";

    if (username === validUsername && password === validPassword) {
      // Redirect to the dashboard if credentials are correct
    //   navigate("/admin/dashboard");
        // save isAdmin in local
        window.localStorage.setItem("isAdmin", "true")
        window.location.href = "/admin/dashboard"
    } else {
      // Set error if credentials are incorrect
      setError("Invalid username or password.");
    }
  };

  return (
    <div>
      <AdminLoginHeader />

      <div className="container m-auto flex items-center justify-center mt-10 md:mt-20">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
          <h2 className="text-4xl font-bold text-center text-themeblue mb-4">
            Welcome Back Admin
          </h2>
          <p className="text-center text-lg opacity-50 mb-6">
            Log in to your account
          </p>

          {/* Display error message if credentials are invalid */}
          {error && (
            <p className="text-center text-sm text-red-500 mb-4">{error}</p>
          )}

          <form onSubmit={handleLogin}>
            {/* Username input */}
            <div className="mb-4">
              <label className="block opacity-50 mb-2" htmlFor="username">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your username"
                required
              />
            </div>

            {/* Password input */}
            <div className="mb-6">
              <label className="block opacity-50 mb-2" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Submit button */}
            <div className="text-center">
              <button
                type="submit"
                className="w-full bg-themeblue text-white p-3 rounded-md cursor-pointer"
              >
                Log In
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            By logging in, you agree to our{" "}
            <span className="text-themeblue">Terms of Service</span> and{" "}
            <span className="text-themeblue">Privacy Policy</span>.
          </p>
          <p className="text-center text-sm text-gray-500 mt-6">
            Looking for the student Page? <a href="/" className="text-themeblue">Click here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
