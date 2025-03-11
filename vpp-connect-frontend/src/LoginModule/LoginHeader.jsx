import React from "react";

const LoginHeader = () => {
  return (
    <div>
      {/* Responsive Header */}
      <header className=" mx-auto p-6 bg-themeblue ">
        <div className="mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center mx-auto">
            <img
              src="/src/assets/svgs/VPP logo white.svg" // Replace with your logo URL
              alt="Logo"
              className="h-6  "
            />
            {/* <span className="ml-3 text-white text-xl font-semibold">Your Brand</span> */}
          </a>
          {/* Mobile Navigation Toggle Button */}
          {/* <div className="lg:hidden">
                        <button className="text-white">
                            {/* Mobile Menu Icon (Hamburger) 
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-6 h-6"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M3 12h18M3 6h18M3 18h18" />
                            </svg>
                        </button>
                    </div> */}
        </div>
      </header>
    </div>
  );
};

export default LoginHeader;
