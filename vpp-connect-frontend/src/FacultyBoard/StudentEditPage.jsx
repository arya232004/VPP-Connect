import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Import SweetAlert2
import FacultyHeader from './FacultyHeader';

const StudentEditPage = () => {
    const { id } = useParams(); // Get the id from the URL
    const navigate = useNavigate();

    // Initializing state for the form fields
    const [user, setUser] = useState({
        userId: id, // Default to the user id from URL
        userName: '',
        className: '',
        createdAt: '',
        departmentId: '',
        email: '',
        microblogs: [], // List of microblogs (for example, IDs or titles of microblogs)
        role: '',
        joinedGroups: [], // List of groups the user is part of
    });

    const [updatedUser, setUpdatedUser] = useState(user);

    // Mock fetching the data (you'd fetch actual data from your API)
    useEffect(() => {
        // Replace with real API call to fetch user data
        setUser({
            ...user,
            userName: 'Jane Doe',
            className: 'Computer Science 101',
            createdAt: '2025-03-01T10:00',
            departmentId: 'CS001',
            email: 'janedoe@example.com',
            microblogs: ['Microblog 1', 'Microblog 2'],
            role: 'student',
            joinedGroups: ['Group A', 'Group B'],
        });
        setUpdatedUser({
            ...user,
            userName: 'Jane Doe',
            className: 'Computer Science 101',
            createdAt: '2025-03-01T10:00',
            departmentId: 'CS001',
            email: 'janedoe@example.com',
            microblogs: ['Microblog 1', 'Microblog 2'],
            role: 'student',
            joinedGroups: ['Group A', 'Group B'],
        });
    }, [id]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedUser({
            ...updatedUser,
            [name]: value,
        });
    };

    // Handle changes for list fields (microblogs, joinedGroups)
    const handleListChange = (e, type) => {
        const { value } = e.target;
        let updatedList = [...updatedUser[type]];
        if (e.target.checked) {
            updatedList.push(value);
        } else {
            updatedList = updatedList.filter((item) => item !== value);
        }
        setUpdatedUser({
            ...updatedUser,
            [type]: updatedList,
        });
    };

    const handleDelete = () => {
        // SweetAlert confirmation
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this user?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#5D46AC',
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire('Deleted!', 'The user has been deleted.', 'success');
                console.log('Deleted User ID:', id);
            }
        });
    };

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
                console.log('Updated User:', updatedUser);
            }
        });
    };

    const [isEmpty, setIsEmpty] = useState(false);
    useEffect(() => {
        if (id == undefined) {
            setIsEmpty(true);
        }
    }, []);

    return (
        <div className="">
            <FacultyHeader text={isEmpty ? "New Student" : "Edit Student"} />

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* User ID - Non-editable */}
                    {isEmpty ? "" :
                        <div>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700">User ID</label>
                                <input
                                    type="text"
                                    value={updatedUser.userId}
                                    readOnly
                                    className="p-3 border border-gray-300 rounded-md"
                                />
                            </div>

                            {/* Created At - Non-editable */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700">Created At</label>
                                <input
                                    type="datetime-local"
                                    value={updatedUser.createdAt}
                                    readOnly
                                    className="p-3 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                    }

                    {/* User Name */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700">User Name</label>
                        <input
                            type="text"
                            name="userName"
                            value={updatedUser.userName}
                            onChange={handleInputChange}
                            className="p-3 border border-gray-300 rounded-md"
                        />
                    </div>

                    {/* Class Name */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700">Class Name</label>
                        <input
                            type="text"
                            name="className"
                            value={updatedUser.className}
                            onChange={handleInputChange}
                            className="p-3 border border-gray-300 rounded-md"
                        />
                    </div>

                    {/* Department ID */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700">Department ID</label>
                        <input
                            type="text"
                            name="departmentId"
                            value={updatedUser.departmentId}
                            onChange={handleInputChange}
                            className="p-3 border border-gray-300 rounded-md"
                        />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={updatedUser.email}
                            onChange={handleInputChange}
                            className="p-3 border border-gray-300 rounded-md"
                        />
                    </div>

                    {/* Microblogs */}
                    <div className="flex flex-col sm:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Microblogs</label>
                        <div className="space-y-2">
                            {['Microblog 1', 'Microblog 2', 'Microblog 3'].map((microblog) => (
                                <div key={microblog}>
                                    <input
                                        type="checkbox"
                                        value={microblog}
                                        checked={updatedUser.microblogs.includes(microblog)}
                                        onChange={(e) => handleListChange(e, 'microblogs')}
                                    />
                                    <label className="ml-2">{microblog}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Joined Groups */}
                    <div className="flex flex-col sm:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Joined Groups</label>
                        <div className="space-y-2">
                            {['Group A', 'Group B', 'Group C'].map((group) => (
                                <div key={group}>
                                    <input
                                        type="checkbox"
                                        value={group}
                                        checked={updatedUser.joinedGroups.includes(group)}
                                        onChange={(e) => handleListChange(e, 'joinedGroups')}
                                    />
                                    <label className="ml-2">{group}</label>
                                </div>
                            ))}
                        </div>
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

export default StudentEditPage;
