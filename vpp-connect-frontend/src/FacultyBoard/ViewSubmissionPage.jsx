import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import FacultyHeader from "./FacultyHeader";
// import { CSVLink } from 'react-csv';

const ViewSubmissionsPage = () => {
	const { id } = useParams(); // Assignment ID from URL
	const [assignment, setAssignment] = useState(null);
	const [submissions, setSubmissions] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [category, setCategory] = useState("All");
	const user = JSON.parse(localStorage.getItem("user"));

	const [gradingMarks, setGradingMarks] = useState({});

	const handleMarksChange = (studentId, value) => {
		setGradingMarks((prev) => ({ ...prev, [studentId]: value }));
	};

	const handleGradeSubmission = async (event, studentId) => {
		event.preventDefault();
		const marks = gradingMarks[studentId];

		if (!marks || marks < 0) {
			console.error("Invalid marks entered.");
			return;
		}

		try {
			const response = await fetch(
				`http://localhost:5000/api/tasks/${id}/submissions/${studentId}`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ marks, status: "graded" }),
				}
			);

			if (!response.ok) throw new Error("Failed to grade submission");

			const updatedSubmission = await response.json();
			setSubmissions((prev) =>
				prev.map((submission) =>
					submission.studentId === studentId ? updatedSubmission : submission
				)
			);
		} catch (error) {
			console.error("Error grading submission:", error);
		}
	};


	useEffect(() => {
		// Fetch assignment data from the API
		const fetchAssignmentData = async () => {
			try {
				const response = await fetch(`http://localhost:5000/api/tasks/${id}`);
				const data = await response.json();
				setAssignment(data);
				setSubmissions(data.submissions);
			} catch (error) {
				console.error("Error fetching assignment data:", error);
			}
		};

		fetchAssignmentData();
	}, [id]);


	const rejectAssignmentData = async () => {
		try {
			const studentId = submissions.find(submission => submission.status === "submitted")?.studentId;
			if (!studentId) {
				console.error("No submitted assignment found to reject.");
				return;
			}
			const response = await fetch(`http://localhost:5000/api/tasks/reject/${id}/submissions/${studentId}`, {
				method: 'POST'
			});
			const data = await response.json();

		} catch (error) {
			console.error("Error fetching assignment data:", error);
		}
	};


	// Filter submissions based on search term and category
	const filteredSubmissions = submissions.filter(
		(submission) =>
			(category === "All" || submission.status === category) &&
			submission.studentName.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const downloadCSV = () => {
		const csvHeaders = ["Student ID", "Student Name", "Email", "Marks", "Status", "Submission URL"];

		const rows = submissions.map(submission => [
			submission.studentId,
			submission.studentName,
			submission.studentEmail,
			submission.marks ?? "N/A",
			submission.status,
			submission.submissionFileUrl ?? "N/A"
		]);

		const csvContent = [
			csvHeaders.join(","),
			...rows.map(row => row.map(item => `"${item}"`).join(","))
		].join("\n");

		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);

		link.href = url;
		link.setAttribute("download", "submissions.csv");
		document.body.appendChild(link);
		link.click();
		URL.revokeObjectURL(url);
	};


	// Handle grading of a submission
	// const handleGradeSubmission = async (event, studentId, marks) => {
	// 	event.preventDefault(); // Prevent default form submission

	// 	if (!marks || marks < 0) {
	// 		console.error("Invalid marks entered.");
	// 		return;
	// 	}

	// 	try {
	// 		const response = await fetch(`http://localhost:5000/api/tasks/${id}/submissions/${studentId}`, {
	// 			method: "PUT",
	// 			headers: {
	// 				"Content-Type": "application/json",
	// 			},
	// 			body: JSON.stringify({ marks, status: "graded" }),
	// 		});

	// 		if (!response.ok) {
	// 			throw new Error("Failed to grade submission");
	// 		}

	// 		const updatedSubmission = await response.json();
	// 		setSubmissions((prevSubmissions) =>
	// 			prevSubmissions.map((submission) =>
	// 				submission.studentId === studentId ? updatedSubmission : submission
	// 			)
	// 		);
	// 	} catch (error) {
	// 		console.error("Error grading submission:", error);
	// 	}
	// };

	return (
		<div className="p-6">
			<FacultyHeader user={user} />
			<div className="flex flex-col md:flex-row gap-6 mt-8 w-full">
				{/* Left Section: Assignment Details */}
				<div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 w-full md:w-2/3">
					<h2 className="text-2xl font-semibold mb-4 text-gray-800">Assignment Details</h2>
					<hr className="border-gray-300 mb-4" />
					{assignment ? (
						<div className="space-y-4">
							<div className="flex items-center space-x-6 text-gray-700 mb-4">
								<strong className="capitalize text-gray-900 text-lg w-1/3">Assignment ID:</strong>
								<code className="code md:text-xl w-2/3">{assignment.taskId}</code>
							</div>
							<div className="flex items-center space-x-6 text-gray-700 mb-4">
								<strong className="capitalize text-gray-900 text-lg w-1/3">Title:</strong>
								<span className="text-base md:text-xl w-2/3">{assignment.title}</span>
							</div>
							<div className="flex items-center space-x-6 text-gray-700 mb-4">
								<strong className="capitalize text-gray-900 text-lg w-1/3">Description:</strong>
								<span className="text-base md:text-xl w-2/3">{assignment.description}</span>
							</div>
							<div className="flex items-center space-x-6 text-gray-700 mb-4">
								<strong className="capitalize text-gray-900 text-lg w-1/3">Subject:</strong>
								<span className="text-base md:text-xl w-2/3">{assignment.subject}</span>
							</div>
							<div className="flex items-center space-x-6 text-gray-700 mb-4">
								<strong className="capitalize text-gray-900 text-lg w-1/3">Posted to:</strong>
								<span className="text-base md:text-xl w-2/3">
									<strong>
										{assignment.classId.length >= 3
											? `${assignment.classId.slice(0, 2)} - ${assignment.classId[2]}`
											: assignment.classId}
									</strong>
								</span>
							</div>
							<div className="flex items-center space-x-6 text-gray-700 mb-4">
								<strong className="capitalize text-gray-900 text-lg w-1/3">Priority:</strong>
								<span className="capitalize text-base md:text-xl w-2/3">{assignment.priority}</span>
							</div>
							<div className="flex items-center space-x-6 text-gray-700 mb-4">
								<strong className="capitalize text-gray-900 text-lg w-1/3">Total Marks:</strong>
								<span className="text-base md:text-xl w-2/3">{assignment.total}</span>
							</div>

							{/* Show File with thumbnail (if available) */}
							{assignment.fileUrl && (
								<div className="flex items-center space-x-6 text-gray-700 mb-4">
									<strong className="capitalize text-gray-900 text-lg w-1/3">File:</strong>
									<a
										href={assignment.fileUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-500 hover:underline cursor-pointer"
									>
										{assignment.thumbnailUrl ? (
											<img src={`http://localhost:5000/api/users/profile?url=${assignment.thumbnailUrl}`} alt="file" className="w-50 h-50 object-cover rounded-lg" />
										) : (
											"View Assignment File"
										)}
									</a>
								</div>
							)}

						</div>
					) : (
						<p className="text-gray-500">No assignment details available.</p>
					)}
				</div>

				{/* Right Section: Student Submissions */}
				<div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 w-full">
					<h2 className="text-2xl font-semibold mb-4 text-gray-800">Student Submissions</h2>
					<div className="flex flex-col md:flex-row gap-4 mb-6">
						<input
							type="text"
							placeholder="Search submissions..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<select
							value={category}
							onChange={(e) => setCategory(e.target.value)}
							className="w-full md:w-40 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="All">All</option>
							<option value="pending">Pending</option>
							<option value="submitted">Submitted</option>
						</select>
					</div>

					{/* Submissions List */}
					<div className="space-y-4 overflow-y-auto border-t border-gray-200 pt-4">
						{filteredSubmissions.length > 0 ? (
							filteredSubmissions.map((submission) => (
								<div
									key={submission.studentId}
									className="p-4 border rounded-lg bg-white shadow-sm cursor-pointer hover:bg-blue-50 transition duration-300"
								>
									<h3 className="font-semibold text-lg text-gray-900">{`Student: ${submission.studentName}`}</h3>
									<p className="text-sm text-gray-600">{`Status: ${submission.status}`}</p>
									{submission.status === "submitted" && (
										<p className="text-sm text-gray-600">
											{`Submitted on: ${submission.date?._seconds
												? new Date(submission.date._seconds * 1000).toDateString()
												: new Date(submission.date).toDateString()}`}
										</p>)}

									{/* Show the submission file */}
									{submission.submissionFileUrl && (
										<div className="mt-2">
											<a
												href={submission.submissionFileUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-500 hover:underline"
											>
												View Submitted File
											</a>
										</div>
									)}

									{/* Grading */}
									{submission.status === "submitted" && (
										<div className="flex gap-2">
											<form className="flex gap-3 mt-2" onSubmit={(e) => handleGradeSubmission(e, submission.studentId, e.target.marks.value)}>
												<input
													type="number"
													name="marks"
													placeholder="Enter marks"
													value={gradingMarks[submission.studentId] || ""}
													onChange={(e) => handleMarksChange(submission.studentId, e.target.value)}
													min={0}
													max={assignment.total}
													className="w-30 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
													required
												/>

												<button
													type="submit"
													className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
												>
													Grade
												</button>

											</form>
											<button
												onClick={rejectAssignmentData}
												className="bg-red-500 text-white p-1 rounded-lg hover:bg-red-600"
											>
												Reject
											</button>
										</div>
									)}

									{/* Show the marks if graded */}
									{submission.status === "graded" && (
										<div className="mt-4">
											<p className="text-lg text-gray-800">{`Marks: ${submission.marks}`}</p>
										</div>
									)}
								</div>
							))
						) : (
							<p className="text-gray-500 text-center">No submissions found.</p>
						)}
					</div>
					<button
						className="bg-blue-500 my-2 mx-auto text-white py-2 px-4 rounded-lg"
						onClick={downloadCSV}
					>
						Download CSV
					</button>
				</div>


			</div>
		</div>
	);
};

export default ViewSubmissionsPage;
