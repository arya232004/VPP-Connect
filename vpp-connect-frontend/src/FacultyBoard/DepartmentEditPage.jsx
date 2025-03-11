import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Import SweetAlert2
import FacultyHeader from './FacultyHeader';

const DepartmentEditPage = () => {
    const { id } = useParams(); // Get the id from the URL
    const navigate = useNavigate();

    // Initializing state for the form fields
    const [department, setDepartment] = useState({
        departmentId: id, // Default to the department id from URL
        departmentName: '',
        departmentDescription: '',
        departmentChat: '',
        departmentClasses: '',
        timestamp: '',
        faculties: '',
        adminIds: '',
    });

    const [updatedDepartment, setUpdatedDepartment] = useState(department);

    // Mock fetching the data (you'd fetch actual data from your API)
    useEffect(() => {
        // Replace with real API call to fetch department data
        setDepartment({
            ...department,
            departmentName: 'Computer Science',
            departmentDescription: 'The department of Computer Science offers various programs in technology and software development.',
            departmentChat: 'cs-department-chat',
            departmentClasses: 'CS101, CS102, CS103',
            faculties: 'fac1, fac2, fac3',
            adminIds: 'admin1, admin2',
            timestamp: '2023-01-01T10:00',
        });
        setUpdatedDepartment({
            ...department,
            departmentName: 'Computer Science',
            departmentDescription: 'The department of Computer Science offers various programs in technology and software development.',
            departmentChat: 'cs-department-chat',
            departmentClasses: 'CS101, CS102, CS103',
            faculties: 'fac1, fac2, fac3',
            adminIds: 'admin1, admin2',
            timestamp: '2023-01-01T10:00',
        });
    }, [id]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedDepartment({
            ...updatedDepartment,
            [name]: value,
        });
    };

    const handleDelete = () => {
        // SweetAlert confirmation
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this department?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#5D46AC',
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire('Deleted!', 'The department has been deleted.', 'success');
                console.log('Deleted Department ID:', id);
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
                console.log('Updated Department:', updatedDepartment);
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
            <FacultyHeader text={isEmpty ? "New Department" : "Edit Department"} />

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Department ID - Non-editable */}
                    {isEmpty ? "" :
                        <div>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700">Department ID</label>
                                <input
                                    type="text"
                                    value={updatedDepartment.departmentId}
                                    readOnly
                                    className="p-3 border border-gray-300 rounded-md"
                                />
                            </div>

                            {/* Timestamp - Non-editable */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700">Timestamp</label>
                                <input
                                    type="datetime-local"
                                    value={updatedDepartment.timestamp}
                                    readOnly
                                    className="p-3 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                    }
                    {/* Department Name */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700">Department Name</label>
                        <input
                            type="text"
                            name="departmentName"
                            value={updatedDepartment.departmentName}
                            onChange={handleInputChange}
                            className="p-3 border border-gray-300 rounded-md"
                        />
                    </div>

                    {/* Department Description */}
                    <div className="flex flex-col sm:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Department Description</label>
                        <textarea
                            name="departmentDescription"
                            value={updatedDepartment.departmentDescription}
                            onChange={handleInputChange}
                            className="p-3 border border-gray-300 rounded-md"
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

                    {/* Department Classes */}
                    <div className="flex flex-col sm:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Department Classes (comma separated)</label>
                        <input
                            type="text"
                            name="departmentClasses"
                            value={updatedDepartment.departmentClasses}
                            onChange={handleInputChange}
                            className="p-3 border border-gray-300 rounded-md"
                        />
                    </div>

                    {/* Faculties */}
                    <div className="flex flex-col sm:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Faculties (comma separated)</label>
                        <input
                            type="text"
                            name="faculties"
                            value={updatedDepartment.faculties}
                            onChange={handleInputChange}
                            className="p-3 border border-gray-300 rounded-md"
                        />
                    </div>

                    {/* Admin IDs */}
                    <div className="flex flex-col sm:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Admin IDs (comma separated)</label>
                        <input
                            type="text"
                            name="adminIds"
                            value={updatedDepartment.adminIds}
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

export default DepartmentEditPage;
