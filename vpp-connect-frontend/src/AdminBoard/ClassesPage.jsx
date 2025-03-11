import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, RotateCw, PlusCircle, Search, TableOfContents, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";

function ClassesPage() {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isFull, setIsFull] = useState(false);
    const [classes, setClasses] = useState([]);
    const [departments, setDepartments] = useState({});
    const itemsPerPage = isFull ? 10 : 4;
    const navigate = useNavigate();

    const link = window.location.href;
    const classCategory = ["All", "Computer Science", "Engineering", "Mathematics", "Physics"];

    // Alternate colors for class icons.
    const classColors = ["bg-vpppurple", "bg-vppgreen", "bg-vppviolet", "bg-vpporange"];

    // Fetching classes and departments data
    useEffect(() => {
        // Fetch all classes
        const fetchClasses = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/departments/allclasses");
                const data = await response.json();
                setClasses(data.classes);

                // For each class, fetch the department information
                const departmentData = {};
                for (let cls of data.classes) {
                    const departmentResponse = await fetch(`http://localhost:5000/api/departments/get/${cls.departmentId}`);
                    const department = await departmentResponse.json();
                    departmentData[cls.departmentId] = department.department.departmentName;
                }
                setDepartments(departmentData);
            } catch (error) {
                console.error("Error fetching class or department data:", error);
            }
        };

        fetchClasses();
    }, []);

    const filteredClasses = selectedCategory === "All"
        ? classes
        : classes.filter((cls) => cls.name === selectedCategory);

    const filteredClassesBySearch = filteredClasses.filter((cls) =>
        cls.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredClassesBySearch.length / itemsPerPage);

    const paginatedClasses = filteredClassesBySearch.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setIsDropdownOpen(false);
    };

    useEffect(() => {
        if (link.includes("classes")) {
            setIsFull(true);
        }
    }, [link]);

    return (
        <div>
            <div className="flex flex-col gap-1 m-auto md:m-0">
                {isFull ? <AdminHeader text="All Classes" /> : <h1 className="text-2xl font-neueMedium md:text-2xl mb-4 mt-6">Classes</h1>}
            </div>
            <div className="bg-white w-full rounded-2xl p-6">
                {/* Search and Category Dropdown */}
                <div className="flex flex-col md:flex-row justify-between mb-4 gap-3 items-center">
                    {/* Search Bar */}
                    <div className="flex border-2 p-2 rounded-lg border-gray-400 opacity-50 gap-3 items-center px-4 w-full md:w-[54%] mb-2 md:mb-0">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search Classes"
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
                                {classCategory.map((category) => (
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

                    {/* Add New Class Button */}
                    <div className="text-sm md:text-lg rounded-xl gap-2 md:gap-2 md:w-[22%] flex justify-between">
                        <button className="border-1 text-[#5d46ac] p-2 rounded-lg flex items-center gap-2 px-1 md:px-5 cursor-pointer"
                            onClick={() => navigate('/admin/classes')}
                        >
                            View All <TableOfContents size={30} />
                        </button>
                        <button className="bg-[#5d46ac] text-white p-2 rounded-lg flex gap-2 items-center px-1 md:px-5 cursor-pointer"
                            onClick={() => navigate('/admin/edit-classes')}
                        >
                            Add New <PlusCircle size={20} />
                        </button>
                    </div>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center opacity-50 justify-between mt-4 px-2">
                    <RotateCw size={20} />
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

                {/* Class List */}
                <div className="flex flex-col gap-2 mt-2">
                    {paginatedClasses.length > 0 ? (
                        paginatedClasses.map((cls, index) => (
                            <div
                                key={index}
                                onClick={() => navigate(`/admin/edit-classes/${cls.classId}`)}
                                className="flex items-center p-1 md:p-3 rounded-xl hover:bg-themegray cursor-pointer justify-between w-full"
                            >
                                <div className="flex items-center w-[calc(100%-20px)]">
                                    <div className={`${classColors[index % classColors.length]} p-2 rounded-full mr-3 text-white`}>
                                        <BookOpen size={20} />
                                    </div>
                                    <div className="w-full">
                                        <h1 className="text-lg md:text-xl font-neueMedium truncate w-[calc(100%-60px)]">
                                            {cls.name} - {cls.divisionName}
                                        </h1>
                                        <div className="flex flex-col md:flex-row md:gap-6">
                                            <h1 className="opacity-50 text-xs md:text-base">Department: {departments[cls.departmentId] || "Loading..."}</h1>
                                            <h1 className="opacity-50 text-xs md:text-base">Semester: {cls.semester}</h1>
                                            <h1 className="opacity-50 text-xs md:text-base">Chat Room: {cls.roomData}</h1>
                                        </div>
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    <ChevronDown size={20} />
                                </div>
                            </div>
                        ))
                    ) : (
                        <h1 className="text-center opacity-50 mt-4">No classes found.</h1>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ClassesPage;
