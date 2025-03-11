import React, { useState, useEffect } from "react";
import {
  Bell,
  Ellipsis,
  EllipsisIcon,
  Link,
  Link2,
  MoveUpRight,
  Plus,
  StickyNote,
} from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import SubmissionList from "./SubmissionList";
import VPPHeader from "../../pages/VPPHeader";
import EventsList from "./EventsList";
import StickyNotes from "./StickyNotes";
import { useAuth } from "../../AuthContext";
import axios from "axios";
// import { transformAnnouncement } from "../../utils/transformAnnouncement";

// Define colors for alternating tabs
const colors = ["bg-vpppurple", "bg-vpporange", "bg-vppviolet", "bg-vppgreen"];

const pastelColors = [
  "bg-vpppurple",
  "bg-vppviolet",
  "bg-vppgreen",
  "bg-vpporange",
];
const modules = {
  toolbar: {
    container: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link"],
    ],
  },
};

// Sample submission data
const submissions = [
  {
    name: "Amit Sharma",
    assignment: "Final Research Paper",
    dueDate: "March 5, 2025 | 5:00 PM",
    status: "Pending",
    profilePic: "src/assets/images/pfp2.jpeg",
    docs: ["src/assets/images/pdfimage.png"],
  },
  {
    name: "Neha Kapoor",
    assignment: "Project Report - AI",
    dueDate: "March 15, 2025 | 11:59 PM",
    status: "Pending",
    profilePic: "src/assets/images/pfp3.jpeg",
    docs: ["src/assets/images/docsimage.png"],
  },
  {
    name: "Rahul Verma",
    assignment: "Machine Learning Midterm",
    dueDate: "March 6, 2025 | 10:00 AM",
    status: "Pending",
    profilePic: "src/assets/images/pfp4.jpeg",
    docs: ["src/assets/images/docsimage.png"],
  },
  {
    name: "Megha Singh",
    assignment: "Database Systems Assignment",
    dueDate: "March 10, 2025 | 8:00 PM",
    status: "Pending",
    profilePic: "src/assets/images/pfp5.jpeg",
    docs: ["src/assets/images/pdfimage.png"],
  },
  {
    name: "Aditya Kumar",
    assignment: "Cyber Security Paper",
    dueDate: "March 9, 2025 | 6:30 PM",
    status: "Pending",
    profilePic: "src/assets/images/pfp6.jpeg",
    docs: ["src/assets/images/docsimage.png"],
  },
  {
    name: "Priya Deshmukh",
    assignment: "Data Science Report",
    dueDate: "March 12, 2025 | 4:00 PM",
    status: "Pending",
    profilePic: "src/assets/images/pfp7.jpeg",
    docs: ["src/assets/images/pdfimage.png"],
  },
  {
    name: "Rohan Mehta",
    assignment: "Web Dev Assignment",
    dueDate: "March 8, 2025 | 2:00 PM",
    status: "Pending",
    profilePic: "src/assets/images/pfp8.jpeg",
    docs: ["src/assets/images/docsimage.png"],
  },
  {
    name: "Simran Kapoor",
    assignment: "Software Engineering Case Study",
    dueDate: "March 14, 2025 | 9:00 PM",
    status: "Pending",
    profilePic: "src/assets/images/pfp9.jpeg",
    docs: ["src/assets/images/pdfimage.png"],
  },
];
const events = [
  {
    name: "Amit Sharma",
    assignment: "Design Thinking workshop",
    date: "March 5, 2025 | 5:00 PM",
    venue: "Room 304 / Zoom Link",
    profilePic: "src/assets/images/pfp1.jpeg",
  },
  {
    name: "Kunal Joshi",
    assignment: "No-Code App Development",
    date: "March 14, 2025 | 4:00 PM",
    venue: "Tech Hub / Zoom",
    profilePic: "src/assets/images/pfp1.jpeg",
  },
  {
    name: "Neha Agarwal",
    assignment: "Blockchain & Web3 Workshop",
    date: "March 16, 2025 | 11:00 AM",
    venue: "Room 208 / Discord",
    profilePic: "src/assets/images/pfp1.jpeg",
  },
  {
    name: "Arjun Singh",
    assignment: "Cybersecurity Awareness Webinar",
    date: "March 18, 2025 | 5:30 PM",
    venue: "Online / Webex",
    profilePic: "src/assets/images/pfp1.jpeg",
  },
  {
    name: "Meera Nair",
    assignment: "Public Speaking & Leadership",
    date: "March 20, 2025 | 6:00 PM",
    venue: "Seminar Hall / YouTube Live",
    profilePic: "src/assets/images/pfp1.jpeg",
  },
];
const Dashboard = () => {
  const { user } = useAuth();
  console.log(user);
  const [announcementsData, setAnnouncementsData] = useState({});
  const [submissionsData, setSubmissionsData] = useState([]);
  const [pendingCounts, setPendingCounts] = useState({});
  const [submittedCounts, setSubmittedCounts] = useState({});

  useEffect(() => {
    console.log("Dashboard user updated:", user);
  }, [user]);

  const [stickyNote, setStickyNote] = useState("");

  // Load saved note from local storage
  useEffect(() => {
    const savedNote = localStorage.getItem("stickyNote");
    if (savedNote) {
      setStickyNote(savedNote);
    }
  }, []);

  // Save note to local storage whenever it changes

  const handleNoteChange = (value) => {
    setStickyNote(value);
    localStorage.setItem("stickyNote", value);
  };

  const transformAnnouncement = (item) => {
    // Format the timestamp to a readable date.
    const date = new Date(item.timestamp._seconds * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    // Compute the group key: prefer departmentName, else fallback to name + divisionName.
    const groupKey = item.targetInfo.departmentName
      ? item.targetInfo.departmentName
      : `${item.targetInfo.name} ${item.targetInfo.divisionName}`;

    return {
      title: item.title, // use API title
      date: date,
      category: item.category,
      announcementType: item.announcementType || "normal", // default if not provided
      department: groupKey,
      content: item.content, // use API content
      postedBy: item.postedBy, // use API postedBy
      targetInfo: item.targetInfo, // use API targetInfo
      profilePic: item.postedByInfo?.profilePic || null, // use API profilePic
      fullname: item.postedByInfo?.fullname || null, // use API fullname
	  fileId: item.fileId || null, // use API fileId
	  fileUrl: item.fileId ? item.fileUrl : null, // use API fileUrl
	  thumbnailUrl: item.fileId ? item.thumbnailUrl : null, // use API thumbnailUrl
    };
  };

  async function getannouncement(level, id) {
    console.log(id, level);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/announcements/level/${level}?targetId=${id}`
      );
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
      // const groups = Object.keys(grouped);
      // if (groups.length > 0 && !selectedGroup) {
      //   setSelectedGroup(groups[0]);
      // }
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
    }
  }, [user]);

  useEffect(() => {
    if (!user) return; // Wait for the user to be available.
    const fetchSubmissions = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/tasks/student/${user.userId}`);
        const data = await response.json();
        console.log(data.tasks);
        if (data.tasks) {
          setSubmissionsData(data.tasks);
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);
      }
    };
    fetchSubmissions();
    const pending = {};
    const submitted = {};
    console.log(submissionsData);
    submissionsData.forEach((submission) => {
      if (submission.status === "Submitted") {
        submitted[submission.category] =
          (submitted[submission.category] || 0) + 1;
      } else {
        pending[submission.category] = (pending[submission.category] || 0) + 1;
      }
    });

    setPendingCounts(pending);
    setSubmittedCounts(submitted);
  }, [user]);








  return (
    <div className="w-full overflow-hidden">
      <VPPHeader text={"Hello, " + user?.fullname} user={user}/>

      <div className="flex flex-col md:flex-row justify-between gap-6 p-2">
        <div className="w-full md:w-[65%]">
          {/* Submissions Section */}
          <SubmissionList
            submissions={submissions}
            submissionsData = {submissionsData}
            pastelColors={pastelColors}
          />

          {/* Events */}
          <EventsList
          announcementsData = {announcementsData}
            events={events}
            colors={colors}
            pastelColors={pastelColors}
          />
        </div>

        <div className="w-full">
          {/* Sticky Notes Section */}
          <StickyNotes
            modules={modules}
            stickyNote={stickyNote}
            setStickyNote={setStickyNote}
            handleNoteChange={handleNoteChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
