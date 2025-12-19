// pages/CreateCategory.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { FaPlus, FaSpinner, FaUpload } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useEventContext } from '../../context/EventContext';
import { toastSuccess } from '../../../utility/toast';



const CreateCategory = () => {
    const {BASE_URL} = useEventContext()
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [formData, setFormData] = useState({
        name: '',
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');


    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        // Validation
        if (!formData.name) {
            setMessage("Name of cateory is required");
            setLoading(false);
        } else {
            try {
                const data = new FormData();
                data.append('name', formData.name);
                if (image) {
                    data.append('image', image);
                }
                
                const res = await axios.post(`${BASE_URL}/api/categories/create-category`, data,{withCredentials:true});

                if (res.data.success) {
                    setFormData({ name: '' });
                    setImage(null);
                    setImagePreview('');
                    toastSuccess(res.data.message)
                } else {
                    setMessage("Failed to create category")
                }
            } catch (err) {
                console.log(err);
                if (err.response) {
                    if (err.response.data.message) {
                        setMessage(err.response.data.message);
                    }
                } else {
                    setMessage("Server is not responding");
                }
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="ml-60 p-8 pt-20">
            {/* Message Alert */}
            {message && (
                <div className='mb-6 p-4 rounded-lg bg-red-100 text-red-700 border border-red-200'>
                    {message}
                </div>
            )}

            <div className="max-w-2xl">
                <div className="bg-white rounded-lg shadow p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Category</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                placeholder="Enter category name"
                                required
                            />
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category Image
                            </label>

                            {/* Image Preview */}
                            {imagePreview && (
                                <div className="mb-4">
                                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* File Input */}
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <FaUpload className="w-8 h-8 text-gray-400 mb-2" />
                                        <p className="mb-2 text-sm text-gray-500">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                    />
                                </label>
                            </div>

                            {image && (
                                <p className="mt-2 text-sm text-gray-600">
                                    Selected: {image.name}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 cursor-pointer text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <FaPlus />
                                    Create Category
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateCategory;