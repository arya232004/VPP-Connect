import React, { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import VPPHeader from "../pages/VPPHeader";

function LatestCourseUpdate() {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPaginationPage, setCurrentPaginationPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const coursesPerPage = 5;

  // Load saved query and courses from localStorage on mount
  useEffect(() => {
    const savedQuery = localStorage.getItem("latestCourseQuery");
    const savedCourses = localStorage.getItem("latestCourseResults");
    if (savedQuery) {
      setSearchQuery(savedQuery);
    }
    if (savedCourses) {
      try {
        setCourses(JSON.parse(savedCourses));
      } catch (e) {
        console.error("Error parsing saved courses", e);
      }
    }
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    fetch(
      `http://localhost:5000/api/latest/searchcourses?q=${encodeURIComponent(
        searchQuery
      )}`
    )
      .then((response) => response.json())
      .then((data) => {
        const result = data.courses || data;
        setCourses(result);
        setCurrentPaginationPage(1);
        // Save search query and results in localStorage
        localStorage.setItem("latestCourseQuery", searchQuery);
        localStorage.setItem("latestCourseResults", JSON.stringify(result));
      })
      .catch((error) => console.error("Error fetching courses:", error))
      .finally(() => setLoading(false));
  };

  const totalPages = Math.ceil(courses.length / coursesPerPage);
  const paginatedCourses = courses.slice(
    (currentPaginationPage - 1) * coursesPerPage,
    currentPaginationPage * coursesPerPage
  );

  return (
    <div>
      <VPPHeader text="Course Updates" />

      <div className="bg-white w-full md:w-[100%] rounded-2xl p-6">
        {/* Search Box */}
        <div className="flex flex-col md:flex-row justify-between mb-4">
          <div className="flex border-2 p-3 rounded-lg border-gray-400 opacity-50 gap-3 items-center px-4 w-full mb-4 md:mb-0">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search Courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-lg"
            />
          </div>
          <button
            onClick={handleSearch}
            className="ml-2 px-4 py-2 bg-themeblue text-lg text-white rounded-lg cursor-pointer"
          >
            Search
          </button>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center opacity-50 justify-end mt-4 px-2">
            <div className="flex items-center gap-3">
              <h1>
                {(currentPaginationPage - 1) * coursesPerPage + 1} -{" "}
                {Math.min(currentPaginationPage * coursesPerPage, courses.length)}{" "}
                of {courses.length}
              </h1>
              <div className="flex gap-6 items-center">
                <button
                  onClick={() =>
                    setCurrentPaginationPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPaginationPage === 1}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() =>
                    setCurrentPaginationPage((prev) =>
                      Math.min(prev + 1, totalPages)
                    )
                  }
                  disabled={currentPaginationPage === totalPages}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Courses List */}
        <div className="flex flex-col gap-2 mt-2">
          {loading ? (
            <p className="text-center opacity-50 mt-4">Loading...</p>
          ) : paginatedCourses.length > 0 ? (
            paginatedCourses.map((course, index) => (
              <div
                key={index}
                className="flex items-center p-3 rounded-xl hover:bg-themegray cursor-pointer justify-between w-full"
              >
                <div className="md:flex w-[calc(100%-20px)]">
                  <img
                    src={course.image || "https://via.placeholder.com/100"}
                    alt={course.title}
                    className="w-full md:w-50 h-30 object-cover rounded-lg mr-4"
                  />
                  <div className="w-full">
                    <h1 className="text-lg md:text-xl font-neueMedium break-words whitespace-normal">
                      {course.title}
                    </h1>
                    <div className="flex gap-4 text-gray-500">
                      <p>{course.provider || "N/A"}</p>
                      <p>{course.rating}</p>
                    </div>
                    <a
                      href={course.courseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-themeblue hover:underline text-sm mt-2"
                    >
                      View Course
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <h1 className="text-center opacity-50 mt-4">No courses found.</h1>
          )}
        </div>
      </div>
    </div>
  );
}

export default LatestCourseUpdate;
