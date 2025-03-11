import {
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessageCircleMore,
  Notebook,
  SquarePen,
  UserRoundCog,
  UsersRound,
  UserRoundPen,
  MessageSquareShare,
  NotepadText,
  Group
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

const AdminSidebar = ({ collapsed, setCollapsed, mobile, handleResize }) => {

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function handleLogout() {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("token");
    window.location.href = "/admin-login";
  }
  return (
    <div
      className={`bg-[#2A2323] text-white h-screen z-10 ${
      (collapsed && !mobile) ? "w-[100px]" : "w-[20%]"
      } flex flex-col px-4 pt-10 fixed transition-all duration-300 ${(mobile && !collapsed) ? "w-[280px]" : (mobile && collapsed ? "w-[60px]": "")} openMenu`}
    >
      <div className={`w-full flex justify-between px-6 mb-8  ${(mobile && collapsed ? "pl-0": "")}`}>
        <button onClick={() => setCollapsed(!collapsed)}>
          <Menu className="cursor-pointer" />
        </button>
        {!collapsed && <LogOut className="cursor-pointer" onClick={handleLogout}/>}
      </div>

      <div
        className={`w-full flex flex-col gap-4 ${
          collapsed ? "items-center" : ""
        }`}
      >
        {[
          { to: "/admin/dashboard", icon: <LayoutDashboard />, label: "Dashboard" },
          { to: "/admin/classes", icon:<MessageSquareShare />, label: "Manage Classes" },
          { to: "/admin/microblogs", icon: <NotepadText />, label: "Manage Blogs" },
          { to: "/admin/announcements", icon: <SquarePen />, label: "Manage Announcements" },
          { to: "/admin/users", icon: <UserRoundCog />, label: "Manage Users" },
          { to: "/admin/departments", icon: <Group />, label: "Manage Department" },
        ].map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center w-full h-[45px] gap-3 py-2 text-xl rounded-xl ${
                collapsed ? "justify-center" : "pl-6"
              } ${isActive ? "bg-[#5D46AC] opacity-100" : "opacity-70"}`
            }
          >
            {icon}
            {!collapsed && <h1>{label}</h1>}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default AdminSidebar;
