import React from "react";
import { MoveUpRight, History, CheckCircle } from "lucide-react";

const SubmissionTab = ({
	assignedBy,
	assignment,
	facultyName,
	deadline,
	status,
	facultyProfilePic,
	title,
	priority,
	onClick,
	submission
}) => {
	// Map priority levels to colors
	const priorityColors = {
		high: "bg-vpporange",
		medium: "bg-vppgreen",
		low: "bg-vpppurple",
	};
	const getDateFromTimestamp = (timestamp) => {
		// If timestamp has a _seconds property, it's a Firebase-like object.
		if (timestamp && typeof timestamp === "object" && timestamp._seconds) {
			return new Date(timestamp._seconds * 1000);
		}
		// Otherwise, assume it's a valid date string.
		return new Date(timestamp);
	};

	return (
		<div
			className="tab w-[300px] rounded-2xl border-2 border-gray-200 overflow-hidden cursor-pointer transition-transform hover:scale-102"
			onClick={onClick} // Make it clickable
		>
			<div
				className={`NameFull pt-2 px-4 pb-1 ${priorityColors[priority] || "bg-gray-300"} 
        text-white flex items-center justify-between`}
			>
				<div className="Name flex items-center gap-2">
					<div className="w-[28px] h-[28px] rounded-full overflow-hidden">
						<img
							src={`${import.meta.env.VITE_SERVER_URL}/api/users/profile?url=${facultyProfilePic}`}
							alt="Profile"
						/>
					</div>
					<h1 className="text-[16px]">{facultyName}</h1>
				</div>
			</div>
			<div className="px-4 pt-2 pb-4">
				<h1 className="text-[22px] font-neueMedium truncate whitespace-nowrap overflow-hidden w-full">
					{title}
				</h1>
				<h2 className="text-[15px]">
					Due:{" "}
					{getDateFromTimestamp(deadline)
						.toLocaleString("en-GB", {
							day: "2-digit",
							month: "2-digit",
							year: "2-digit",
							hour: "2-digit",
							minute: "2-digit",
						})
						.replace(",", "")}
				</h2>
				<div className="mt-3 flex justify-between items-center">
					<div className="flex items-center gap-1">
						{
							submission.status === "graded" ? (
								<CheckCircle size={20} className="text-vppgreen" />
							) : (
								submission.status.toLowerCase() === "submitted" ? (
									<CheckCircle size={15} className="" />
								) : (
									<History size={15} className="" />
								)
							)
						}
						<h3 className="text-[15px] capitalize">
							{submission.status}
						</h3>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SubmissionTab;
