import React, { useState } from "react";
import axios from "axios";
import {
	Bell,
	DiamondPlus,
	History,
	CheckCircle,
	LogIn,
	MapPin,
	Plus,
	SendHorizontal,
	X,
} from "lucide-react";

const SubmissionModal = ({ submission, onClose }) => {
	const [status, setStatus] = useState(submission.submission.status || "Pending");
	const [isSubmitted, setIsSubmitted] = useState(submission.submission.status === "submitted");
	const [uploadedFile, setUploadedFile] = useState(null);
	const [selectedFile, setSelectedFile] = useState(null);
	const [loading, setLoading] = useState(false);

	const handleFileChange = (event) => {
		setSelectedFile(event.target.files[0]);
	};

	const priorityColors = {
		high: "bg-vpporange",
		medium: "bg-vppgreen",
		low: "bg-vpppurple",
	};

	const handleSubmit = async () => {
		if (!selectedFile) return alert("Please select a file to submit.");
		setLoading(true);
		const formData = new FormData();
		formData.append("file", selectedFile);
		formData.append("studentId", submission.submission.studentId);
		formData.append("submissionType", selectedFile.type);

		try {
			const response = await axios.post(
				`${import.meta.env.VITE_SERVER_URL}/api/tasks/${submission.taskId}/submissions/upload`,
				formData,
				{ headers: { "Content-Type": "multipart/form-data" } }
			);
			setStatus("Submitted");
			setIsSubmitted(true);
			setUploadedFile({
				name: selectedFile.name,
				icon: "src/assets/images/docsimage.png",
			});
		} catch (error) {
			console.error("Error uploading submission:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
			<div className="bg-themegray overflow-hidden rounded-2xl w-4/6 md:w-3/6 lg:w-[500px] h-[80vh] shadow-lg flex flex-col">
				{/* Header */}
				<div className={`p-6 text-white ${priorityColors[submission.priority] || "bg-gray-300"}`}>
					<div className="flex justify-between items-center">
						<div className="flex gap-2">
							<div className="w-[50px] h-[50px] rounded-full overflow-hidden">
								<img src={`${import.meta.env.VITE_SERVER_URL}/api/users/profile?url=${submission.facultyProfilePic}`} alt={submission.facultyName} />
							</div>
							<div>
								<h1 className="text-lg">Posted by: {submission.facultyName}</h1>
								<h1 className="text-sm">
									{
										submission.postedat &&
										new Date(submission.postedat._seconds * 1000).toLocaleString()}
								</h1>
							</div>
						</div>
						{/* Close Button */}
						<button
							onClick={onClose}
							className="w-[40px] h-[40px] flex items-center justify-center  rounded-full cursor-pointer"
						>
							<X size={24} className="text-white" />
						</button>
					</div>

					<div className="mt-4 mb-4">
						<h1 className="text-3xl font-neueMedium">
							{submission.title}
						</h1>
						<h1>Due: {new Date(submission.deadline._seconds * 1000).toLocaleString()}</h1>
					</div>
					<div className="flex justify-between mt-4">
						<div className="flex gap-2 items-center">
							{isSubmitted || submission.submission.status == "graded" ? <CheckCircle size={18} className="text-white" /> : <History size={18} />}
							<p>{status.charAt(0).toUpperCase() + status.slice(1)}</p>

						</div>
						<div className="flex gap-2 items-center">
							<DiamondPlus size={18} />
							<h1>
								{submission.submission.status == "graded" ? (`${submission.submission.marks} marks out of `) : ""} {submission.total} Marks
							</h1>
						</div>
					</div>
				</div>



				{/* Content */}
				<div className="p-6 flex-1 overflow-y-auto">
					<h1>{submission.description}</h1>
					{submission.fileid && (
						<div className="bg-white rounded-2xl w-[200px] p-3 mt-4">
							<img src={`http://localhost:5000/api/users/profile?url=${submission.thumbnailUrl}`} alt="Document" className="rounded-xl" />
							<a href={submission.fileUrl} className="text-sm block mt-2 text-blue-600" target="_blank" rel="noopener noreferrer">Download File</a>
						</div>
					)}

					{(isSubmitted) && uploadedFile && (
						<div>
							<h1 className="text-sm opacity-50 mt-4">Submitted File:</h1>
							<div className="bg-white rounded-2xl w-[200px] p-3 mt-1">
								<div className="flex items-center gap-2">
									<img className="w-6 h-6" src={uploadedFile.icon} alt="Doc" />
									<h1 className="text-sm">{uploadedFile.name}</h1>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Bottom Bar */}
				<div className="p-4 bg-themegray border-t border-gray-300 flex items-center gap-2">
					<input type="file" onChange={handleFileChange} className="hidden" id="fileInput" disabled={isSubmitted  || submission.submission.status == "graded"} />
					<label htmlFor="fileInput" className={`bg-white p-2 px-4 w-full rounded-full flex justify-between items-center cursor-pointer ${(isSubmitted  || submission.submission.status == "graded") ? 'opacity-50 cursor-not-allowed' : ''}`}>
						<span>{selectedFile ? selectedFile.name : "Choose File"}</span>
						<Plus size={20} />
					</label>

					<button
						onClick={handleSubmit}
						disabled={loading || isSubmitted}
						className={`${priorityColors[submission.priority] || "bg-gray-300"} text-white rounded-full h-fit p-2 flex items-center text-center`}
					>
						{loading ? "Uploading..." : <SendHorizontal size={20} />}
					</button>

				</div>
			</div>
		</div>
	);
};

export default SubmissionModal;
