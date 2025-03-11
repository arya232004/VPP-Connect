import React, { useState, useEffect } from "react";
import VPPHeader from "../../pages/VPPHeader";
import {
  ChevronDown,
  EllipsisVertical,
  Search,
  UsersRound,
  Calendar,
  Megaphone,
  Bell,
  BookOpen,
  MoveUpRight
} from "lucide-react";
import EventModal from "../Modals/EventModal";
import AnnouncementModal from "../Modals/AnnouncementModal";
import axios from "axios";
import { useAuth } from "../../AuthContext";

function Announcements() {
  // We'll store announcements grouped by the dynamic department key.
  const [announcementsData, setAnnouncementsData] = useState({});
  const [selectedGroup, setSelectedGroup] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  // Changed default value to "all" which is the filter value for "All"
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalData, setModalData] = useState(null);
  const [modalType, setModalType] = useState(null);
  const { user } = useAuth();

  // Categories mapping: key = label to show, value = category filter value.
  const categories = {
    All: "all",
    Updates: "update",
    "Holiday Notice": "holiday_notice",
    "Exam Updates": "exam_update",
    "Placement Update": "placement_update",
    Events: "event",
  };

  const itemsPerPage = 10;

  // Mapping announcement category to UI format.
  const transformAnnouncement = (item) => {
    // Format the timestamp to a readable date.
    const date = new Date(item.timestamp._seconds * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  
    // Safely compute the group key for college announcements.
    let groupKey = "General";
    if (item.targetInfo) {
      if (item.targetInfo.departmentName) {
        groupKey = item.targetInfo.departmentName;
      } else if (item.targetInfo.name) {
        groupKey = `${item.targetInfo.name} ${item.targetInfo.divisionName || ""}`.trim();
      }
    } else {
      // For college announcements, you might want to set a default group key.
      groupKey = "College";
    }
  
    return {
      title: item.title,
      date: date,
      category: item.category,
      announcementType: item.announcementType || "normal",
      department: groupKey,
      content: item.content,
      postedBy: item.postedBy,
      targetInfo: item.targetInfo,
      profilePic: item.postedByInfo?.profilePic || null,
      fullname: item.postedByInfo?.fullname || null,
      fileId: item.fileId || null,
      fileUrl: item.fileId ? item.fileUrl : null,
      thumbnailUrl: item.fileId ? item.thumbnailUrl : null,
    };
  };
  
  // Fetch announcements and group them by the dynamic department key.
  async function getannouncement(level, id) {
    console.log(id, level);
    let response;
    try {
      if (!id) {
        console.log("No id");
        response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/announcements/level/college`
        );
        console.log(response);
      } else {
        response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/announcements/level/${level}?targetId=${id}`
        );
      }
      const data = response.data; // API returns an array of announcement objects
      console.log(data);
      // Group the transformed announcements by computed department key.
      const grouped = data.reduce((acc, item) => {
        const transformed = transformAnnouncement(item);
        const groupKey = transformed.department;
        if (!acc[groupKey]) {
          acc[groupKey] = [];
        }
        acc[groupKey].push(transformed);
        return acc;
      }, {});
      console.log(grouped);

      setAnnouncementsData((prev) => ({ ...prev, ...grouped }));

      // Set the default selected group to the first available group.
      const groups = Object.keys(grouped);
      if (groups.length > 0 && !selectedGroup) {
        setSelectedGroup(groups[0]);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  }
  
  useEffect(() => {
    if (user) {
      // If the user is a student, fetch both department and class announcements (if available)
      if (user.role === "student") {
        if (user.departmentId) {
          getannouncement("department", user.departmentId);
        }
        if (user.classId) {
          getannouncement("class", user.classId);
          console.log(user.classId);
        }
      } else if (user.departmentId) {
        // For non-students, fetch only department announcements.
        getannouncement("department", user.departmentId);
      }
      getannouncement("college");
    }
  }, [user]);

  // Ensure the first group is selected if not already set
  useEffect(() => {
    const groups = Object.keys(announcementsData);
    if (groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0]);
    }
  }, [announcementsData, selectedGroup]);

  // Filtering announcements by category.
  // When the selectedCategory is "all", show all announcements.
  const filteredByCategory =
    selectedCategory === "all"
      ? announcementsData[selectedGroup] || []
      : (announcementsData[selectedGroup] || []).filter(
          (item) => item.category === selectedCategory
        );

  // Filtering further by search term.
  const filteredAnnouncements = filteredByCategory.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);
  const paginatedAnnouncements = filteredAnnouncements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAnnouncementClick = (announcement) => {
    console.log(announcement);
    setModalData(announcement);
    setModalType(announcement.announcementType);
  };

  // Derive the label for the selected category from the categories mapping.
  const selectedCategoryLabel =
    Object.keys(categories).find((key) => categories[key] === selectedCategory) ||
    selectedCategory;

  // Alternate colors for group icons.
  const groupColors = ["bg-vpppurple", "bg-vppgreen", "bg-vppviolet", "bg-vpporange"];

  return (
    <div>
      <VPPHeader text={"Announcements"} />

      <div className="flex flex-col md:flex-row justify-between gap-4">
        {/* Groups Section */}
        <div className="bg-white w-full md:w-[25%] h-fit rounded-2xl p-6 font-neueMedium">
          <h1 className="opacity-50 mb-2">Groups</h1>
          <div className="flex flex-col gap-1">
            {Object.keys(announcementsData).map((group, index) => (
              <div
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`flex gap-2 items-center p-3 rounded-lg cursor-pointer transition-all ${
                  selectedGroup === group
                    ? "bg-themegray opacity-100"
                    : "hover:bg-themegray opacity-50"
                }`}
              >
                <div className={`${groupColors[index % groupColors.length]} p-1 rounded-full text-white`}>
                  <UsersRound size={20} />
                </div>
                <h1 className="text-lg truncate w-full overflow-hidden whitespace-nowrap text-ellipsis">
                  {group}
                </h1>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white w-full md:w-[73%] rounded-2xl p-6">
          <div className="flex flex-col md:flex-row justify-between mb-4">
            {/* Search Input */}
            <div className="flex border-2 p-3 rounded-lg border-gray-400 opacity-50 gap-3 items-center px-4 w-full md:w-[64%] mb-4 md:mb-0">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search Announcements"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent outline-none text-lg"
              />
            </div>

            {/* Categories Dropdown */}
            <div className="relative w-full md:w-[35%] z-1">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex w-full border-2 p-3 px-4 rounded-lg border-gray-400 opacity-50 gap-3 items-center justify-between"
              >
                <h1 className="text-lg">{selectedCategoryLabel}</h1>
                <ChevronDown size={20} />
              </button>
              {isDropdownOpen && (
                <div className="absolute left-0 w-full bg-white shadow-md rounded-lg text-lg">
                  {Object.entries(categories).map(([label, value]) => (
                    <div
                      key={value}
                      onClick={() => {
                        setSelectedCategory(value);
                        setIsDropdownOpen(false);
                      }}
                      className="p-2 px-4 cursor-pointer hover:bg-themegray opacity-50"
                    >
                      {label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Announcements List */}
          <div className="flex flex-col gap-2 mt-2">
            {paginatedAnnouncements && paginatedAnnouncements.length > 0 ? (
              paginatedAnnouncements.map((announcement, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 rounded-xl hover:bg-themegray cursor-pointer justify-between w-full"
                  onClick={() => handleAnnouncementClick(announcement)}
                >
                  <div className="flex items-center w-[calc(100%-20px)]">
                    {(() => {
                      // Map category to icon and background color
                      const categoryIconMapping = {
                        update: {
                          icon: <Megaphone />,
                          bg: "bg-vpppurple",
                        },
                        holiday_notice: {
                          icon: <Bell />,
                          bg: "bg-vpporange",
                        },
                        exam_update: {
                          icon: <BookOpen />,
                          bg: "bg-vppviolet",
                        },
                        event: {
                          icon: <Calendar />,
                          bg: "bg-vppgreen",
                        },
                        placement_update: {
                          icon: <MoveUpRight />,
                          bg: "bg-themeblue",
                        },
                        
                      };

                      const mapping =
                        categoryIconMapping[announcement.category] || {
                          icon: <Megaphone />,
                          bg: "bg-vpppurple",
                        };

                      return (
                        <div
                          className={`p-3 rounded-full mr-2 text-white ${mapping.bg}`}
                        >
                          {mapping.icon}
                        </div>
                      );
                    })()}
                    <div className="w-full">
                      <h1 className="text-lg md:text-xl font-neueMedium truncate w-[calc(100%-60px)]">
                        {announcement.title}
                      </h1>
                      <div className="flex gap-4">
                        <h1 className="opacity-50">
                          Posted by{" "}
                          {announcement.fullname
                            ? announcement.fullname
                            : announcement.postedBy}
                        </h1>
                        <h1 className="opacity-50">{announcement.date}</h1>
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

      {/* Modals */}
      {modalType === "event" && modalData && (
        <EventModal data={modalData} onClose={() => setModalData(null)} />
      )}
      {modalType === "normal" && modalData && (
        <AnnouncementModal data={modalData} onClose={() => setModalData(null)} />
      )}
    </div>
  );
}

export default Announcements;
