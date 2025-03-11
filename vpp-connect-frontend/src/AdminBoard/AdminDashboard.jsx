import React from "react";
import AdminCard from "./AdminCard";
import { useState } from "react";
import AnnouncementPage from "./AnnouncementPage";
import GroupPage from "./GroupPage";
import DepartmentsPage from "./DepartmentsPage";
import ClassesPage from "./ClassesPage";
import MicroBlogs from "./MicroBlogs";
import UsersPage from "./UsersPage";
import { useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";

import { User, Bell, BookOpen, Users, Folder } from "lucide-react";

function AdminDashboard() {
  return (
    <div>
      <AdminHeader text={"Hello, Admin"} />
      {/* Container for the cards */}
      <div className="container mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Card 1: Users */}
          <AdminCard
            text="Users"
            count={1000}
            icon={User}
            color="bg-vpppurple"
            name="Users"
          />
          {/* Card 2: Announcements */}
          <AdminCard
            text="Announcements"
            count={40}
            icon={Bell}
            color="bg-vpporange"
            name="Announcements"
          />
          {/* Card 3: Classes */}
          <AdminCard
            text="Classes"
            count={45}
            icon={BookOpen}
            color="bg-vppgreen"
            name="Classes"
          />
          {/* Card 4: Groups */}
          <AdminCard
            text="Groups"
            count={20}
            icon={Users}
            color="bg-vppviolet"
            name="Groups"
          />
          {/* Card 5: Departments */}
          <AdminCard
            text="Departments"
            count={7}
            icon={Folder}
            color="bg-themeblue"
            name="Departments"
          />
        </div>
      </div>
      {/* Announcement Section */}
      <AnnouncementPage className="mt-6"/>

      {/* Department Section */}
      <DepartmentsPage />

      {/* Classes Section */}
      <ClassesPage />

      {/* MicroBlogs Section */}
      <MicroBlogs />

      {/* Users Section */}
      <UsersPage />

    </div>
  );
}

export default AdminDashboard;
