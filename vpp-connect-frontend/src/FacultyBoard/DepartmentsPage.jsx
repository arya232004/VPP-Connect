import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, RotateCw, PlusCircle, Search, TableOfContents } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FacultyHeader from "./FacultyHeader";
import { BookOpen, Cpu, User } from "lucide-react"; // Imported icons for department mapping

function DepartmentsPage() {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const link = window.location.href;
    const [isFull, setIsFull] = useState(false);
    const itemsPerPage = isFull ? 10 : 4;
    const navigate = useNavigate();

    // Sample department data
    const departmentData = [
        { deptName: "Computer Science", deptDate: "Apr 16, 2024", deptMembers: 10, deptCategory: "Science", id: 401 },
        { deptName: "Mechanical Engineering", deptDate: "Mar 30, 2024", deptMembers: 20, deptCategory: "Engineering", id: 402 },
        { deptName: "Electrical Engineering", deptDate: "Feb 20, 2024", deptMembers: 15, deptCategory: "Engineering", id: 403 },
        { deptName: "Mathematics", deptDate: "Mar 15, 2024", deptMembers: 12, deptCategory: "Science", id: 404 },
        { deptName: "Physics", deptDate: "Jan 25, 2024", deptMembers: 8, deptCategory: "Science", id: 405 },
        // More departments...
    ];
    
    const departmentCategory = ["All", "Science", "Engineering"];

    // Filter departments based on category
    const filteredDepartments = selectedCategory === "All"
        ? departmentData
        : departmentData.filter((dept) => dept.deptCategory === selectedCategory);

    // Filter departments based on search term
    const filteredDepartmentsBySearch = filteredDepartments.filter((dept) =>
        dept.deptName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination for Departments
    const totalPages = Math.ceil(filteredDepartmentsBySearch.length / itemsPerPage);

    const paginatedDepartments = filteredDepartmentsBySearch.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setIsDropdownOpen(false);
    };

    useEffect(() => {
        if (link.includes("department")) {
            setIsFull(true);
        }
    }, [link]);

    return (
        <div>
            {/* Departments Section Header */}
            <div className="flex flex-col gap-1 m-auto md:m-0">
                {isFull ? <FacultyHeader text="Your Department" /> : <h1 className="text-3xl font-neueMedium md:text-4xl mb-2">Your Department</h1>}
            </div>
            <div className="bg-white w-full rounded-2xl p-6">
                {/* Search and Category Dropdown */}
                <div className="flex flex-col md:flex-row justify-between mb-4 gap-3 items-center">
                    {/* Search Bar */}
                    <div className="flex border-2 p-2 rounded-lg border-gray-400 opacity-50 gap-3 items-center px-4 w-full md:w-[54%] mb-2 md:mb-0">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search Departments"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent outline-none text-lg"
                        />
                    </div>

                    {/* Categories Dropdown */}
                    <div className="relative w-full md:w-[32%] z-1">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)} // Toggle dropdown visibility
                            className="flex w-full border-2 p-2 px-4 rounded-lg border-gray-400 opacity-50 gap-3 items-center justify-between"
                        >
                            <h1 className="text-lg">{selectedCategory}</h1>
                            <ChevronDown size={20} />
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute left-0 w-full bg-white shadow-md rounded-lg text-lg">
                                {departmentCategory.map((category) => (
                                    <div
                                        key={category}
                                        onClick={() => handleCategoryChange(category)} // Update category on click
                                        className="p-2 px-4 cursor-pointer hover:bg-themegray opacity-50"
                                    >
                                        {category}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Add New Department Button */}
                    <div className="text-sm md:text-lg rounded-xl gap-2 md:gap-2 md:w-[22%] flex justify-between">
                        <button className="border-1 text-[#5d46ac] p-2 rounded-lg flex items-center gap-2 px-1 md:px-5 cursor-pointer"
                         onClick={() => navigate('/faculty/departments')}
                         >
                            View All <TableOfContents size={30} />  
                        </button>
                        <button className="bg-[#5d46ac] text-white p-2 rounded-lg flex gap-2 items-center px-1 md:px-5 cursor-pointer" 
                        onClick={() => navigate('/faculty/edit-department')}
                        >
                            Add New
                            <PlusCircle size={20} />
                        </button>
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
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Department List */}
                <div className="flex flex-col gap-2 mt-2">
                    {paginatedDepartments.length > 0 ? (
                        paginatedDepartments.map((dept, index) => (
                            <div
                                key={index}
                                onClick={() => navigate(`/faculty/edit-department/${dept.id}`)}
                                className="flex items-center p-1 md:p-3 rounded-xl hover:bg-themegray cursor-pointer justify-between w-full"
                            >
                                <div className="flex items-center w-[calc(100%-20px)]">
                                    {(() => {
                                        // Mapping for department icon and background based on category
                                        const departmentIconMapping = {
                                            Science: {
                                                icon: <BookOpen size={20} />,
                                                bg: "bg-vpppurple",
                                            },
                                            Engineering: {
                                                icon: <Cpu size={20} />,
                                                bg: "bg-vppgreen",
                                            },
                                        };
                                        const mapping = departmentIconMapping[dept.deptCategory] || {
                                            icon: <User size={20} />,
                                            bg: "bg-vpporange",
                                        };
                                        return (
                                            <div className={`${mapping.bg} p-2 rounded-full mr-2 text-white`}>
                                                {mapping.icon}
                                            </div>
                                        );
                                    })()}
                                    <div className="w-full">
                                        <h1 className="text-lg md:text-xl font-neueMedium truncate w-[calc(100%-60px)]">
                                            {dept.deptName}
                                        </h1>
                                        <div className="flex gap-1 flex-col md:flex-row md:gap-10">
                                            <h1 className="opacity-50 text-xs md:text-base">Created on: {dept.deptDate}</h1>
                                            <h1 className="opacity-50 text-xs md:text-base">Members: {dept.deptMembers}</h1>
                                        </div>
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    <ChevronDown size={20} />
                                </div>
                            </div>
                        ))
                    ) : (
                        <h1 className="text-center opacity-50 mt-4">No departments found.</h1>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DepartmentsPage;
