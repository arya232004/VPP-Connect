import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, RotateCw, PlusCircle, Search, TableOfContents } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import { UsersRound } from "lucide-react"; // Added group icon import

function DepartmentsPage() {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isFull, setIsFull] = useState(false);
    const [departmentsData, setDepartmentsData] = useState([]);
    const itemsPerPage = isFull ? 10 : 4;
    const navigate = useNavigate();
    const link = window.location.href;
    // Adjust this array as needed; here we assume departments have a 'deptCategory' field.
    const departmentCategory = ["All", "Science", "Engineering"];

    // Alternate colors for department icons.
    const deptColors = ["bg-vpppurple", "bg-vppgreen", "bg-vppviolet", "bg-vpporange"];

    useEffect(() => {
        if (link.includes("department")) {
            setIsFull(true);
        }
    }, [link]);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/departments/all");
                const data = await response.json();
                if (data.departments) {
                    setDepartmentsData(data.departments);
                }
            } catch (error) {
                console.error("Error fetching departments:", error);
            }
        };
        fetchDepartments();
    }, []);

    // Filter by category (if deptCategory exists)
    const filteredDepartments = selectedCategory === "All"
        ? departmentsData
        : departmentsData.filter((dept) => dept.deptCategory === selectedCategory);

    const filteredDepartmentsBySearch = filteredDepartments.filter((dept) =>
        dept.departmentName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredDepartmentsBySearch.length / itemsPerPage);

    const paginatedDepartments = filteredDepartmentsBySearch.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setIsDropdownOpen(false);
    };

    return (
        <div>
            <div className="flex flex-col gap-1 m-auto md:m-0">
                {isFull ? (
                    <AdminHeader text="All Departments" />
                ) : (
                    <h1 className="text-2xl font-neueMedium md:text-2xl mt-6 mb-4">Departments</h1>
                )}
            </div>
            <div className="bg-white w-full rounded-2xl p-6">
                {/* Search & Category Dropdown */}
                <div className="flex flex-col md:flex-row justify-between mb-4 gap-3 items-center">
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
                    <div className="relative w-full md:w-[32%] z-10">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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
                                        onClick={() => handleCategoryChange(category)}
                                        className="p-2 px-4 cursor-pointer hover:bg-themegray opacity-50"
                                    >
                                        {category}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="text-sm md:text-lg rounded-xl gap-2 md:gap-2 md:w-[22%] flex justify-between">
                        <button
                            className="border-1 text-[#5d46ac] p-2 rounded-lg flex items-center gap-2 px-1 md:px-5 cursor-pointer"
                            onClick={() => navigate('/admin/departments')}
                        >
                            View All <TableOfContents size={30} />
                        </button>
                        <button
                            className="bg-[#5d46ac] text-white p-2 rounded-lg flex gap-2 items-center px-1 md:px-5 cursor-pointer"
                            onClick={() => navigate('/admin/edit-department')}
                        >
                            Add New <PlusCircle size={20} />
                        </button>
                    </div>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center opacity-50 justify-between mt-4 px-2">
                    <RotateCw size={20} />
                    <div className="flex items-center gap-3">
                        <h3>{currentPage} of {totalPages}</h3>
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
                                onClick={() => navigate(`/admin/edit-department/${dept.departmentId}`)}
                                className="flex items-center p-1 md:p-3 rounded-xl hover:bg-themegray cursor-pointer justify-between w-full"
                            >
                                <div className="flex items-center w-[calc(100%-20px)]">
                                    <div className={`${deptColors[index % deptColors.length]} p-2 rounded-full mr-3 text-white`}>
                                        <UsersRound size={20} />
                                    </div>
                                    <div className="w-full">
                                        <h1 className="text-lg md:text-xl font-neueMedium truncate w-[calc(100%-60px)]">
                                            {dept.departmentName}
                                        </h1>
                                        <div className="flex flex-col md:flex-row md:gap-1">
                                        <h1 className="opacity-50 text-xs md:text-base">
                                                Classes: {dept.classes ? dept.classes.length : 0}
                                            </h1>
                                            <h1 className="opacity-50 text-xs md:text-base">
                                                | {new Date(dept.timestamp._seconds * 1000).toLocaleDateString()}
                                            </h1>
                                            
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
