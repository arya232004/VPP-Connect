import React, { useEffect } from "react";
import LoginHeader from "./LoginHeader";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import Swal from "sweetalert2";

const LoginRegisterPage = () => {
  
  const { googleLogin, user } = useAuth();
  const navigate = useNavigate();
  const handleCredentialResponse = async (response) => {
    console.log("Received Google ID token:", response.credential);
    try {
      const result = await googleLogin(response.credential);
      localStorage.setItem("token", result.user.role);
      if (localStorage.getItem("token") == "student"){
        window.location.href="/dashboard"
      }
      else if (localStorage.getItem("token") == "faculty"){

        window.location.href = "/faculty/dashboard";
      }
      else
      {
        console.log(result);
        Swal.fire({
          icon: "info",
          title: "Please wait",
          text: result.message,
        });
      }
      // Navigate without reloading the page
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  useEffect(() => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: `${import.meta.env.VITE_GOOGLE_CLIENT_ID}`,
        callback: handleCredentialResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById("googleButton"),
        { theme: "outline", size: "large" }
      );
    }
  }, []);

  return (
    <div className="bg-themegray w-full h-screen">
      <LoginHeader />

      <div className=" m-auto flex items-center  justify-center mt-40">
        <div className="bg-white p-8 rounded-xl  w-full shadow-2xl max-w-lg">
          <h2 className="text-4xl font-bold text-center text-themeblue mb-4">
            Welcome Back
          </h2>
          <p className="text-center opacity-50 mb-6">
            Log in to your account with Google
          </p>

          {/* Google button will be rendered here */}
          <div className="w-full  items-center">
            <div
              id="googleButton"
              className="items-center scale-110 w-fit mx-auto"
            ></div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Looking for the Admin Page?{" "}
            <a href="/admin-login" className="text-themeblue">
              Click here
            </a>
          </p>
          <p className="text-center text-sm text-gray-500 mt-6 ">
            By logging in, you agree to our{" "}
            <span className="text-themeblue">Terms of Service</span> and{" "}
            <span className="text-themeblue">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginRegisterPage;
