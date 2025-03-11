import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import AdminHeader from './AdminHeader';

const AnnouncementEditPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [isEmpty, setIsEmpty] = useState(!id);
	const [loading, setLoading] = useState(!isEmpty);

	// State for form data
	const [announcement, setAnnouncement] = useState({
		announcementId: id || '',
		category: 'event',
		content: '',
		level: 'college',
		fileId: null,
		postedBy: '',
		targetId: '',
		timestamp: '',
		title: '',
		fileUrl: '',
	});

	// State for updated data
	const [updatedAnnouncement, setUpdatedAnnouncement] = useState({
		...announcement,
		targetId: '',  // Department ID or Class ID
		classId: '',   // Class ID (when level is 'class')
		communityId: '', // Community ID (when level is 'community')
	});

	// State for classes, departments, and communities
	const [classes, setClasses] = useState([]);
	const [departments, setDepartments] = useState([]);
	const [filePreview, setFilePreview] = useState(null);

	// Fetch announcement data
	useEffect(() => {
		if (!isEmpty) {
			fetch(`http://localhost:5000/api/announcements/get/${id}`)
				.then((res) => res.json())
				.then((data) => {
					const announcementData = {
						announcementId: data.announcementId,
						category: data.category || 'event',
						content: data.content || '',
						level: data.level,
						fileId: data.fileId || null,
						postedBy: data.postedBy || 'Unknown',
						targetId: data.targetId || '',
						timestamp: data.timestamp,
						time: new Date(data.timestamp._seconds * 1000).toISOString().slice(0, 16),
						title: data.title || '',
						fileUrl: data.thumbnailUrl || null,
					};
					setAnnouncement(announcementData);
					setUpdatedAnnouncement(announcementData);
					setFilePreview(data.thumbnailUrl);
					setLoading(false);
				})
				.catch((error) => {
					console.error('Error fetching announcement:', error);
					setLoading(false);
				});
		}
	}, [id, isEmpty]);

	// Fetch classes and departments
	useEffect(() => {
		fetch('http://localhost:5000/api/departments/allclasses')
			.then((res) => res.json())
			.then((data) => setClasses(data.classes));

		fetch('http://localhost:5000/api/departments/all')
			.then((res) => res.json())
			.then((data) => setDepartments(data.departments));
	}, []);

	// Handle input changes
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setUpdatedAnnouncement({ ...updatedAnnouncement, [name]: value });
	};

	// Handle file changes
	const handleFileChange = (e) => {
		const file = e.target.files[0];
		setUpdatedAnnouncement({ ...updatedAnnouncement, fileId: file });
		setFilePreview(URL.createObjectURL(file));
	};

	// Handle delete
	const handleDelete = () => {
		Swal.fire({
			title: 'Are you sure?',
			text: 'Do you want to delete this announcement?',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Delete',
			cancelButtonText: 'Cancel',
			confirmButtonColor: '#d33',
			cancelButtonColor: '#5D46AC',
		}).then((result) => {
			if (result.isConfirmed) {
				fetch(`http://localhost:5000/api/announcements/delete/${id}`, { method: 'DELETE' })
					.then(() => Swal.fire('Deleted!', 'The announcement has been deleted.', 'success'))
					.then(() => navigate('/admin/dashboard'));
			}
		});
	};

	// Handle form submit
	const handleSubmit = (e) => {
		e.preventDefault();

		if (!isEmpty) {
			const cleanedUpdate = {
				...updatedAnnouncement,
				// Update targetId based on the selected level
				targetId: updatedAnnouncement.targetId,
				postedBy: updatedAnnouncement.postedBy || 'Unknown',
				time: undefined
			};

			Swal.fire({
				title: 'Are you sure?',
				text: 'Do you want to save these changes?',
				icon: 'warning',
				showCancelButton: true,
				confirmButtonText: 'Save',
				cancelButtonText: 'Cancel',
				confirmButtonColor: '#5D46AC',
				cancelButtonColor: '#d33',
			}).then((result) => {
				if (result.isConfirmed) {
					fetch(`http://localhost:5000/api/announcements/update/${id}`, {
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(cleanedUpdate),
					}).then(() => Swal.fire('Saved!', 'Your changes have been saved.', 'success'));
				}
			});
		} else {
			const formData = new FormData();
			formData.append('category', updatedAnnouncement.category);
			formData.append('content', updatedAnnouncement.content);
			formData.append('level', updatedAnnouncement.level);
			formData.append('title', updatedAnnouncement.title);
			formData.append('file', updatedAnnouncement.fileId);
			formData.append('targetId', updatedAnnouncement.targetId);
			formData.append('postedBy', "super_admin");

			Swal.fire({
				title: 'Are you sure?',
				text: 'Do you want to save this announcement?',
				icon: 'warning',
				showCancelButton: true,
				confirmButtonText: 'Save',
				cancelButtonText: 'Cancel',
				confirmButtonColor: '#5D46AC',
				cancelButtonColor: '#d33',
			}).then((result) => {
				if (result.isConfirmed) {
					fetch('http://localhost:5000/api/announcements/create', {
						method: 'POST',
						body: formData,
					}).then(
						(res) => res.json(),
						(error) => console.error('Error creating announcement:', error)
					).then((data) => {
						Swal.fire('Saved!', 'The announcement has been created.', 'success');
						navigate('/admin/dashboard');
					}
					);
				}
			});
		}
	};

	if (loading) return <p className="text-center">Loading...</p>;

	return (
		<div className="min-h-screen bg-gray-100 ">
			<AdminHeader text={isEmpty ? 'New Announcement' : 'Edit Announcement'} />
			<form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
					{!isEmpty && (
						<>
							<div>
								<label className="text-sm font-medium text-gray-700">Announcement ID</label>
								<input
									type="text"
									value={updatedAnnouncement.announcementId}
									readOnly
									className="p-3 border rounded-md bg-gray-100 w-full"
								/>
							</div>
							<div>
								<label className="text-sm font-medium text-gray-700">Timestamp</label>
								<input
									type="datetime-local"
									value={updatedAnnouncement.time}
									readOnly
									className="p-3 border rounded-md bg-gray-100 w-full"
								/>
							</div>
						</>
					)}
					<div>
						<label className="text-sm font-medium text-gray-700">Category</label>
						<select
							name="category"
							value={updatedAnnouncement.category}
							onChange={handleInputChange}
							className="p-3 border rounded-md w-full"
						>
							<option value="event">Event</option>
							<option value="update">Update</option>
							<option value="holiday_notice">Holiday Notice</option>
							<option value="exam_update">Exam Update</option>
							<option value="placement_update">Placement Update</option>
						</select>
					</div>
					<div>
						<label className="text-sm font-medium text-gray-700">Level</label>
						<select
							name="level"
							value={updatedAnnouncement.level}
							onChange={handleInputChange}
							className="p-3 border rounded-md w-full"
						>
							<option value="college">College</option>
							<option value="department">Department</option>
							<option value="class">Class</option>
							<option value="community">Community</option>
						</select>
					</div>
					<div>
						<label className="text-sm font-medium text-gray-700">Title</label>
						<input
							type="text"
							name="title"
							value={updatedAnnouncement.title}
							onChange={handleInputChange}
							className="p-3 border rounded-md w-full"
						/>
					</div>
					<div>
						<label className="text-sm font-medium text-gray-700">Content</label>
						<textarea
							name="content"
							value={updatedAnnouncement.content}
							onChange={handleInputChange}
							className="p-3 border rounded-md h-32 w-full"
						/>
					</div>
					{/* Level-Specific Selection */}
					{updatedAnnouncement.level === 'department' && (
						<div>
							<label className="text-sm font-medium text-gray-700">Department</label>
							<select
								name="targetId"
								value={updatedAnnouncement.targetId}
								onChange={handleInputChange}
								className="p-3 border rounded-md w-full"
							>
								<option key="" value="">
									Select Department
								</option>
								{departments.map((department) => (
									<option key={department.departmentId} value={department.departmentId}>
										{department.departmentName}
									</option>
								))}
							</select>
						</div>
					)}
					{updatedAnnouncement.level === 'class' && (
						<div>
							<label className="text-sm font-medium text-gray-700">Class</label>
							<select
								name="targetId"
								value={updatedAnnouncement.targetId}
								onChange={handleInputChange}
								className="p-3 border rounded-md w-full"
							>
								<option key="" value="">
									Select Class
								</option>
								{classes.map((classItem) => (
									<option key={classItem.classId} value={classItem.classId}>
										{classItem.name} - {classItem.divisionName}
									</option>
								))}
							</select>
						</div>
					)}
					{updatedAnnouncement.level === 'community' && (
						<div>
							<label className="text-sm font-medium text-gray-700">Community</label>
							<select
								name="targetId"
								value={updatedAnnouncement.targetId}
								onChange={handleInputChange}
								className="p-3 border rounded-md w-full"
							>
								<option key="" value="">
									Select Community
								</option>
							</select>
						</div>
					)}
					<div>
						<label className="text-sm font-medium text-gray-700">File Upload</label>
						<input type="file" onChange={handleFileChange} className="p-3 border rounded-md w-full" />
						{filePreview && (
							<div className="mt-4">
								<img src={`http://localhost:5000/api/users/profile?url=${filePreview}`} alt="File Preview" className="max-w-xs" />
								<button
									type="button"
									onClick={() => setFilePreview(null)}
									className="text-red-600 mt-2"
								>
									Remove File
								</button>
							</div>
						)}
					</div>
				</div>
				<div className="flex gap-4 mt-6 justify-center">
					<button
						type="button"
						onClick={() => navigate('/admin/dashboard')}
						className="px-6 py-3 border rounded-md hover:bg-gray-100"
					>
						Back
					</button>
					{!isEmpty && (
						<button
							type="button"
							onClick={handleDelete}
							className="px-6 py-3 bg-red-700 text-white rounded-md hover:bg-red-800"
						>
							Delete
						</button>
					)}
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
};

export default AnnouncementEditPage;