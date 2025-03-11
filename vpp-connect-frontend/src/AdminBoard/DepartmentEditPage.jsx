import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import AdminHeader from './AdminHeader';
import axios from 'axios';

const DepartmentEditPage = () => {
    const { id } = useParams(); // Department ID from URL (if editing)
    const navigate = useNavigate();

    // State for all users (to filter for faculties/admins) and department data
    const [allUsers, setAllUsers] = useState([]);
    const [departmentData, setDepartmentData] = useState(null);
    const [isNewDepartment, setIsNewDepartment] = useState(!id);

    /* 
      For both creation and update, updatedDepartment holds:
        - departmentName, departmentDescription, departmentChat, departmentClasses (as text or comma separated),
        - faculties and adminIds (as arrays)
      In edit mode, departmentId and timestamp are non-editable.
    */
    const [updatedDepartment, setUpdatedDepartment] = useState({
        departmentId: id || '',
        departmentName: '',
        departmentDescription: '',
        departmentChat: '',
        classes: '',
        faculties: [],   // Array of user IDs for faculties
        adminIds: [],    // Array of user IDs for department admins
        timestamp: '',
    });

    // Fetch all users for multi-select (filter later by role)
    useEffect(() => {
        axios.get('http://localhost:5000/api/users/allusers')
            .then((response) => {
                setAllUsers(response.data);
            })
            .catch((error) => console.error('Error fetching users:', error));
    }, []);

    // If editing, fetch the existing department details
    useEffect(() => {
        if (id) {
            setIsNewDepartment(false);
            axios.get(`http://localhost:5000/api/departments/get/${id}`)
                .then((response) => {
                    const dept = response.data.department;
                    setUpdatedDepartment({
                        departmentId: dept.departmentId,
                        departmentName: dept.departmentName,
                        departmentDescription: dept.departmentDescription,
                        departmentChat: dept.departmentChat,
                        classes: dept.departmentClasses?.join(', ') || '', // if stored as array
                        faculties: dept.facultyIds || [],
                        adminIds: dept.adminIds || [],
                        timestamp: new Date(dept.timestamp._seconds * 1000).toISOString().slice(0, 16),
                    });
                    setDepartmentData(dept);
                })
                .catch((error) => console.error('Error fetching department data:', error));
        }
    }, [id]);

    // Handle input changes for text fields
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedDepartment({ ...updatedDepartment, [name]: value });
    };

    // Handle multi-select changes for faculties and admin IDs
    const handleMultiSelectChange = (e, key) => {
        const selected = Array.from(e.target.selectedOptions, option => option.value);
        setUpdatedDepartment({ ...updatedDepartment, [key]: selected });
    };

    // Filter users for faculties (only users with role 'faculty')
    const facultyUsers = allUsers.filter(user => user.role === 'faculty');

    // Filter users for admin selection (e.g., role 'admin' or 'super_admin')
    const adminUsers = allUsers.filter(user => user.role === 'admin' || user.role === 'super_admin');

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prepare form data. Optionally, you can convert departmentClasses to array if required.
        const formData = {
            departmentName: updatedDepartment.departmentName,
            departmentDescription: updatedDepartment.departmentDescription,
            departmentChat: updatedDepartment.departmentChat,
            // If departmentClasses is a comma separated string, you may split it:
            classes: updatedDepartment.departmentClasses?.split(',').map(str => str.trim()),
            facultyIds: updatedDepartment.faculties,
            adminIds: updatedDepartment.adminIds,
        };

        try {
            if (isNewDepartment) {
                await axios.post('http://localhost:5000/api/departments/create', formData);
                Swal.fire('Success!', 'Department created successfully.', 'success');
            } else {
                await axios.put(`http://localhost:5000/api/departments/update/${id}`, formData);
                Swal.fire('Success!', 'Department updated successfully.', 'success');
            }
            navigate('/admin/dashboard');
        } catch (error) {
            Swal.fire('Error!', 'There was an issue with the request.', 'error');
            console.error('Error:', error);
        }
    };

    // Handle department deletion
    const handleDelete = async () => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this department?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#5D46AC',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`http://localhost:5000/api/departments/delete/${id}`);
                    Swal.fire('Deleted!', 'The department has been deleted.', 'success');
                    navigate('/admin/dashboard');
                } catch (error) {
                    Swal.fire('Error!', 'There was an issue deleting the department.', 'error');
                    console.error('Error:', error);
                }
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
            <AdminHeader text={isNewDepartment ? 'Create New Department' : 'Edit Department'} />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* In edit mode, show Department ID and Timestamp as read-only */}
                {!isNewDepartment && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700">Department ID</label>
                            <input
                                type="text"
                                value={updatedDepartment.departmentId}
                                readOnly
                                className="p-3 border border-gray-300 rounded-md bg-gray-100"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700">Timestamp</label>
                            <input
                                type="datetime-local"
                                value={updatedDepartment.timestamp}
                                readOnly
                                className="p-3 border border-gray-300 rounded-md bg-gray-100"
                            />
                        </div>
                    </div>
                )}

                {/* Department Name */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">Department Name</label>
                    <input
                        type="text"
                        name="departmentName"
                        value={updatedDepartment.departmentName}
                        onChange={handleInputChange}
                        className="p-3 border border-gray-300 rounded-md"
                        required
                    />
                </div>

                {/* Department Description */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">Department Description</label>
                    <textarea
                        name="departmentDescription"
                        value={updatedDepartment.departmentDescription}
                        onChange={handleInputChange}
                        className="p-3 border border-gray-300 rounded-md"
                        rows="4"
                    />
                </div>

                {/* Department Chat */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">Department Chat</label>
                    <input
                        type="text"
                        name="departmentChat"
                        value={updatedDepartment.departmentChat}
                        onChange={handleInputChange}
                        className="p-3 border border-gray-300 rounded-md"
                    />
                </div>

                {/* Department Classes (comma separated) */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">Department Classes (comma separated)</label>
                    <input
                        type="text"
                        name="departmentClasses"
                        value={updatedDepartment.classes}
                        onChange={handleInputChange}
                        className="p-3 border border-gray-300 rounded-md"
                    />
                </div>

                {/* Faculties Multi-Select */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">Faculties</label>
                    <select
                        name="faculties"
                        multiple
                        value={updatedDepartment.faculties}
                        onChange={(e) => handleMultiSelectChange(e, 'faculties')}
                        className="p-3 border border-gray-300 rounded-md h-32"
                    >
                        {allUsers.filter(user => user.role === 'faculty').map((user) => (
                            <option key={user.userId} value={user.userId}>
                                {user.fullname}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Admin IDs Multi-Select */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">Admin IDs</label>
                    <select
                        name="adminIds"
                        multiple
                        value={updatedDepartment.adminIds}
                        onChange={(e) => handleMultiSelectChange(e, 'adminIds')}
                        className="p-3 border border-gray-300 rounded-md h-32"
                    >
                        {allUsers.filter(user => user.role === 'admin' || user.role === 'super_admin').map((user) => (
                            <option key={user.userId} value={user.userId}>
                                {user.fullname}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/dashboard')}
                        className="px-6 py-3 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                        Back
                    </button>

                    {!isNewDepartment && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="px-6 py-3 border border-red-300 rounded-md text-white text-sm bg-red-700 hover:bg-red-800 cursor-pointer"
                        >
                            Delete
                        </button>
                    )}

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

export default DepartmentEditPage;