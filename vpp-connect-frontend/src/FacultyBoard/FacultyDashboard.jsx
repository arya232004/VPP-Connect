import React, { useEffect, useState } from "react";
import FacultyCard from "./FacultyCard";
import { User, Bell, BookOpen, Users } from "lucide-react";
import FacultyHeader from "./FacultyHeader";
import AnnouncementPage from "./AnnouncementPage";
import ClassesPage from "./ClassesPage";
import StudentPage from "./StudentPage";
import SubmissionsPage from "./SubmissionsPage";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

function FacultyDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const getUserDept = user.departmentId;
  const [announcements, setAnnouncements] = useState([]);
  const [classesId, setClassesId] = useState([]);
  const totalAnnouncements = announcements.length;
  const [classesData, setClassesData] = useState([]);
  const [finalClasses, setFinalClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const totalClasses = finalClasses.length;
  const totalAssignments = assignments.length;
  const [userData, setUserData] = useState([]);
  const totalStudents = userData.length;
  const [submissionData, setSubmissionData] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null); // The currently selected assignment

  // Fetch announcements when the department ID changes
  useEffect(() => {
    fetch(
      `http://localhost:5000/api/announcements/level/department?targetId=${getUserDept}`
    )
      .then((response) => response.json())
      .then((data) => setAnnouncements(data))
      .catch((error) => console.error("Error fetching announcements:", error));
  }, [getUserDept]);

  // Fetch classesId
  useEffect(() => {
    fetch(`http://localhost:5000/api/departments/classes/${getUserDept}`)
      .then((response) => response.json())
      .then((data) => setClassesId(data.classes))
      .catch((error) => console.error("Error fetching classes ID:", error));
  }, [getUserDept]);

  // Fetch assignments posted by user
  useEffect(() => {
    fetch(`http://localhost:5000/api/announcements/postedby/${user.userId}`)
      .then((response) => response.json())
      .then((data) => setAssignments(data))
      .catch((error) => console.error("Error fetching assignments:", error));
  }, [user.userId]);

  // Fetch classes data
  useEffect(() => {
    fetch(`http://localhost:5000/api/departments/allclasses`)
      .then((response) => response.json())
      .then((data) => setClassesData(data.classes))
      .catch((error) => console.error("Error fetching classes:", error));
  }, []);

  // Fetch user data (students)
  useEffect(() => {
    fetch(`http://localhost:5000/api/users/students/${getUserDept}`)
      .then((response) => response.json())
      .then((data) => setUserData(data))
      .catch((error) => console.error("Error fetching users:", error));
  }, [getUserDept]);

  // Update finalClasses when classesId or classesData change
  useEffect(() => {
    if (classesId.length > 0 && classesData.length > 0) {
      const matchingClasses = classesData.filter((classData) =>
        classesId.includes(classData.classId)
      );
      setFinalClasses(matchingClasses);
    }
  }, [classesId, classesData]);

  // Create chart data with `totalStudents` and `presentToday`
  const chartData = classesData.map((classItem) => ({
    name: classItem.name,
    totalStudents: classItem.totalStudents || 0,
    presentToday: classItem.presentToday || 0,
  }));

  // Categorizing assignments into different types
  const deptLevelAnnouncements = assignments.filter(
    (assignment) => assignment.level != "department"
  );
  const otherAnnouncements = assignments.filter(
    (assignment) => assignment.level == "department"
  );
  const announcementData = [
    {
      name: "Total Announcements",
      value: totalAssignments,
    },
    {
      name: "Dept Level Announcements",
      value: deptLevelAnnouncements.length,
    },
    {
      name: "Other Announcements",
      value: otherAnnouncements.length,
    },
  ];

  const submissions = [
    {
      name: "Day 1",
      value: 10,
    },
    {
      name: "Day 2",
      value: 13,
    },
    {
      name: "Day 3",
      value: 20,
    },
  ];

  // Fetch announcements data for the selected assignment
  useEffect(() => {
    if (selectedAssignment) {
      fetch(
        `http://localhost:5000/api/announcements/assignment/${selectedAssignment}`
      )
        .then((response) => response.json())
        .then((data) => setAnnouncementData(data))
        .catch((error) =>
          console.error("Error fetching announcements:", error)
        );
    }
  }, [selectedAssignment]);

  // Fetch submission data for the selected assignment (last 3 days)
  useEffect(() => {
    if (selectedAssignment) {
      fetch(
        `http://localhost:5000/api/submissions/assignment/${selectedAssignment}/last3days`
      )
        .then((response) => response.json())
        .then((data) => setSubmissionData(data))
        .catch((error) =>
          console.error("Error fetching submission data:", error)
        );
    }
  }, [selectedAssignment]);

  // Handle assignment change
  const handleAssignmentChange = (event) => {
    setSelectedAssignment(event.target.value);
  };

  return (
    <div className="">
      <FacultyHeader text={"Hello, " + user?.fullname} />

      {/* Two Column Layout: Cards (Left) and Visualization (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* Left: Faculty Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <FacultyCard
            text="Students"
            count={totalStudents}
            icon={User}
            color="bg-vpppurple"
            name="Students"
          />
          <FacultyCard
            text="Dept-Lvl Announcements Made"
            count={totalAnnouncements}
            icon={Users}
            color="bg-vpporange"
            name="Dept Announcements"
          />
          <FacultyCard
            text="Classes Under"
            count={totalClasses}
            icon={BookOpen}
            color="bg-vppgreen"
            name="Classes"
          />
          <FacultyCard
            text="Total Announcements"
            count={totalAssignments}
            icon={Bell}
            color="bg-vppviolet"
            name="Announcements"
          />
        </div>
        {/* Chart Code */}
        {/* <div className="flex w-full gap-8">
          <div className="bg-white shadow-xl rounded-xl p-6 w-1/2">
            <h2 className="text-lg font-neueMedium opacity-50 mb-4">
              Announcements Distribution
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={announcementData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#5d46ac" name="Announcements" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white shadow-xl rounded-xl p-6 w-1/2">
            <div className="mb-4">
              <label
                htmlFor="assignment"
                className="block text-lg font-neueMedium opacity-50 mb-2"
              >
                Select Assignment
              </label>
              <select
                id="assignment"
                value={selectedAssignment}
                onChange={handleAssignmentChange}
                className="w-full p-2 border rounded-md"
              >
                {assignments.map((assignment) => (
                  <option key={assignment.id} value={assignment.id}>
                    {assignment.name}
                  </option>
                ))}
              </select>
            </div>
            <h2 className="text-lg font-neueMedium opacity-50 mb-4">
              Announcements Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={submissions}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="submissions" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div> */}
      </div>

      {/* Page Sections */}
      <SubmissionsPage />
      <AnnouncementPage
        announcements={announcements}
        total={totalAnnouncements}
      />
      <ClassesPage classes={finalClasses} total={totalClasses} />
      <StudentPage />
    </div>
  );
}

export default FacultyDashboard;
