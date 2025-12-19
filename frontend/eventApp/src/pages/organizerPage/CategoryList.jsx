
// pages/CategoryList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTag, FaSpinner, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useEventContext } from '../../context/EventContext';

const CategoryList = () => {
  const { BASE_URL } = useEventContext();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/api/categories/get-category`, { withCredentials: true });
        
        if (response.data.success) {
          setCategories(response.data.categories || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [BASE_URL]);

  // Handle delete category
  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    setDeleteLoading(categoryId);
    try {
      const response = await axios.delete(`${BASE_URL}/api/categories/delete-category/${categoryId}`, { withCredentials: true });
      
      if (response.data.success) {
        setCategories(categories.filter(category => category._id !== categoryId));
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="ml-60 p-8 pt-20">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
            <p className="text-gray-600 mt-2">Manage event categories</p>
          </div>
          <Link
            to="/create-category"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 whitespace-nowrap"
          >
            <FaPlus />
            Add New Category
          </Link>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <FaSpinner className="animate-spin text-blue-600 text-3xl" />
            <span className="ml-3 text-gray-600">Loading categories...</span>
          </div>
        ) : categories.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 bg-white rounded-xl shadow border border-gray-200">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
              <FaTag className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No categories found</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first category</p>
            <Link
              to="/create-category"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              <FaPlus />
              Create Category
            </Link>
          </div>
        ) : (
          /* Categories Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div 
                key={category._id} 
                className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Category Image */}
                <div className="h-48 overflow-hidden bg-gray-100">
                  {category.image ? (
                    <img
                      src={`${BASE_URL}/uploads/${category.image}`}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1519677100203-0f46c831d4b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-purple-500 to-pink-500 flex flex-col items-center justify-center p-4">
                      <FaTag className="text-white text-4xl mb-2" />
                      <span className="text-white text-lg font-semibold text-center">
                        {category.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Category Info */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{category.name}</h3>
                    <div className="flex space-x-2">
                      <Link
                        to={`/organizer/edit-category/${category._id}`}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Edit category"
                      >
                        <FaEdit />
                      </Link>
                      <button
                        onClick={() => handleDelete(category._id)}
                        disabled={deleteLoading === category._id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete category"
                      >
                        {deleteLoading === category._id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      Created: {new Date(category.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {categories.length > 0 && (
          <div className="mt-8 text-center text-gray-600">
            Total {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryList;