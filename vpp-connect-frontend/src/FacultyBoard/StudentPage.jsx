import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, RotateCw, PlusCircle, Search, TableOfContents, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FacultyHeader from "./FacultyHeader";

function StudentPage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const getUserDept = user.departmentId;
  const [selectedRole, setSelectedRole] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const link = window.location.href;
  const [isFull, setIsFull] = useState(false);
  const itemsPerPage = isFull ? 10 : 4;
  const navigate = useNavigate();
  const [userData, setUserData] = useState([]);

  // Alternate colors for student icons
  const studentColors = ["bg-vpppurple", "bg-vppgreen", "bg-vppviolet", "bg-vpporange"];

  // Roles for dropdown
  const roles = ["All", "Teacher", "Student"];

  // Filter users based on role (case-insensitive)
  const filteredUsers =
    selectedRole === "All"
      ? userData
      : userData.filter(
          (user) => user.role.toLowerCase() === selectedRole.toLowerCase()
        );

  // Filter users based on search term
  const filteredUsersBySearch = filteredUsers.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination for Users
  const totalPages = Math.ceil(filteredUsersBySearch.length / itemsPerPage);

  const paginatedUsers = filteredUsersBySearch.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    if (link.includes("users")) {
      setIsFull(true);
    }
  }, []);

  useEffect(() => {
    fetch(`http://localhost:5000/api/users/students/${getUserDept}`)
      .then((response) => response.json())
      .then((data) => setUserData(data))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  return (
    <div>
      {/* Users Section Header */}
      <div className="flex flex-col gap-1 m-auto md:m-0">
        {isFull ? (
          <FacultyHeader text="All Users" />
        ) : (
          <h1 className="text-2xl font-neueMedium md:text-2xl mt-6 mb-4">Users</h1>
        )}
      </div>
      <div className="bg-white w-full rounded-2xl p-6">
        {/* Search and Role Dropdown */}
        <div className="flex flex-col md:flex-row justify-between mb-4 gap-3 items-center">
          {/* Search Bar */}
          <div className="flex border-2 p-2 rounded-lg border-gray-400 opacity-50 gap-3 items-center px-4 w-full mb-2 md:mb-0">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search Users"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent outline-none text-lg"
            />
          </div>

          {/* Roles Dropdown */}
          <div className="relative w-full md:w-[32%] z-1">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex w-full border-2 p-2 px-4 rounded-lg border-gray-400 opacity-50 gap-3 items-center justify-between"
            >
              <h1 className="text-lg">{selectedRole}</h1>
              <ChevronDown size={20} />
            </button>
            {isDropdownOpen && (
              <div className="absolute left-0 w-full bg-white shadow-md rounded-lg text-lg">
                {roles.map((role) => (
                  <div
                    key={role}
                    onClick={() => handleRoleChange(role)}
                    className="p-2 px-4 cursor-pointer hover:bg-themegray opacity-50"
                  >
                    {role}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center opacity-50 justify-between mt-4 px-2">
          <RotateCw size={1} />
          <div className="flex items-center gap-3">
            <h3>
              {currentPage} of {totalPages}
            </h3>
            <div className="flex gap-6 items-center">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* User List */}
        <div className="flex flex-col gap-2 mt-2">
          {paginatedUsers.length > 0 ? (
            paginatedUsers.map((user, index) => (
              <div
                key={index}
                // Made tabs unclickable: onClick removed, cursor set to default
                className="flex items-center p-1 md:p-3 rounded-xl hover:bg-themegray cursor-default justify-between w-full"
              >
                <div className="flex items-center w-[calc(100%-20px)]">
                  <div className={`${studentColors[index % studentColors.length]} p-2 rounded-full mr-3 text-white`}>
                    <User />
                  </div>
                  <div className="w-full">
                    <h1 className="text-lg md:text-xl font-neueMedium truncate w-[calc(100%-60px)]">
                      {user.name}
                    </h1>
                    <div className="flex gap-1 flex-col md:flex-row md:gap-10">
                      <h1 className="opacity-50 text-xs md:text-base">
                        Id: {user.userId}
                      </h1>
                      {user.role !== "Teacher" ? (
                        <h1 className="opacity-50 text-xs md:text-base">
                          Class: {user.classId}
                        </h1>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
                
              </div>
            ))
          ) : (
            <h1 className="text-center opacity-50 mt-4">No users found.</h1>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentPage;
