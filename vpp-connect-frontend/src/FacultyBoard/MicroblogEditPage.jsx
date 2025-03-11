import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Import SweetAlert2
import FacultyHeader from './FacultyHeader';

const MicroblogEditPage = () => {
    const { id } = useParams(); // Get the id from the URL
    const navigate = useNavigate();

    // Initializing state for the form fields
    const [microblog, setMicroblog] = useState({
        blogId: id, // Default to the blog id from URL
        userName: '',
        timestamp: '',
        likes: 0,
        type: 'text', // Default type to text (can be 'text' or 'image' or 'video')
    });
    const [isEmpty, setIsEmpty] = useState(false);
    const [updatedMicroblog, setUpdatedMicroblog] = useState(microblog);

    // Mock fetching the data (you'd fetch actual data from your API)
    useEffect(() => {
        // Replace with real API call to fetch microblog data
        setMicroblog({
            ...microblog,
            userName: 'John Doe',
            timestamp: '2025-01-01T12:00',
            likes: 100,
            type: 'text',
            content: "balh blah"
        });
        setUpdatedMicroblog({
            ...microblog,
            userName: 'John Doe',
            timestamp: '2025-01-01T12:00',
            likes: 100,
            type: 'text',
            content: "balh blahasasds"
        });
    }, [id]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedMicroblog({
            ...updatedMicroblog,
            [name]: value,
        });
    };

    const handleDelete = () => {
        // SweetAlert confirmation
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this microblog?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#5D46AC',
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire('Deleted!', 'The microblog has been deleted.', 'success');
                console.log('Deleted Microblog ID:', id);
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
                console.log('Updated Microblog:', updatedMicroblog);
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
            <FacultyHeader text={isEmpty ? "New MicroBlog" : "Edit MicroBlog"} />

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Blog ID - Non-editable */}
                    {isEmpty ? "" :
                        <div>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700">Blog ID</label>
                                <input
                                    type="text"
                                    value={updatedMicroblog.blogId}
                                    readOnly
                                    className="p-3 border border-gray-300 rounded-md"
                                />
                            </div>

                            {/* Timestamp - Non-editable */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700">Timestamp</label>
                                <input
                                    type="datetime-local"
                                    value={updatedMicroblog.timestamp}
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
                            value={updatedMicroblog.userName}
                            readOnly
                            onChange={handleInputChange}
                            className="p-3 border border-gray-300 rounded-md"
                        />
                    </div>

                    {/* Likes */}
                    {isEmpty ? "" :

                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700">Likes</label>
                            <input
                                type="number"
                                name="likes"
                                value={updatedMicroblog.likes}
                                onChange={handleInputChange}
                                className="p-3 border border-gray-300 rounded-md"
                            />
                        </div>
                    }

                    {/* Type */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700">Type</label>
                        <select
                            name="type"
                            value={updatedMicroblog.type}
                            onChange={handleInputChange}
                            className="p-3 border border-gray-300 rounded-md"
                        >
                            <option value="text">Text</option>
                            <option value="image">Image</option>
                            <option value="video">Video</option>
                        </select>
                    </div>

                    {/* Content */}
                    {isEmpty ? <div className="flex flex-col sm:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Content</label>
                        <textarea
                            name="content"
                            value=""
                            onChange={handleInputChange}
                            className="p-3 border border-gray-300 rounded-md"
                        />
                    </div> : ""}
                </div>

                <div className="flex gap-4 mt-6 justify-center">
                    <button
                        type="button"
                        onClick={() => navigate('/Faculty/dashboard')}
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

export default MicroblogEditPage;
