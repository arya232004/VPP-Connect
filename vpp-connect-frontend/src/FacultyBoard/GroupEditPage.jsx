import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Import SweetAlert2
import FacultyHeader from './FacultyHeader';

const GroupEditPage = () => {
    const { id } = useParams(); // Get the id from the URL
    const navigate = useNavigate();

    const [isEmpty, setIsEmpty] = useState(false);

    // Initializing state for the form fields
    const [group, setGroup] = useState({
        groupId: id, // Default to the group id from URL
        name: '',
        type: 'committee', // default value
        createdBy: '', // default value
        facultyIds: '',
        memberIds: '',
        createdAt: '',
    });

    const [updatedGroup, setUpdatedGroup] = useState(group);

    // Mock fetching the data (you'd fetch actual data from your API)
    useEffect(() => {
        // Replace with real API call to fetch group data
        setGroup({
            ...group,
            name: 'Computer Science Club',
            createdAt: '2023-01-01T10:00',
            facultyIds: 'faculty1, faculty2',
            memberIds: 'user1, user2, user3',
        });
        setUpdatedGroup({
            ...group,
            name: 'Computer Science Club',
            createdAt: '2023-01-01T10:00',
            facultyIds: 'faculty1, faculty2',
            memberIds: 'user1, user2, user3',
        });
    }, [id]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedGroup({
            ...updatedGroup,
            [name]: value,
        });
    };

    const handleDelete = () => {
        // SweetAlert confirmation
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this group?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#5D46AC',
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire('Deleted!', 'The group has been deleted.', 'success');
                console.log('Deleted Group ID:', id);
            }
        });
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        // SweetAlert confirmation
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
                Swal.fire('Saved!', 'Your changes have been saved.', 'success');
                // Optionally, handle your save logic here (e.g., send the data to your API)
                console.log('Updated Group:', updatedGroup);
            }
        });
    };

    useEffect(() => {
        if (id == undefined) {
            setIsEmpty(true);
        }
    }, []);

    return (
        <div className="">
            <FacultyHeader text={isEmpty ? "New Group" : "Edit Group"} />

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Group ID - Non-editable */}
                    {isEmpty ? "" :
                        <div>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700">Group ID</label>
                                <input
                                    type="text"
                                    value={updatedGroup.groupId}
                                    readOnly
                                    className="p-3 border border-gray-300 rounded-md"
                                />
                            </div>

                            {/* Created At - Non-editable */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700">Created At</label>
                                <input
                                    type="datetime-local"
                                    value={updatedGroup.createdAt}
                                    readOnly
                                    className="p-3 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                    }

                    {/* Group Name */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700">Group Name</label>
                        <input
                            type="text"
                            name="name"
                            value={updatedGroup.name}
                            onChange={handleInputChange}
                            className="p-3 border border-gray-300 rounded-md"
                        />
                    </div>

                    {/* Group Type */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700">Group Type</label>
                        <select
                            name="type"
                            value={updatedGroup.type}
                            onChange={handleInputChange}
                            className="p-3 border border-gray-300 rounded-md"
                        >
                            <option value="committee">Committee</option>
                            <option value="community">Community</option>
                        </select>
                    </div>

                    {/* Created By */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700">Created By</label>
                        <input
                            type="text"
                            value={updatedGroup.createdBy}
                            readOnly
                            className="p-3 border border-gray-300 rounded-md"
                        />
                    </div>

                    {/* faculty IDs */}
                    <div className="flex flex-col sm:col-span-2">
                        <label className="text-sm font-medium text-gray-700">faculty IDs</label>
                        <input
                            type="text"
                            name="facultyIds"
                            value={updatedGroup.facultyIds}
                            onChange={handleInputChange}
                            className="p-3 border border-gray-300 rounded-md"
                        />
                    </div>

                    {/* Member IDs */}
                    <div className="flex flex-col sm:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Member IDs</label>
                        <input
                            type="text"
                            name="memberIds"
                            value={updatedGroup.memberIds}
                            onChange={handleInputChange}
                            className="p-3 border border-gray-300 rounded-md"
                        />
                    </div>
                </div>

                <div className="flex gap-4 mt-6 justify-center">
                    <button
                        type="button"
                        onClick={() => navigate('/faculty/dashboard')}
                        className="px-6 py-3 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                        Back
                    </button>

                    {/* Delete Button */}
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="px-6 py-3 border border-red-300 rounded-md text-white text-sm bg-red-700 hover:bg-red-800 cursor-pointer"
                    >
                        Delete
                    </button>

                    {/* Save Button */}
                    <button
                        type="submit"
                        className="px-6 py-3 bg-[#5D46AC] text-white rounded-md text-sm hover:bg-[#4c3b91] cursor-pointer"
                    >
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GroupEditPage;
