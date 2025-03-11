import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, RotateCw, PlusCircle, Search, TableOfContents } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FacultyHeader from "./FacultyHeader";

function GroupPage() {
    const user = JSON.parse(localStorage.getItem("user"));
    const getUserDept = user.departmentId;
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const link = window.location.href;
    const [isFull, setIsFull] = useState(false)
    const itemsPerPage = isFull ? 10 : 4;
    const navigate = useNavigate();

    // Sample group data
    const groupData = [
        { grpName: "AI Group", grpDate: "Apr 16, 2024", grpMembers: 10, grpCategory: "Students", id: 301 },
        { grpName: "CS Group", grpDate: "Mar 30, 2024", grpMembers: 20, grpCategory: "Teachers", id: 302 },
        { grpName: "Web Development Group", grpDate: "Feb 20, 2024", grpMembers: 15, grpCategory: "Students", id: 303 },
        { grpName: "Data Science Group", grpDate: "Mar 15, 2024", grpMembers: 12, grpCategory: "Teachers", id: 304 },
        { grpName: "Cybersecurity Group", grpDate: "Jan 25, 2024", grpMembers: 8, grpCategory: "Teachers", id: 305 },
        // More groups...
    ];
    

    const groupCategory = ["All", "Teachers", "Students"];

    // Filter groups based on category
    const filteredGroups = selectedCategory === "All"
        ? groupData
        : groupData.filter((group) => group.grpCategory === selectedCategory);

    // Filter groups based on search term
    const filteredGroupsBySearch = filteredGroups.filter((group) =>
        group.grpName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination for Groups
    const totalPages = Math.ceil(filteredGroupsBySearch.length / itemsPerPage);

    const paginatedGroups = filteredGroupsBySearch.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setIsDropdownOpen(false);
    };


    useEffect(() => {
        if (link.includes("groups")) {
            setIsFull(true);
        }
    }, []);

    return (
        <div>
            {/* Groups Section Header */}
            <div className="flex flex-col gap-1 m-auto md:m-0">
                {isFull ? <FacultyHeader text="All Groups" /> : <h1 className="text-3xl font-neueMedium md:text-4xl mb-2">Groups</h1>}
            </div>
            <div className="bg-white w-full rounded-2xl p-6">
                {/* Search and Category Dropdown */}
                <div className="flex flex-col md:flex-row justify-between mb-4 gap-3 items-center">
                    {/* Search Bar */}
                    <div className="flex border-2 p-2 rounded-lg border-gray-400 opacity-50 gap-3 items-center px-4 w-full md:w-[54%] mb-2 md:mb-0">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search Groups"
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
                                {groupCategory.map((category) => (
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

                    {/* Add New Group Button */}
                    <div className="text-sm md:text-lg rounded-xl gap-2 md:gap-2 md:w-[22%] flex justify-between">
                        <button className="border-1 text-[#5d46ac] p-2 rounded-lg flex items-center gap-2 px-1 md:px-5 cursor-pointer"
                            onClick={() => navigate('/faculty/groups')}
                        >
                            View All  <TableOfContents size={30} />
                        </button>
                        <button className="bg-[#5d46ac] text-white p-2 rounded-lg flex gap-2 items-center px-1 md:px-5 cursor-pointer"
                         onClick={() => navigate('/faculty/edit-groups')}>
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

                {/* Group List */}
                <div className="flex flex-col gap-2 mt-2">
                    {paginatedGroups.length > 0 ? (
                        paginatedGroups.map((group, index) => (
                            <div
                                key={index}
                                onClick={() => navigate(`/faculty/edit-group/${group.id}`)} // Navigate to the announcement detail page
                                className="flex items-center p-1 md:p-3 rounded-xl hover:bg-themegray cursor-pointer justify-between w-full"
                            >
                                <div className="flex items-center w-[calc(100%-20px)]">
                                    <div className="bg-vpppurple p-1 rounded-full mr-2 text-white">
                                        {/* Icon placeholder */}
                                    </div>
                                    <div className="w-full">
                                        <h1 className="text-lg md:text-xl font-neueMedium truncate w-[calc(100%-60px)]">
                                            {group.grpName}
                                        </h1>
                                        <div className="flex gap-1 flex-col">
                                            <h1 className="opacity-50 text-xs md:text-base">Created on: {group.grpDate}</h1>
                                            {/* <h1 className="opacity-50 text-xs md:text-base">Members: {group.grpMembers}</h1> */}
                                        </div>
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    <ChevronDown size={20} />
                                </div>
                            </div>
                        ))
                    ) : (
                        <h1 className="text-center opacity-50 mt-4">No groups found.</h1>
                    )}
                </div>
            </div>
        </div>
    );
}

export default GroupPage;
