import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Import SweetAlert2
import AdminHeader from './AdminHeader';

const UserEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State for user and updated user details
    const [user, setUser] = useState({
        userId: id,
        userName: '',
        className: '',
        createdAt: '',
        departmentId: '',
        email: '',
        role: '',
        classId: '',
        microblogs: [],
        joinedGroups: [],
    });

    const [updatedUser, setUpdatedUser] = useState(user);
    const [departments, setDepartments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch user data
    useEffect(() => {
        const fetchUser = async () => {
            const response = await fetch(`http://localhost:5000/api/users/getuser/${id}`);
            const data = await response.json();
            if (data) {
                setUser({
                    userId: data.userId,
                    userName: data.fullname,
                    email: data.email,
                    createdAt: new Date(data.createdAt._seconds * 1000).toISOString().slice(0, 16),
                    departmentId: data.departmentId,
                    role: data.role,
                    classId: data.classId,
                    microblogs: data.microblogs,
                    joinedGroups: data.joinedGroups || [],
                });
                setUpdatedUser({
                    userId: data.userId,
                    userName: data.fullname,
                    email: data.email,
                    createdAt: new Date(data.createdAt._seconds * 1000).toISOString().slice(0, 16),
                    departmentId: data.departmentId,
                    role: data.role,
                    classId: data.classId,
                    microblogs: data.microblogs,
                    joinedGroups: data.joinedGroups || [],
                });
            }
        };

        const fetchDepartments = async () => {
            const response = await fetch('http://localhost:5000/api/departments/all');
            const data = await response.json();
            console.log('Departments:', data.departments);
            setDepartments(data.departments);
        };

        fetchUser();
        fetchDepartments();
        setLoading(false);
    }, [id]);

    // Fetch classes when department changes
    useEffect(() => {
        if (updatedUser.departmentId) {
            const fetchClasses = async () => {
                const response = await fetch(`http://localhost:5000/api/departments/classes/${updatedUser.departmentId}`);
                const data = await response.json();
                setClasses(data.classes);
            };
            fetchClasses();
        }
    }, [updatedUser.departmentId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedUser({
            ...updatedUser,
            [name]: value,
        });
        console.log("Changed user's", name, 'to', value);
    };

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
                // Send updated user data to the API for update
                fetch('http://localhost:5000/api/users/updateuser', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: updatedUser.userId,
                        updates: {
                            userName: updatedUser.userName,
                            classId: updatedUser.classId,
                            departmentId: updatedUser.departmentId,
                            role: updatedUser.role,
                            microblogs: updatedUser.microblogs,
                            joinedGroups: updatedUser.joinedGroups,
                        },
                    }),
                })
                    .then((response) => response.json())
                    .then((data) => {
                        console.log('Updated user:', data);
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
            }
        });
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <AdminHeader text="Edit User" />

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* User ID - Non-editable */}
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

                        {/* Email - Non-editable */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                value={updatedUser.email}
                                readOnly
                                className="p-3 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>

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

                    {/* Role */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700">Role</label>
                        <select
                            name="role"
                            value={updatedUser.role}
                            onChange={handleInputChange}
                            className="p-3 border border-gray-300 rounded-md"
                        >
                            <option value="">Select Role</option>
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                        </select>
                    </div>

                    {/* Department */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700">Department</label>
                        <select
                            name="departmentId"
                            value={updatedUser.departmentId}
                            onChange={handleInputChange}
                            className="p-3 border border-gray-300 rounded-md"
                        >
                            <option value="">Select Department</option>
                            {departments.map((dept) => (
                                <option key={dept.departmentId} value={dept.departmentId}>
                                    {dept.departmentName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Class */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700">Class</label>
                        <select
                            name="classId"
                            value={updatedUser.classId}
                            onChange={handleInputChange}
                            className="p-3 border border-gray-300 rounded-md"
                        >
                            <option value="">Select Class</option>
                            {classes.map((classId) => (
                                <option key={classId} value={classId}>
                                    {classId}
                                </option>
                            ))}
                        </select>
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
                </div>

                <div className="flex gap-4 mt-6 justify-center">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/dashboard')}
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

export default UserEditPage;
