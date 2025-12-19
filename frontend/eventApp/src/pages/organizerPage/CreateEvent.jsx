// pages/CreateEvent.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaSpinner, FaCalendar, FaTag, FaMapMarkerAlt, FaImage, FaDollarSign, FaCrown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useEventContext } from '../../context/EventContext';
import { toastSuccess } from '../../../utility/toast';


const CreateEvent = () => {

    const { BASE_URL } = useEventContext()
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [categories, setCategories] = useState([]);
    const [venues, setVenues] = useState([]);

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
    const [image, setImage] = useState(null);


    useEffect(() => {
        fetchCategories();
        fetchVenues();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/categories/get-category`,{withCredentials:true});
            if (res.data.success) {
                setCategories(res.data.categories || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchVenues = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/venues/get-venue`,{withCredentials:true});
            if (res.data.success) {
                setVenues(res.data.venues || []);
            }
        } catch (error) {
            console.error('Error fetching venues:', error);
        }
    };

    const showMessage = (type, text, duration = 3000) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), duration);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes('.')) {
            // Handle nested objects (normalPrice.price, vipPrice.quantity, etc.)
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'number' ? parseFloat(value) || '' : value
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
            setImage(file)
        }
    };

    const validateForm = () => {
        if (!formData.title.trim()) {
            showMessage('error', 'Event title is required');
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
        if (formData.normalPrice.price && formData.normalPrice.price < 0) {
            showMessage('error', 'Normal price cannot be negative');
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
        if (formData.vipPrice.price && formData.vipPrice.price < 0) {
            showMessage('error', 'VIP price cannot be negative');
            return false;
        }
        if (!formData.venue) {
            showMessage('error', 'Venue is required');
            return false
        }
        if (!formData.category) {
            showMessage('error', 'Category is required');
            return false
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

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

            if(formData.startDate){
              formDataToSend.append('startDate', new Date(formData.startDate).toISOString());
            }

            if (formData.endDate) {
                formDataToSend.append('endDate', new Date(formData.endDate).toISOString());
            }

            if (formData.normalPrice.price) {
                const normalPriceData = {
                    price: parseFloat(formData.normalPrice.price)
                };
                if (formData.normalPrice.quantity) {
                    normalPriceData.quantity = parseInt(formData.normalPrice.quantity);
                }
                formDataToSend.append('normalPrice', JSON.stringify(normalPriceData));
            }

            if (formData.vipPrice.price) {
                const vipPriceData = {
                    price: parseFloat(formData.vipPrice.price)
                };
                if (formData.vipPrice.quantity) {
                    vipPriceData.quantity = parseInt(formData.vipPrice.quantity);
                }
                formDataToSend.append('vipPrice', JSON.stringify(vipPriceData));
            }

            formDataToSend.append('isPublished', formData.isPublished.toString());
            if(image){
                formDataToSend.append('image', image);
            }


              const res = await axios.post(`${BASE_URL}/api/events/create-event`, formDataToSend,{withCredentials:true});

              if (res.data.success) {
               toastSuccess(res.data.message)
               navigate("/organizer/event-list")

              } else {
                showMessage('error', res.data.message || 'Failed to create event');
              }
        } catch (error) {
            console.error('Event creation error:', error);
            showMessage('error', error.response?.data?.message || 'Server error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ml-60 p-8 pt-20">

            <div className="max-w-4xl">
                <div className="bg-white rounded-xl shadow-sm p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Create New Event</h1>
                        <p className="text-gray-600">Fill in the details below to create a new event</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Information Section */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <FaCalendar className="text-blue-600" />
                                Basic Information
                            </h2>

                            <div className="space-y-6">
                                {/* Event Title */}
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

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="4"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        placeholder="Describe your event..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Event Details Section */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Event Details</h2>

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
                                            <option key={category._id} value={category._id}>
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
                                            <option key={venue._id} value={venue._id}>
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

                        {/* Pricing Section */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">Pricing & Tickets</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Normal Ticket */}
                                <div className="border border-gray-200 rounded-lg p-6 bg-white">
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
                                                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
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
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                placeholder="Unlimited if empty"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* VIP Ticket */}
                                <div className="border border-gray-200 rounded-lg p-6 bg-white">
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
                                                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
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
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                placeholder="Unlimited if empty"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Image Upload & Publishing Section */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Image Upload */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <FaImage className="text-blue-600" />
                                        Event Image
                                    </h3>

                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                                        <input
                                            type="file"
                                            id="image-upload"
                                            onChange={handleImageChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <label htmlFor="image-upload" className="cursor-pointer">
                                            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                                <FaImage className="text-blue-600 text-xl" />
                                            </div>
                                            <p className="text-gray-700 mb-2">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                PNG, JPG, GIF up to 5MB
                                            </p>
                                        </label>
                                    </div>

                                    {formData.images && (
                                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <p className="text-green-700 text-sm">
                                                <span className="font-semibold">Selected:</span> {formData.images}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Publishing Options */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Publishing</h3>

                                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="isPublished"
                                                checked={formData.isPublished}
                                                onChange={handleChange}
                                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            <div>
                                                <span className="font-medium text-gray-800">Publish Event</span>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Make this event visible to the public immediately
                                                </p>
                                            </div>
                                        </label>

                                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                            <p className="text-sm text-blue-700">
                                                <span className="font-semibold">Note:</span> Unpublished events are saved as drafts and can be published later.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Message Alert */}
                        {message.text && (
                            <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-red-100 text-red-700 border border-red-200'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                                disabled={loading}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[160px]"
                            >
                                {loading ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <FaPlus />
                                        Create Event
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

export default CreateEvent;