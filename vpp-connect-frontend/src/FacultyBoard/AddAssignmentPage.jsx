import React, { useState, useEffect } from "react";
import FacultyHeader from "./FacultyHeader";
import Swal from "sweetalert2"; // Import SweetAlert2
import axios from "axios"; // Import axios for HTTP requests

function AddAssignmentPage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [assignment, setAssignment] = useState({
    classId: "",
    assignedBy: user.userId || "",
    title: "",
    description: "",
    type: "",
    status: "active", // Default value for status
    file: null,
    subject: "",
    priority: "medium", // Default value for priority
    deadline: "",
    total: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAssignment({
      ...assignment,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setAssignment({
      ...assignment,
      file: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Show confirmation dialog with SweetAlert
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to save this assignment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, save it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Create a FormData object to send the form data and file
          const formData = new FormData();
          formData.append("classId", assignment.classId);
          formData.append("assignedBy", assignment.assignedBy);
          formData.append("title", assignment.title);
          formData.append("description", assignment.description);
          formData.append("type", assignment.type);
          formData.append("status", assignment.status);
          formData.append("subject", assignment.subject);
          formData.append("priority", assignment.priority);
          formData.append("deadline", assignment.deadline);
          formData.append("total", assignment.total);
          if (assignment.file) {
            formData.append("file", assignment.file);
          }

          // Make the POST request to your API endpoint
          const response = await axios.post(
            "http://localhost:5000/api/tasks/create",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          if (response.status === 201) {
            // If task is created successfully, show a success message
            Swal.fire(
              "Success!",
              "The assignment was created successfully.",
              "success"
            );
            window.location.href="/faculty/dashboard"
          } else {
            // If there was an error, show an error message
            Swal.fire(
              "Error!",
              "There was an error creating the assignment.",
              "error"
            );
          }
        } catch (error) {
          console.error("Error submitting assignment:", error);
          Swal.fire(
            "Error!",
            "There was an error creating the assignment.",
            "error"
          );
        }

      } else {
        // If canceled, log to console
        console.log("Assignment save canceled");
      }
    });
  };

  const [classes, setClasses] = useState([]);

  useEffect(() => {
    if (user.departmentId) {
      const fetchClasses = async () => {
        const response = await fetch(
          `http://localhost:5000/api/departments/classes/${user.departmentId}`
        );
        const data = await response.json();
        setClasses(data.classes);
      };
      fetchClasses();
    }
  }, [user.departmentId]);

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <FacultyHeader user={user} />
      <h1 className="text-3xl font-semibold text-center mb-6">
        Add Assignment
      </h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 p-8 rounded-xl shadow-lg max-w-4xl bg-white mx-auto"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Class ID (Dropdown for Class Names) */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Class Name
            </label>
            <select
              name="classId"
              value={assignment.classId}
              onChange={handleInputChange}
              className="p-3 border rounded-md w-full"
              required
            >
              <option value="">Select Class</option>
              {classes.map((classItem) => (
                <option key={classItem} value={classItem}>
                  {classItem.length >= 3
                    ? `${classItem.slice(0, 2)} - ${classItem[2]}`
                    : classItem}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={assignment.title}
              onChange={handleInputChange}
              className="p-3 border rounded-md w-full"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={assignment.description}
              onChange={handleInputChange}
              className="p-3 border rounded-md w-full h-32"
            />
          </div>

          {/* Type (Dropdown for Assignment Types) */}
          <div>
            <label className="text-sm font-medium text-gray-700">Type</label>
            <select
              name="type"
              value={assignment.type}
              onChange={handleInputChange}
              className="p-3 border rounded-md w-full"
              required
            >
              <option value="">Select Type</option>
              <option value="assignment">Assignment</option>
              <option value="class_assignment">Class Assignment</option>
              <option value="homework">Homework</option>
              <option value="quiz">Quiz</option>
              <option value="project">Project</option>
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              File Upload
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="p-3 border rounded-md w-full"
            />
            {assignment.file && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">{assignment.file.name}</p>
              </div>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="text-sm font-medium text-gray-700">Subject</label>
            <input
              type="text"
              name="subject"
              value={assignment.subject}
              onChange={handleInputChange}
              className="p-3 border rounded-md w-full"
              required
            />
          </div>

          {/* Priority (Dropdown for Priority Levels) */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              name="priority"
              value={assignment.priority}
              onChange={handleInputChange}
              className="p-3 border rounded-md w-full"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Deadline */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Deadline
            </label>
            <input
              type="datetime-local"
              name="deadline"
              value={assignment.deadline}
              onChange={handleInputChange}
              className="p-3 border rounded-md w-full"
              required
            />
          </div>

          {/* Total Marks */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Total Marks
            </label>
            <input
              type="number"
              name="total"
              value={assignment.total}
              onChange={handleInputChange}
              className="p-3 border rounded-md w-full"
              required
            />
          </div>
        </div>

        <div className="flex gap-4 mt-6 justify-center">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-3 border rounded-md hover:bg-gray-100"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-[#5D46AC] text-white rounded-md hover:bg-[#4c3b91]"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddAssignmentPage;
