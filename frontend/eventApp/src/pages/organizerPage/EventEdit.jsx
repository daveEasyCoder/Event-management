// pages/EditEvent.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaArrowLeft,
  FaSpinner,
  FaSave,
  FaCalendarAlt,
  FaTag,
  FaMapMarkerAlt,
  FaImage,
  FaDollarSign,
  FaCrown,
  FaTimes,
  FaUpload
} from 'react-icons/fa';
import { useEventContext } from '../../context/EventContext';
import { toastSuccess } from '../../../utility/toast';


const EditEvent = () => {

  const { BASE_URL } = useEventContext()
  const { id } = useParams();
  const navigate = useNavigate();

  // States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    venue: '',
    startDate: '',
    endDate: '',
    normalPrice: {
      price: '',
      quantity: ''
    },
    vipPrice: {
      price: '',
      quantity: ''
    },
    isPublished: false
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [currentImage, setCurrentImage] = useState('');

  // Fetch event data and dropdowns
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch event details
        const res = await axios.get(`${BASE_URL}/api/events/get-eventById/${id}`,{withCredentials:true});

        if (res.data.success) {
          const event = res.data.event;


          const formatForInput = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toISOString().slice(0, 16);
          };

          setFormData({
            title: event.title || '',
            description: event.description || '',
            category: event.category?._id || '',
            venue: event.venue?._id || '',
            startDate: formatForInput(event.startDate),
            endDate: formatForInput(event.endDate),
            normalPrice: {
              price: event.normalPrice?.price?.toString() || '',
              quantity: event.normalPrice?.quantity?.toString() || ''
            },
            vipPrice: {
              price: event.vipPrice?.price?.toString() || '',
              quantity: event.vipPrice?.quantity?.toString() || ''
            },
            isPublished: event.isPublished || false
          });

          // Set current image
          if (event.image) {
            setCurrentImage(`${BASE_URL}/uploads/${event.image}`);
          }
        }

        // Fetch categories
        const categoriesResponse = await axios.get(`${BASE_URL}/api/categories/get-category`,{withCredentials:true});
        if (categoriesResponse.data.success) {
          setCategories(categoriesResponse.data.data || []);
        }

        // Fetch venues
        const venuesResponse = await axios.get(`${BASE_URL}/api/venues/get-venue`,{withCredentials:true});
        if (venuesResponse.data.success) {
          setVenues(venuesResponse.data.data || []);
        }

      } catch (error) {
        console.log('Error fetching data:', error);
        setMessage({ type: 'error', text: 'Failed to load event data' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);


  const showMessage = (type, text, duration = 3000) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), duration);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setCurrentImage('');
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      showMessage('error', 'Event title is required');
      return false;
    }
    if (!formData.category.trim()) {
      showMessage('error', 'Category is required');
      return false;
    }

    if (!formData.startDate) {
      showMessage('error', 'Start date is required');
      return false;
    }

    if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      showMessage('error', 'End date cannot be before start date');
      return false;
    }

    if (!formData.normalPrice.price) {
      showMessage('error', 'Normal price is required');
      return false;
    }
    if (!formData.normalPrice.quantity) {
      showMessage('error', 'Quantity is required for Normal Ticket');
      return false;
    }
    if (!formData.vipPrice.price) {
      showMessage('error', 'VIP price is required');
      return false;
    }
    if (!formData.vipPrice.quantity) {
      showMessage('error', 'Quantity is required for VIP Ticket');
      return false;
    }
    if (formData.normalPrice.price && parseFloat(formData.normalPrice.price) < 0) {
      showMessage('error', 'Normal price cannot be negative');
      return false;
    }


    if (formData.vipPrice.price && parseFloat(formData.vipPrice.price) < 0) {
      showMessage('error', 'VIP price cannot be negative');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {

      const formDataToSend = new FormData();

      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description || '');

      if (formData.category) {
        formDataToSend.append('category', formData.category);
      }

      if (formData.venue) {
        formDataToSend.append('venue', formData.venue);
      }

      formDataToSend.append('startDate', new Date(formData.startDate).toISOString());

      if (formData.endDate) {
        formDataToSend.append('endDate', new Date(formData.endDate).toISOString());
      }

      if (formData.normalPrice.price || formData.normalPrice.price === '0') {
        const normalPriceData = {
          price: parseFloat(formData.normalPrice.price) || 0
        };
        if (formData.normalPrice.quantity || formData.normalPrice.quantity === '0') {
          normalPriceData.quantity = parseInt(formData.normalPrice.quantity) || 0;
        }
        formDataToSend.append('normalPrice', JSON.stringify(normalPriceData));
      }

      if (formData.vipPrice.price || formData.vipPrice.price === '0') {
        const vipPriceData = {
          price: parseFloat(formData.vipPrice.price) || 0
        };
        if (formData.vipPrice.quantity || formData.vipPrice.quantity === '0') {
          vipPriceData.quantity = parseInt(formData.vipPrice.quantity) || 0;
        }
        formDataToSend.append('vipPrice', JSON.stringify(vipPriceData));
      }

      formDataToSend.append('isPublished', formData.isPublished.toString());

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }


      const response = await axios.put(`${BASE_URL}/api/events/update-event/${id}`, formDataToSend, {withCredentials:true});

      if (response.data.success) {
        toastSuccess(response.data.message)
      } else {
        showMessage('error', response.data.message || 'Failed to update event');
      }
    } catch (error) {
      console.error('Event update error:', error);

      if (error.response) {
        const serverError = error.response.data;
        showMessage('error', serverError.message || 'Server error occurred');
      } else if (error.request) {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', 'An unexpected error occurred');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="ml-64 p-8 flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-blue-600 text-4xl" />
        <span className="ml-4 text-gray-600 text-lg">Loading event data...</span>
      </div>
    );
  }

  return (
    <div className="ml-64 p-8">
      {/* Message Alert */}
      {message.text && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md transform transition-transform duration-300 ${message.type === 'success'
          ? 'bg-green-100 text-green-800 border border-green-300'
          : message.type === 'error'
            ? 'bg-red-100 text-red-800 border border-red-300'
            : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
          }`}>
          <div className="flex items-center justify-between">
            <span>{message.text}</span>
            <button
              onClick={() => setMessage({ type: '', text: '' })}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/organizer/event-list`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition mb-6"
          >
            <FaArrowLeft />
            Back to Event
          </Link>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">Edit Event</h1>
          <p className="text-gray-600">Update the details of your event</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FaCalendarAlt className="text-blue-600" />
              Basic Information
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-lg"
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Describe your event..."
                />
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Event Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FaTag className="text-blue-600" />
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category._id || category.id} value={category._id || category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Venue */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-600" />
                  Venue
                </label>
                <select
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                >
                  <option value="">Select a venue</option>
                  {venues.map(venue => (
                    <option key={venue._id || venue.id} value={venue._id || venue.id}>
                      {venue.name} - {venue.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Pricing & Tickets</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Normal Ticket */}
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FaDollarSign className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Normal Tickets</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price ($)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        name="normalPrice.price"
                        value={formData.normalPrice.price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Quantity
                    </label>
                    <input
                      type="number"
                      name="normalPrice.quantity"
                      value={formData.normalPrice.quantity}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                      placeholder="Unlimited if empty"
                    />
                    <p className="text-xs text-gray-500 mt-2">Leave empty for unlimited tickets</p>
                  </div>
                </div>
              </div>

              {/* VIP Ticket */}
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FaCrown className="text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">VIP Tickets</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price ($)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        name="vipPrice.price"
                        value={formData.vipPrice.price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Quantity
                    </label>
                    <input
                      type="number"
                      name="vipPrice.quantity"
                      value={formData.vipPrice.quantity}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                      placeholder="Unlimited if empty"
                    />
                    <p className="text-xs text-gray-500 mt-2">Leave empty for unlimited tickets</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FaImage className="text-blue-600" />
              Event Image
            </h3>

            <div className="space-y-4">
              {/* Current Image or Preview */}
              {(currentImage || imagePreview) && (
                <div className="relative w-full max-w-md">
                  <img
                    src={imagePreview || currentImage}
                    alt="Event preview"
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                  >
                    <FaTimes />
                  </button>
                  <div className="mt-2 text-sm text-gray-500">
                    {imageFile ? 'New image selected' : 'Current image'}
                  </div>
                </div>
              )}

              {/* File Upload */}
              <div className={`border-2 ${(currentImage || imagePreview) ? 'border-gray-300' : 'border-dashed border-blue-400'} rounded-lg p-8 text-center transition-all hover:border-blue-500 cursor-pointer bg-gray-50`}>
                <input
                  type="file"
                  id="image-upload"
                  onChange={handleImageChange}
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  className="hidden"
                />
                <label htmlFor="image-upload" className="cursor-pointer block">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <FaUpload className="text-blue-600 text-2xl" />
                  </div>
                  <p className="text-gray-700 mb-2 text-lg">
                    {currentImage ? 'Change Image' : 'Upload Event Image'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Supports: JPEG, PNG, GIF, WebP (Max 5MB)
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Leave empty to keep current image
                  </p>
                </label>
              </div>
            </div>
          </div>

          {/* Publishing Options */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-8">
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                id="isPublished"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="w-5 h-5 mt-1 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <label htmlFor="isPublished" className="block text-lg font-medium text-gray-800 cursor-pointer">
                  Publish Event
                </label>
                <p className="text-gray-600 mt-2">
                  If checked, your event will be visible to the public.
                  If unchecked, it will be saved as a draft.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between gap-4 pt-6 border-t border-gray-200">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 cursor-pointer text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  // Reset form to initial values
                  if (window.confirm('Are you sure you want to reset all changes?')) {
                    window.location.reload();
                  }
                }}
                className="px-6 py-3 border cursor-pointer border-yellow-300 text-yellow-700 rounded-lg font-medium hover:bg-yellow-50 transition"
              >
                Reset Changes
              </button>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 cursor-pointer bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[160px]"
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <FaSave />
                  Update Event
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEvent;