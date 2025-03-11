import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import AdminHeader from './AdminHeader';
import axios from 'axios';

const ClassEditPage = () => {
    const { id } = useParams(); // Class ID from URL (if editing)
    const navigate = useNavigate();

    // State for departments, all users, and class data
    const [departments, setDepartments] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [classData, setClassData] = useState(null);
    const [isNewClass, setIsNewClass] = useState(!id);

    /* 
      For new class creation, updatedClassData holds:
         - departmentId, className, divisions (array), numOfDivisions, semester,
         - facultyIds, studentIds (both arrays)
      For update mode, we'll use:
         - departmentId, className, division (single string), semester,
         - facultyIds, studentIds (arrays)
    */
    const [updatedClassData, setUpdatedClassData] = useState({
        departmentId: '',
        className: '',
        divisions: [''], // for new class creation
        division: '',    // for update mode (current division name)
        numOfDivisions: 1,
        semester: '',
        facultyIds: [],
        studentIds: [],
    });

    // Fetch all departments
    useEffect(() => {
        axios
            .get('http://localhost:5000/api/departments/all')
            .then((response) => {
                // Assuming response.data.departments is the array
                setDepartments(response.data.departments);
            })
            .catch((error) => console.error('Error fetching departments:', error));
    }, []);

    // Fetch all users (for filtering faculty and students)
    useEffect(() => {
        axios
            .get('http://localhost:5000/api/users/allusers')
            .then((response) => {
                setAllUsers(response.data);
            })
            .catch((error) => console.error('Error fetching users:', error));
    }, []);

    // Fetch class data if editing
    useEffect(() => {
        if (id) {
            setIsNewClass(false);
            axios
                .get(`http://localhost:5000/api/departments/class/${id}`)
                .then((response) => {
                    const classDetails = response.data.class;
                    setUpdatedClassData({
                        departmentId: classDetails.departmentId,
                        className: classDetails.className,
                        division: classDetails.divisionName, // single division for update
                        semester: classDetails.semester,
                        facultyIds: classDetails.facultyIds || [],
                        studentIds: classDetails.studentIds || [],
                    });
                    setClassData(classDetails);
                })
                .catch((error) => console.error('Error fetching class data:', error));
        }
    }, [id]);

    // Handle basic input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedClassData({ ...updatedClassData, [name]: value });
    };

    // For new class: update divisions (array)
    const handleDivisionChange = (index, value) => {
        const newDivisions = [...updatedClassData.divisions];
        newDivisions[index] = value;
        setUpdatedClassData({
            ...updatedClassData,
            divisions: newDivisions,
            numOfDivisions: newDivisions.length,
        });
    };

    const addDivision = () => {
        setUpdatedClassData({
            ...updatedClassData,
            divisions: [...updatedClassData.divisions, ''],
            numOfDivisions: updatedClassData.numOfDivisions + 1,
        });
    };

    // Handle multi-select changes for faculty and students
    const handleMultiSelectChange = (e, key) => {
        const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
        setUpdatedClassData({ ...updatedClassData, [key]: selectedOptions });
    };

    // Filter users based on role and department selection
    const facultyUsers = allUsers.filter(
        (user) => user.role === 'faculty' && user.departmentId === updatedClassData.departmentId
    );
    const studentUsers = allUsers.filter((user) => {
        // Allow if student belongs to the department and is not assigned to a class OR is already in this class (update mode)
        return (
            user.role === 'student' &&
            user.departmentId === updatedClassData.departmentId &&
            (!user.classId || user.classId === id)
        );
    });

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        let formData = {
            departmentId: updatedClassData.departmentId,
            className: updatedClassData.className,
            semester: updatedClassData.semester,
            facultyIds: updatedClassData.facultyIds,
            studentIds: updatedClassData.studentIds,
        };

        if (isNewClass) {
            // For creation, send divisions as an array
            formData.divNames = updatedClassData.divisions;
            formData.numOfDivisions = updatedClassData.numOfDivisions;
        } else {
            // For update, send the single division name to update the current entry
            formData.divisionName = updatedClassData.division;
        }

        try {
            if (isNewClass) {
                await axios.post('http://localhost:5000/api/departments/createclass', formData);
                Swal.fire('Success!', 'Class created successfully.', 'success');
            } else {
                await axios.put(`http://localhost:5000/api/departments/class/update/${id}`, formData);
                Swal.fire('Success!', 'Class updated successfully.', 'success');
            }
            navigate('/admin/dashboard');
        } catch (error) {
            Swal.fire('Error!', 'There was an issue with the request.', 'error');
            console.error('Error:', error);
        }
    };

    // Handle deletion
    const handleDelete = async () => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this class?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`http://localhost:5000/api/departments/class/delete/${id}`);
                    Swal.fire('Deleted!', 'The class has been deleted.', 'success');
                    navigate('/admin/dashboard');
                } catch (error) {
                    Swal.fire('Error!', 'There was an issue deleting the class.', 'error');
                }
            }
        });
    };

    if (!departments.length) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
            <AdminHeader text={isNewClass ? 'Create New Class' : 'Edit Class'} />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Department Dropdown */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">Department</label>
                    <select
                        name="departmentId"
                        value={updatedClassData.departmentId}
                        onChange={handleInputChange}
                        className="p-3 border border-gray-300 rounded-md"
                        required
                    >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                            <option key={dept.departmentId} value={dept.departmentId}>
                                {dept.departmentName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Class Name */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">Class Name</label>
                    <input
                        type="text"
                        name="className"
                        value={updatedClassData.className}
                        onChange={handleInputChange}
                        className="p-3 border border-gray-300 rounded-md"
                        required
                    />
                </div>

                {/* Divisions or Division Name */}
                {isNewClass ? (
                    <div className="flex flex-col space-y-4">
                        <label className="text-sm font-medium text-gray-700">Divisions</label>
                        {updatedClassData.divisions.map((division, index) => (
                            <div key={index} className="flex items-center space-x-4">
                                <input
                                    type="text"
                                    value={division}
                                    onChange={(e) => handleDivisionChange(index, e.target.value)}
                                    className="p-3 border border-gray-300 rounded-md w-full"
                                    placeholder={`Division ${index + 1}`}
                                    required
                                />
                                {index === updatedClassData.divisions.length - 1 && (
                                    <button
                                        type="button"
                                        onClick={addDivision}
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        + Add Division
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700">Division</label>
                        <input
                            type="text"
                            name="division"
                            value={updatedClassData.division}
                            onChange={handleInputChange}
                            className="p-3 border border-gray-300 rounded-md"
                            required
                        />
                    </div>
                )}

                {/* Semester */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">Semester</label>
                    <input
                        type="number"
                        name="semester"
                        value={updatedClassData.semester}
                        onChange={handleInputChange}
                        className="p-3 border border-gray-300 rounded-md"
                        required
                    />
                </div>

                {/* Faculty Multi-Select */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">Assigned Faculty</label>
                    <select
                        name="facultyIds"
                        multiple
                        value={updatedClassData.facultyIds}
                        onChange={(e) => handleMultiSelectChange(e, 'facultyIds')}
                        className="p-3 border border-gray-300 rounded-md"
                    >
                        {facultyUsers.map((user) => (
                            <option key={user.userId} value={user.userId}>
                                {user.fullname}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Student Multi-Select */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">Assigned Students</label>
                    <select
                        name="studentIds"
                        multiple
                        value={updatedClassData.studentIds}
                        onChange={(e) => handleMultiSelectChange(e, 'studentIds')}
                        className="p-3 border border-gray-300 rounded-md"
                    >
                        {studentUsers.map((user) => (
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
                        className="px-6 py-3 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100"
                    >
                        Back
                    </button>

                    {!isNewClass && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="px-6 py-3 border border-red-300 rounded-md text-sm text-white bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </button>
                    )}

                    <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                    >
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ClassEditPage;