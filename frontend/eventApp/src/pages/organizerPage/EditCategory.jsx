// pages/EditCategory.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSave, FaSpinner, FaUpload, FaArrowLeft, FaTimes, FaImage } from 'react-icons/fa';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useEventContext } from '../../context/EventContext';
import { toastError, toastSuccess } from '../../../utility/toast';

const EditCategory = () => {
  const { BASE_URL } = useEventContext();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  
  const [formData, setFormData] = useState({
    name: ''
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [currentImage, setCurrentImage] = useState('');

 
  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/api/categories/get-single-category/${id}`, { withCredentials: true });
        
        if (response.data.success) {
          const category = response.data.category || response.data.data;
          
          setFormData({
            name: category.name || ''
          });

          if (category.image) {
            setCurrentImage(`${BASE_URL}/uploads/${category.image}`);
          }
        }
      } catch (error) {
        console.error('Error fetching category:', error);
        toastError('Failed to load category data');
        navigate('/categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!formData.name.trim()) {
      toastError("Category name is required");
      return;
    }

    try {
      setUpdating(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      
     
      if (image) {
        formDataToSend.append('image', image);
      }

      const res = await axios.put(
        `${BASE_URL}/api/categories/update-category/${id}`, 
        formDataToSend, 
        { withCredentials: true }
      );

      if (res.data.success) {
        toastSuccess(res.data.message);
        navigate('/organizer/category-list');
      }

    } catch (err) {
      console.log(err);
      
      if (err.response) {
        if (err.response.data.message) {
          setMessage(err.response.data.message);
          toastError(err.response.data.message);
        }
      } else {
        setMessage("Server not responding. Please try again later.");
        toastError("Server not responding");
      }
    } finally {
      setUpdating(false);
    }
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

  const removeImage = () => {
    setImage(null);
    setImagePreview('');
    setCurrentImage('');
  };

  if (loading) {
    return (
      <div className="ml-4 p-8 flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-blue-600 text-4xl" />
        <span className="ml-4 text-gray-600 text-lg">Loading category data...</span>
      </div>
    );
  }

  return (
    <div className="ml-4 p-8">
      {/* Back Button */}
      <Link
        to="/categories"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition mb-6"
      >
        <FaArrowLeft />
        Back to Categories
      </Link>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Category</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Name */}
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

            {/* Image Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Image
              </label>
              
              {/* Current Image Preview */}
              {(currentImage || imagePreview) && (
                <div className="mb-4 relative inline-block">
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                    <img
                      src={imagePreview || currentImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                    >
                      <FaTimes className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {image ? 'New image selected' : 'Current image'}
                  </div>
                </div>
              )}

              {/* File Upload */}
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FaUpload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {currentImage ? 'Upload new image to replace current' : 'Upload category image'}
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                </label>
              </div>

              {/* No Image State */}
              {!currentImage && !image && (
                <div className="mt-4 flex items-center gap-2 text-gray-500 text-sm">
                  <FaImage />
                  <span>No image uploaded</span>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <Link
                to="/organizer/category-list"
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition flex items-center justify-center gap-2"
              >
                Cancel
              </Link>
              
              <button
                type="submit"
                disabled={updating}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updating ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Update Category
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCategory;