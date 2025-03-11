import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, RotateCw, PlusCircle, Search, TableOfContents, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FacultyHeader from "./FacultyHeader";

function ClassesPage() {
  // Get current user and department from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const getUserDept = user.departmentId;
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFull, setIsFull] = useState(false);
  const [departments, setDepartments] = useState({}); // Departments mapping: deptId -> deptName
  const itemsPerPage = isFull ? 10 : 4;
  const navigate = useNavigate();
  const [classesId, setClassesId] = useState([]);
  const [classesData, setClassesData] = useState([]);
  const [finalClasses, setFinalClasses] = useState([]);
  
  // Categories for classes dropdown
  const classCategory = [
    "All",
    "Computer Science",
    "Engineering",
    "Mathematics",
    "Physics",
  ];

  // Alternate colors for class icons
  const classColors = ["bg-vpppurple", "bg-vppgreen", "bg-vppviolet", "bg-vpporange"];

  // Fetch departments for each class once classesData is loaded
  useEffect(() => {
    if (classesData.length > 0) {
      const fetchDepartments = async () => {
        try {
          const departmentData = {};
          for (let cls of classesData) {
            const departmentResponse = await fetch(
              `http://localhost:5000/api/departments/get/${cls.departmentId}`
            );
            const department = await departmentResponse.json();
            departmentData[cls.departmentId] = department.department.departmentName;
          }
          setDepartments(departmentData);
        } catch (error) {
          console.error("Error fetching department data:", error);
        }
      };
      fetchDepartments();
    }
  }, [classesData]);

  // Fetch classesId based on the current user's department
  useEffect(() => {
    fetch(`http://localhost:5000/api/departments/classes/${getUserDept}`)
      .then((response) => response.json())
      .then((data) => {
        setClassesId(data.classes);
      })
      .catch((error) => console.error("Error fetching classes ID:", error));
  }, [getUserDept]);

  // Fetch all classes data
  useEffect(() => {
    fetch(`http://localhost:5000/api/departments/allclasses`)
      .then((response) => response.json())
      .then((data) => {
        setClassesData(data.classes);
      })
      .catch((error) => console.error("Error fetching classes:", error));
  }, []);

  // Update finalClasses when classesId or classesData change
  useEffect(() => {
    if (classesId.length > 0 && classesData.length > 0) {
      const matchingClasses = classesData.filter((classData) =>
        classesId.includes(classData.classId)
      );
      setFinalClasses(matchingClasses);
    }
  }, [classesId, classesData]);

  // Filter classes by category (here filtering on class name matching selectedCategory)
  const filteredClasses =
    selectedCategory === "All"
      ? classesData || []
      : (classesData || []).filter((cls) => cls.name === selectedCategory);

  // Filter classes by search term (using the class name)
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
    if (window.location.href.includes("classes")) {
      setIsFull(true);
    }
  }, []);

  return (
    <div>
      {/* Classes Section Header */}
      <div className="flex flex-col gap-1 m-auto md:m-0">
        {isFull ? (
          <FacultyHeader text="All Classes" user={user} />
        ) : (
          <h1 className="text-2xl font-neueMedium md:text-2xl mt-6 mb-4">Classes</h1>
        )}
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
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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
                    onClick={() => handleCategoryChange(category)}
                    className="p-2 px-4 cursor-pointer hover:bg-themegray opacity-50"
                  >
                    {category}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Action Buttons */}
          <div className="text-sm md:text-lg rounded-xl gap-2 md:gap-2 md:w-[22%] flex justify-between">
            <button
              className="border-1 text-[#5d46ac] p-2 rounded-lg flex items-center gap-2 px-1 md:px-5 cursor-pointer"
              onClick={() => navigate("/faculty/classes")}
            >
              View All <TableOfContents size={30} />
            </button>
            <button
              className="bg-[#5d46ac] text-white p-2 rounded-lg flex gap-2 items-center px-1 md:px-5 cursor-pointer"
              onClick={() => navigate("/faculty/edit-classes")}
            >
              Add New <PlusCircle size={20} />
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

        {/* Class List */}
        <div className="flex flex-col gap-2 mt-2">
          {paginatedClasses.length > 0 ? (
            finalClasses.map((cls, index) => (
              <div
                key={index}
                onClick={() => navigate(`/faculty/edit-classes/${cls.classId}`)}
                className="flex items-center p-1 md:p-3 rounded-xl hover:bg-themegray cursor-pointer justify-between w-full"
              >
                <div className="flex items-center w-[calc(100%-20px)]">
                  <div className={`${classColors[index % classColors.length]} p-3 rounded-full mr-3 text-white`}>
                    <BookOpen size={20} />
                  </div>
                  <div className="w-full">
                    <h1 className="text-lg md:text-xl font-neueMedium truncate w-[calc(100%-60px)]">
                      {cls.name} - {cls.divisionName}
                    </h1>
                    <div className="flex gap-1 flex-col md:flex-row md:gap-10">
                      <h1 className="opacity-50 text-xs md:text-base">
                        Department: {departments[cls.departmentId] || "Loading..."}
                      </h1>
                      <h1 className="opacity-50 text-xs md:text-base">
                        Semester: {cls.semester}
                      </h1>
                      <h1 className="opacity-50 text-xs md:text-base">
                        Chat Room: {cls.roomData}
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
            <h1 className="text-center opacity-50 mt-4">No classes found.</h1>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClassesPage;
