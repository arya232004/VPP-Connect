import React, { useState, useEffect } from "react";
import VPPHeader from "../pages/VPPHeader";
import SubmissionsModal from "./Modals/SubmissionModal";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  DiamondPlus,
  EllipsisVertical,
  FileCheck,
  TimerReset,
  Search,
} from "lucide-react";

function Submissions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [currentPaginationPage, setCurrentPaginationPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionsData, setSubmissionsData] = useState([]);
  const submissionsPerPage = 10;
  const student = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/tasks/student/${student.userId}`);
        const data = await response.json();
        if (data.tasks) {
          setSubmissionsData(data.tasks);
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);
      }
    };
    fetchSubmissions();
  }, []);

  const openModal = (submission) => {
    setSelectedSubmission(submission);
    setModalOpen(true);
  };

  // Filtering submissions
  const filteredSubmissions = submissionsData
    .filter(submission =>
      submission.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(submission =>
      activeCategory === "All" ? true : submission.type === activeCategory.toLowerCase()
    );

  const totalPages = Math.ceil(filteredSubmissions.length / submissionsPerPage);
  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPaginationPage - 1) * submissionsPerPage,
    currentPaginationPage * submissionsPerPage
  );

  return (
    <div>
      <VPPHeader text="Submissions" />
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="bg-white w-full rounded-2xl p-6">
          <div className="flex flex-col md:flex-row justify-between mb-4">
            <div className="flex border-2 p-3 rounded-lg border-gray-400 opacity-50 gap-3 items-center px-4 w-full md:w-[64%]">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search Submissions"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-lg"
              />
            </div>

            <div className="relative w-full md:w-[35%] z-1">
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex w-full border-2 p-3 px-4 rounded-lg border-gray-400 opacity-50 gap-3 items-center justify-between"
              >
                <h1 className="text-lg">{activeCategory}</h1>
                <ChevronDown size={20} />
              </button>
              {categoryDropdownOpen && (
                <div className="absolute left-0 w-full bg-white shadow-md rounded-lg text-lg">
                  {["All", "Assignment", "Exam", "Lecture"].map(category => (
                    <div
                      key={category}
                      onClick={() => {
                        setActiveCategory(category);
                        setCategoryDropdownOpen(false);
                      }}
                      className="p-2 px-4 cursor-pointer hover:bg-themegray opacity-50"
                    >
                      {category}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center opacity-50 justify-between mt-4 px-2">
            <h1>
              {currentPaginationPage * submissionsPerPage - submissionsPerPage + 1}-
              {Math.min(currentPaginationPage * submissionsPerPage, filteredSubmissions.length)} of {filteredSubmissions.length}
            </h1>
            <div className="flex gap-6 items-center">
              <button
                onClick={() => setCurrentPaginationPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPaginationPage === 1}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentPaginationPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPaginationPage === totalPages}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            {paginatedSubmissions.length > 0 ? (
              paginatedSubmissions.map((submission, index) => (
                console.log("Submission:", submission),
                <div
                  key={index}
                  className="flex items-center p-3 rounded-xl hover:bg-themegray cursor-pointer justify-between w-full"
                  onClick={() => openModal(submission)}
                >
                  <div className="flex items-center w-full">
                    <div className={`p-3 rounded-full mr-2 text-white ${submission.submission.status == "submitted"  ? "bg-vppgreen" : "bg-vpporange"}`}>
                      {submission.submission.status == "submitted" ? <FileCheck /> : <TimerReset />}
                    </div>
                    <div className="w-full">
                      <h1 className="text-lg font-medium truncate w-full">{submission.title}</h1>
                      <div className="flex gap-8">
                        <h1 className="text-xs opacity-50 p-1">Due: {new Date(submission.deadline._seconds * 1000).toLocaleDateString()}</h1>
                        <div className="flex opacity-50 items-center gap-2">
                          <DiamondPlus size={18} />
                          <h1 className="text-xs p-1">{submission.total} Marks</h1>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <EllipsisVertical size={20} />
                  </div>
                </div>
              ))
            ) : (
              <h1 className="text-center opacity-50 mt-4">No submissions found.</h1>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <SubmissionsModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          submission={selectedSubmission}
        />
      )}
    </div>
  );
}

export default Submissions;