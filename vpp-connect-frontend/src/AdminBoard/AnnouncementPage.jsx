import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  TableOfContents,
  PlusCircle,
  File,
  EllipsisVertical,
} from "lucide-react";
import AdminHeader from "./AdminHeader";

const AnnouncementPage = () => {
  const navigate = useNavigate();
  const link = window.location.href;
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFull, setIsFull] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const itemsPerPage = isFull ? 10 : 4;

  useEffect(() => {
    if (link.includes("announcements")) {
      setIsFull(true);
    }
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/announcements/all")
      .then((response) => response.json())
      .then((data) => setAnnouncements(data))
      .catch((error) => console.error("Error fetching announcements:", error));
  }, []);

  // Filter announcements based on category
  const filteredByCategory =
    selectedCategory === "All"
      ? announcements
      : announcements.filter((item) => item.category === selectedCategory);

  // Filter announcements based on search term
  const filteredAnnouncements = filteredByCategory.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
  };

  // Paginate filtered announcements
  const paginatedAnnouncements = filteredAnnouncements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Mapping for document icon backgrounds based on category
  const announcementIconMapping = {
    update: "bg-vpppurple",
    holiday_notice: "bg-vpporange",
    exam_update: "bg-vppviolet",
    event: "bg-vppgreen",
    placement_update: "bg-vppblue",
  };

  return (
    <div>
      <div className="flex flex-col gap-1 mt-6 mb-2">
        {isFull ? (
          <AdminHeader text="All Announcements" />
        ) : (
          <h1 className="text-2xl font-neueMedium md:text-2xl mb-2">
            Announcements
          </h1>
        )}
      </div>
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="bg-white w-full rounded-2xl p-6 ">
          <div className="flex flex-col md:flex-row justify-between mb-4 gap-3 items-center">
          <div className="flex border-2 p-2 rounded-lg border-gray-400 opacity-50 gap-3 items-center px-4 w-full md:w-[54%] mb-2 md:mb-0">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search Announcements"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent outline-none text-lg"
              />
            </div>
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
                  {["All", "update"].map((category) => (
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
                onClick={() => navigate("/admin/announcements")}
              >
                View All <TableOfContents size={30} />{" "}
              </button>
              <button
                className="bg-[#5d46ac] text-white p-2 rounded-lg flex gap-2 items-center px-1 md:px-5 cursor-pointer"
                onClick={() => navigate("/admin/edit-announcement")}
              >
                Add New <PlusCircle size={30} />{" "}
              </button>
            </div>
          </div>
          <div className="flex items-center opacity-50 justify-between mt-4 px-2">
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
          <div className="flex flex-col gap-2 mt-2">
            {paginatedAnnouncements && paginatedAnnouncements.length > 0 ? (
              paginatedAnnouncements.map((announcement) => (
                <div
                  key={announcement.announcementId}
                  onClick={() =>
                    navigate(
                      `/admin/edit-announcement/${announcement.announcementId}`
                    )
                  }
                  className="flex items-center p-1 md:p-3 rounded-xl hover:bg-themegray cursor-pointer justify-between w-full"
                >
                  <div className="flex items-center w-[calc(100%-20px)]">
                    <div
                      className={`p-2 rounded-full mr-4 text-white ${
                        announcementIconMapping[announcement.category] ||
                        "bg-vpppurple"
                      }`}
                    >
                      <File />
                    </div>
                    <div className="w-full">
                      <h1 className="text-lg md:text-xl font-neueMedium truncate w-[calc(100%-60px)]">
                        {announcement.title}
                      </h1>
                      <div className="flex gap-1 ">
                        <h1 className="opacity-50 text-xs md:text-base">
                          Posted by:{" "}
                          {announcement.postedByInfo?.fullname
                            ? announcement.postedByInfo.fullname
                            : "Admin"}
                        </h1>
                        <h1 className="opacity-50 text-xs md:text-base">
                          | {new Date(
                            announcement.timestamp._seconds * 1000
                          ).toLocaleDateString()}
                        </h1>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <EllipsisVertical size={20} />
                  </div>
                </div>
              ))
            ) : (
              <h1 className="text-center opacity-50 mt-4">
                No announcements found.
              </h1>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementPage;
