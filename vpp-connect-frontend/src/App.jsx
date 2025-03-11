import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Dashboard from "./StudentBoard/DashboardModule/Dashboard";
import Announcements from "./StudentBoard/AnnouncementModule/Announcements";
import Submissions from "./StudentBoard/Submissions";
import Microblogging from "./StudentBoard/Microblogging";
import Chat from "./pages/Chat";
import LatestCourseUpdate from "./StudentBoard/LatestCourseUpdate";
import ZLibrary from "./StudentBoard/ZLibrary";
import LoginPage from "./LoginModule/LoginPage"; // Student Login Page
import AdminLoginPage from "./AdminBoard/AdminLogin"; // Admin Login Page
import AdminDashboard from "./AdminBoard/AdminDashboard";
import AdminSidebar from "./AdminBoard/AdminSidebar";
import ManageClasses from "./AdminBoard/ManageClasses";
import AnnouncementEditPage from "./AdminBoard/AnnouncementEditPage";
import AnnouncementPage from "./AdminBoard/AnnouncementPage";
import UsersPage from "./AdminBoard/UsersPage";
import GroupPage from "./AdminBoard/GroupPage";
import MicroBlogs from "./AdminBoard/MicroBlogs";
import ClassesPage from "./AdminBoard/ClassesPage";
import GroupEditPage from "./AdminBoard/GroupEditPage";
import DepartmentEditPage from "./AdminBoard/DepartmentEditPage";
import DepartmentsPage from "./AdminBoard/DepartmentsPage";
import ClassEditPage from "./AdminBoard/ClassEditPage";
import MicroblogEditPage from "./AdminBoard/MicroblogEditPage";
import UserEditPage from "./AdminBoard/UserEditPage";
// FACULTY
import FacultySidebar from "./FacultyBoard/FacultySidebar";
import FacultyDashboard from "./FacultyBoard/FacultyDashboard";
import FacultyClassesPage from "./FacultyBoard/ClassesPage";
import FacultyDepartmentsPage from "./FacultyBoard/DepartmentsPage";
import FacultyGroupPage from "./FacultyBoard/GroupPage";
import FacultyStudentsPage from "./FacultyBoard/StudentPage";
import FacultyAnnouncementPage from "./FacultyBoard/AnnouncementPage";
import FacultyAnnouncementEditPage from "./FacultyBoard/AnnouncementEditPage";
import FacultyGroupEditPage from "./FacultyBoard/GroupEditPage";
import FacultyDepartmentEditPage from "./FacultyBoard/DepartmentEditPage";
import FacultyClassEditPage from "./FacultyBoard/ClassEditPage";
import FacultyMicroblogEditPage from "./FacultyBoard/MicroblogEditPage";
import FacultyStudentEditPage from "./FacultyBoard/StudentEditPage";
import FacultySubmissionPage from "./FacultyBoard/SubmissionsPage";
import FacultyViewSubmissionPage from "./FacultyBoard/ViewSubmissionPage"
import FacultyAddAssignment from "./FacultyBoard/AddAssignmentPage"

function App() {
  const [collapsed, setCollapsed] = useState(true);
  const [mobile, setMobile] = useState(false);

  const handleResize = () => {
    if (window.innerWidth <= 768) {
      setMobile(true);
      console.log("mobile");
    } else {
      setMobile(false);
    }
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      <Router>
        {/* Student Routes */}
        {localStorage.getItem("token") && !localStorage.getItem("isAdmin") ? (
          <div className="flex">
            {localStorage.getItem("token") === "student" ? (
              <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                mobile={mobile}
                handleResize={handleResize}
              />
            ) : (
              <FacultySidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                mobile={mobile}
                handleResize={handleResize}
              />
            )}
            <div
              className={`bg-[#F2F5F8] h-screen overflow-y-auto px-8 py-6 transition-all duration-300 ${collapsed ? (mobile) ? "ml-[60px] w-[calc(100%-60px)]" : "ml-[100px] w-[calc(100%-100px)]" : "ml-[20%] w-[80%]"} `}
            >
              <Routes>
                {
                  localStorage.getItem("token") === "student" ? (
                    <>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/announcements" element={<Announcements />} />
                      <Route path="/submissions" element={<Submissions />} />
                      <Route path="/microblogging" element={<Microblogging />} />
                      <Route path="/chat" element={<Chat />} />
                      <Route path="/latestcourseupdate" element={<LatestCourseUpdate />} />
                      <Route path="/zlibrary" element={<ZLibrary />} />
                    </>
                  ) : (
                    <>
                    <Route path="/" element={<LoginPage />} />
                      <Route
                        path="/faculty/dashboard"
                        element={<FacultyDashboard />}
                      />
                      <Route
                        path="/faculty/classes"
                        element={<FacultyClassesPage />}
                      />
                      <Route
                        path="/faculty/departments"
                        element={<FacultyDepartmentsPage />}
                      />
                      <Route path="/faculty/groups" element={<FacultyGroupPage />} />
                      <Route
                        path="/faculty/users"
                        element={<FacultyStudentsPage />}
                      />
                      <Route
                        path="/faculty/announcements/"
                        element={<FacultyAnnouncementPage />}
                      />
                      <Route
                        path="/faculty/edit-announcement/"
                        element={<FacultyAnnouncementEditPage />}
                      />
                      <Route
                        path="/faculty/edit-announcement/:id"
                        element={<FacultyAnnouncementEditPage />}
                      />
                      <Route
                        path="/faculty/edit-group/"
                        element={<FacultyGroupEditPage />}
                      />
                      <Route
                        path="/faculty/edit-group/:id"
                        element={<FacultyGroupEditPage />}
                      />
                      <Route
                        path="/faculty/edit-department/"
                        element={<FacultyDepartmentEditPage />}
                      />
                      <Route
                        path="/faculty/edit-department/:id"
                        element={<FacultyDepartmentEditPage />}
                      />
                      <Route
                        path="/faculty/edit-classes/"
                        element={<FacultyClassEditPage />}
                      />
                      <Route
                        path="/faculty/edit-classes/:id"
                        element={<FacultyClassEditPage />}
                      />
                      <Route
                        path="/faculty/edit-microblogs/"
                        element={<FacultyMicroblogEditPage />}
                      />
                      <Route
                        path="/faculty/edit-microblogs/:id"
                        element={<FacultyMicroblogEditPage />}
                      />
                      <Route
                        path="/faculty/edit-users/"
                        element={<FacultySubmissionPage />}
                      />
                      <Route
                        path="/faculty/viewall-submissions/"
                        element={<FacultySubmissionPage />}
                      />
                      <Route
                        path="/faculty/view-submissions/"
                        element={<FacultySubmissionPage />}
                      />
                      <Route
                        path="/faculty/view-submissions/:id"
                        element={<FacultyViewSubmissionPage />}
                      />
                      <Route
                        path="/faculty/add-assignment"
                        element={<FacultyAddAssignment />}
                      />
                    </>
                  )
                }
              </Routes>
            </div>
          </div>
        ) : localStorage.getItem("isAdmin") ? (
          // Admin Routes: Show Admin Sidebar and Admin Content
          <div className="flex">
            <AdminSidebar
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              mobile={mobile}
              handleResize={handleResize}
            />
            <div
              className={`bg-[#F2F5F8] h-screen overflow-y-auto px-8 py-6 transition-all duration-300 ${collapsed
                ? mobile
                  ? "ml-[40px] w-[calc(100%-40px)]"
                  : "ml-[100px] w-[calc(100%-100px)]"
                : "ml-[20%] w-[80%]"
                } `}
            >
              <Routes>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin" element={<ManageClasses />} />
                <Route path="/admin/classes" element={<ClassesPage />} />
                <Route
                  path="/admin/departments"
                  element={<DepartmentsPage />}
                />
                <Route path="/admin/groups" element={<GroupPage />} />
                <Route path="/admin/microblogs" element={<MicroBlogs />} />
                <Route path="/admin/users" element={<UsersPage />} />
                <Route
                  path="/admin/announcements/"
                  element={<AnnouncementPage />}
                />
                <Route
                  path="/admin/edit-announcement/"
                  element={<AnnouncementEditPage />}
                />
                <Route
                  path="/admin/edit-announcement/:id"
                  element={<AnnouncementEditPage />}
                />
                <Route path="/admin/edit-group/" element={<GroupEditPage />} />
                <Route
                  path="/admin/edit-group/:id"
                  element={<GroupEditPage />}
                />
                <Route
                  path="/admin/edit-department/"
                  element={<DepartmentEditPage />}
                />
                <Route
                  path="/admin/edit-department/:id"
                  element={<DepartmentEditPage />}
                />
                <Route
                  path="/admin/edit-classes/"
                  element={<ClassEditPage />}
                />
                <Route
                  path="/admin/edit-classes/:id"
                  element={<ClassEditPage />}
                />
                <Route
                  path="/admin/edit-microblogs/"
                  element={<MicroblogEditPage />}
                />
                <Route
                  path="/admin/edit-microblogs/:id"
                  element={<MicroblogEditPage />}
                />
                <Route path="/admin/edit-users/" element={<UserEditPage />} />
                <Route
                  path="/admin/edit-users/:id"
                  element={<UserEditPage />}
                />
              </Routes>
            </div>
          </div>
        ) : (
          // Show login pages if no token
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin-login" element={<AdminLoginPage />} />
          </Routes>
        )}
      </Router>
    </div>
  );
}

export default App;
