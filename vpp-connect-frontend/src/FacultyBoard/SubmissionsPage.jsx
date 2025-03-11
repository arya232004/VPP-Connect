import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, RotateCw, PlusCircle, Search, TableOfContents, File } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FacultyHeader from "./FacultyHeader";

function SubmissionsPage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [tasks, setTasks] = useState([]);
  const [isFull, setIsFull] = useState(false);
  const itemsPerPage = isFull ? 10 : 4;
  const navigate = useNavigate();

  // Fetch tasks posted by the faculty
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/tasks/faculty/" + user.userId
        );
        const data = await response.json();
        if (data.tasks) {
          setTasks(data.tasks);
        } else {
          setTasks([]);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, []);

  const categories = ["All", "Assignment", "Class Assignment", "HomeWork"];

  useEffect(() => {
    const link = window.location.href;
    if (link.includes("viewall-submissions")) {
      setIsFull(true);
    }
  }, []);

  // Function to handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false); // Close dropdown after selecting a category
  };

  // Filter tasks based on category
  const filteredTasks =
    selectedCategory === "All"
      ? tasks
      : tasks.filter(
          (task) => task.type.toLowerCase() === selectedCategory.toLowerCase()
        );

  // Filter tasks based on search term
  const filteredTasksBySearch = filteredTasks.filter((task) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination for Tasks
  const totalPages = Math.ceil(filteredTasksBySearch.length / itemsPerPage);

  const paginatedTasks = filteredTasksBySearch.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Array for alternate colors for task icons
  const taskColors = ["bg-vpppurple", "bg-vppgreen", "bg-vppviolet", "bg-vpporange"];

  return (
    <div>
      <div className="flex flex-col gap-1 m-auto md:m-0">
        {isFull ? (
          <FacultyHeader user={user} />
        ) : (
          <h1 className="text-2xl font-neueMedium md:text-2xl mt-6 mb-4">
            Submissions
          </h1>
        )}
      </div>
      <div className="bg-white w-full rounded-2xl p-6">
        <div className="flex flex-col md:flex-row justify-between mb-4 gap-3 items-center">
          <div className="flex border-2 p-2 rounded-lg border-gray-400 opacity-50 gap-3 items-center px-4 w-full md:w-[54%] mb-2 md:mb-0">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search Submissions"
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
                {categories.map((category) => (
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
            <button
              className="border-1 text-[#5d46ac] p-2 rounded-lg flex items-center gap-2 px-1 md:px-5 cursor-pointer"
              onClick={() => navigate("/faculty/viewall-submissions")}
            >
              View All <TableOfContents size={30} />
            </button>
            <button
              className="bg-[#5d46ac] text-white p-2 rounded-lg flex gap-2 items-center px-1 md:px-5 cursor-pointer"
              onClick={() => navigate("/faculty/add-assignment")}
            >
              Add New <PlusCircle size={20} />
            </button>
          </div>
        </div>

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

        {/* Task List */}
        <div className="flex flex-col gap-2 mt-2">
          {paginatedTasks.length > 0 ? (
            paginatedTasks.map((task, index) => (
              <div
                key={index}
                onClick={() => navigate(`/faculty/view-submissions/${task.taskId}`)}
                className="flex items-center p-1 md:p-3 rounded-xl hover:bg-themegray cursor-pointer justify-between w-full"
              >
                <div className="flex items-center w-[calc(100%-20px)]">
                  <div className={`${taskColors[index % taskColors.length]} p-3 rounded-full mr-3 text-white`}>
                    <File size={20} />
                  </div>
                  <div className="w-full">
                    <h1 className="text-lg md:text-xl font-neueMedium truncate w-[calc(100%-60px)]">
                      {task.title}
                    </h1>
                    <div className="flex items-center gap-1 flex-col md:flex-row md:gap-10">
                      <h2 className="">
                        Status: {task.status === "active" ? "Active" : "Inactive"}
                      </h2>
                      <h1 className="opacity-50  md:text-base md:gap-10">
                        Category: {task.type === "class_assignment" ? "Class Assignment" : "Other"}
                      </h1>
                      <h1 className="opacity-50 text-xs md:text-base md:gap-10">
                        Assigned By: {task.facultyName}
                      </h1>
                      {/* check how many submitted and how many pending under submissions  */}
                      <div className="flex gap-1">
                        <h1 className="opacity-50 text-xs md:text-base md:gap-10">
                          Submitted: {task.submissions.filter((submission) => submission.status === "submitted").length}
                        </h1>
                        <h1 className="opacity-50 text-xs md:text-base md:gap-10">
                          Pending: {task.submissions.filter((submission) => submission.status === "pending").length}
                        </h1>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="shrink-0">
                  <ChevronDown size={20} />
                </div>
              </div>
            ))
          ) : (
            <h1 className="text-center opacity-50 mt-4">No tasks found.</h1>
          )}
        </div>
      </div>
    </div>
  );
}

export default SubmissionsPage;
