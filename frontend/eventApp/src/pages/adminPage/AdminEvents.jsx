// pages/admin/EventListPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaEye,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaSpinner,
  FaArrowLeft,
  FaPlus,
  FaTag,
  FaUser,
  FaCheckCircle,
  FaClock,
  FaCalendar,
  FaTicketAlt,
  FaEllipsisV
} from 'react-icons/fa';
import { useEventContext } from '../../context/EventContext';
import {toastSuccess} from '../../../utility/toast.js'

const AdminEventListPage = () => {
  const navigate = useNavigate();
  const {BASE_URL} = useEventContext()
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    dateRange: 'all'
  });
  
  // Fetch categories for filter
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(null);

  useEffect(() => {
    fetchEvents();
    fetchCategories();
  }, [filters, searchTerm]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        ...filters
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await axios.get(`${BASE_URL}/api/events/get-all-events?${params}`, {
        withCredentials: true
      });

      if (response.data.success) {
        setEvents(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/categories/get-category`, {
        withCredentials: true
      });
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleTogglePublish = async (eventId, currentStatus) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/admin/update-publish-status/${eventId}`,
        { isPublished: !currentStatus },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Update local state
        setEvents(events.map(event => 
          event.id === eventId 
            ? { ...event, isPublished: !currentStatus }
            : event
        ));
        let msg = response.data.isPublished ? 'Event published Successfully' : 'Event Unpublished Successfully' 
        toastSuccess(msg)
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('Failed to update event status');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const response = await axios.delete(`${BASE_URL}/api/events/delete-event/${eventId}`, {
        withCredentials: true
      });

      if (response.data.success) {
        setEvents(events.filter(event => event.id !== eventId));
        toastSuccess(response.data?.message || "Event deleted Successfully")
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : null;

    if (!event.isPublished) return 'draft';
    if (startDate > now) return 'upcoming';
    if (endDate && endDate < now) return 'completed';
    if (startDate <= now && (!endDate || endDate >= now)) return 'ongoing';
    return 'published';
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: { text: 'Draft', color: 'bg-gray-100 text-gray-800', icon: <FaClock /> },
      published: { text: 'Published', color: 'bg-green-100 text-green-800', icon: <FaCheckCircle /> },
      upcoming: { text: 'Upcoming', color: 'bg-blue-100 text-blue-800', icon: <FaCalendar /> },
      ongoing: { text: 'Ongoing', color: 'bg-yellow-100 text-yellow-800', icon: <FaCalendarAlt /> },
      completed: { text: 'Completed', color: 'bg-purple-100 text-purple-800', icon: <FaCheckCircle /> }
    };
    return badges[status] || badges.draft;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Calculate available tickets
  const getAvailableTickets = (event) => {
    const normal = event.normalPrice?.quantity || 0;
    const vip = event.vipPrice?.quantity || 0;
    return normal + vip;
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilters({ status: 'all', category: 'all', dateRange: 'all' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 ml-60 pt-20">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4"
        >
          <FaArrowLeft />
          <span className="hidden sm:inline">Back to Dashboard</span>
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Event Management</h1>
            <p className="text-gray-600 text-sm md:text-base">
              {events.length} events found
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 md:hidden"
            >
              <FaFilter />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      <div className="md:hidden mb-4">
        {showFilters && (
          <div className="bg-white rounded-lg shadow p-4 mb-4 space-y-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="past">Past Events</option>
                <option value="future">Future Events</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <div className="pt-2">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:block bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="past">Past Events</option>
              <option value="future">Future Events</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-blue-600 text-3xl" />
            <span className="ml-3 text-gray-600">Loading events...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FaCalendarAlt className="text-gray-300 text-4xl mx-auto mb-3" />
            <p className="text-gray-500">No events found</p>
            {(searchTerm || filters.status !== 'all' || filters.category !== 'all' || filters.dateRange !== 'all') && (
              <button
                onClick={clearFilters}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear filters to see all events
              </button>
            )}
          </div>
        ) : (
          events.map((event) => {
            const status = getEventStatus(event);
            const statusBadge = getStatusBadge(status);
            const availableTickets = getAvailableTickets(event);
            
            return (
              <div key={event.id} className="bg-white rounded-lg shadow overflow-hidden">
                {/* Desktop View */}
                <div className="hidden md:block">
                  <div className="p-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Event Image and Title */}
                      <div className="col-span-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 shrink-0">
                            {event.image ? (
                              <img
                                src={`${BASE_URL}/uploads/${event.image}`}
                                alt={event.title}
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = `/Placeholder.png`;
                                }}
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                <FaCalendarAlt className="text-gray-500 text-xl" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <FaCalendarAlt className="text-xs" />
                              <span>{formatDate(event.startDate)}</span>
                              <span>•</span>
                              <span>{formatTime(event.startDate)}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              {event.category && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                  <FaTag className="text-xs" />
                                  {event.category.name}
                                </span>
                              )}
                              {event.venue && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                  <FaMapMarkerAlt className="text-xs" />
                                  {event.venue.city}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Ticket Info */}
                      <div className="col-span-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Available:</span>
                            <span className="font-medium">{availableTickets}</span>
                          </div>
                          <div className="space-y-1">
                            {event.normalPrice?.price > 0 && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Normal:</span>
                                <span className="font-medium">{formatCurrency(event.normalPrice.price)}</span>
                              </div>
                            )}
                            {event.vipPrice?.price > 0 && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">VIP:</span>
                                <span className="font-medium">{formatCurrency(event.vipPrice.price)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <div className="space-y-2">
                          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusBadge.color}`}>
                            {statusBadge.icon}
                            {statusBadge.text}
                          </div>
                          <button
                            onClick={() => handleTogglePublish(event.id, event.isPublished)}
                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs w-full justify-center ${
                              event.isPublished
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            {event.isPublished ? (
                              <>
                                <FaToggleOn className="text-lg" />
                                <span>Published</span>
                              </>
                            ) : (
                              <>
                                <FaToggleOff className="text-lg" />
                                <span>Unpublished</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="col-span-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => navigate(`/events/${event.id}`)}
                            className="px-3 py-2  bg-blue-100 text-blue-800 text-sm cursor-pointer rounded-lg hover:bg-blue-200 transition flex items-center gap-2"
                          >
                            <FaEye />
                            <span>View</span>
                          </button>
            
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="px-3 py-2 bg-red-100 text-red-800 text-sm cursor-pointer rounded-lg hover:bg-red-200 transition flex items-center gap-2"
                          >
                            <FaTrash />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile View */}
                <div className="md:hidden">
                  <div className="p-4">
                    {/* Header with title and menu */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-12 h-12 shrink-0">
                          {event.image ? (
                            <img
                              src={`${BASE_URL}/uploads/${event.image}`}
                              alt={event.title}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `/Placeholder.png`;
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <FaCalendarAlt className="text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900">{event.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <FaCalendarAlt className="text-xs" />
                            <span>{formatDate(event.startDate)}</span>
                            <span>•</span>
                            <span>{formatTime(event.startDate)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Mobile Menu Button */}
                      <button
                        onClick={() => setMobileMenuOpen(mobileMenuOpen === event.id ? null : event.id)}
                        className="p-2 text-gray-500 hover:text-gray-700"
                      >
                        <FaEllipsisV />
                      </button>
                    </div>

                    {/* Status and Publish Toggle */}
                    <div className="flex items-center justify-between mb-3">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusBadge.color}`}>
                        {statusBadge.icon}
                        {statusBadge.text}
                      </div>
                      <button
                        onClick={() => handleTogglePublish(event.id, event.isPublished)}
                        className={`flex items-center gap-1 px-3 py-1 rounded text-sm ${
                          event.isPublished
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {event.isPublished ? (
                          <>
                            <FaToggleOn className="text-lg" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <FaToggleOff className="text-lg" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Ticket Info */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Available Tickets</p>
                          <p className="font-semibold text-gray-800">{availableTickets}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Prices</p>
                          <div className="space-y-1">
                            {event.normalPrice?.price > 0 && (
                              <p className="text-sm text-gray-800">
                                Normal: {formatCurrency(event.normalPrice.price)}
                              </p>
                            )}
                            {event.vipPrice?.price > 0 && (
                              <p className="text-sm text-gray-800">
                                VIP: {formatCurrency(event.vipPrice.price)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {event.category && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          <FaTag className="text-xs" />
                          {event.category.name}
                        </span>
                      )}
                      {event.venue && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                          <FaMapMarkerAlt className="text-xs" />
                          {event.venue.name}
                        </span>
                      )}
                      {event.organizer && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          <FaUser className="text-xs" />
                          {event.organizer.name}
                        </span>
                      )}
                    </div>

                    {/* Mobile Menu Dropdown */}
                    {mobileMenuOpen === event.id && (
                      <div className="absolute right-4 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        <button
                          onClick={() => {
                            navigate(`/events/${event.id}`);
                            setMobileMenuOpen(null);
                          }}
                          className="flex items-center cursor-pointer gap-2 w-full px-4 py-3 text-left hover:bg-gray-50 text-gray-700"
                        >
                          <FaEye className="text-blue-600" />
                          View Event
                        </button>
                 
                        <button
                          onClick={() => {
                            handleDeleteEvent(event.id);
                            setMobileMenuOpen(null);
                          }}
                          className="flex items-center cursor-pointer gap-2 w-full px-4 py-3 text-left hover:bg-gray-50 text-red-600"
                        >
                          <FaTrash />
                          Delete Event
                        </button>
                      </div>
                    )}

                    {/* Action Buttons (when menu is closed) */}
                    {mobileMenuOpen !== event.id && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/events/${event.id}`)}
                          className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                        >
                          <FaEye />
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/admin/events/${event.id}/edit`)}
                          className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                        >
                          <FaEdit />
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Stats - Mobile & Desktop */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-lg shadow p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaCalendarAlt className="text-blue-600 text-sm md:text-base" />
            </div>
            <div>
              <p className="text-lg md:text-2xl font-bold text-gray-800">
                {events.filter(e => e.isPublished).length}
              </p>
              <p className="text-xs md:text-sm text-gray-600">Published</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FaClock className="text-yellow-600 text-sm md:text-base" />
            </div>
            <div>
              <p className="text-lg md:text-2xl font-bold text-gray-800">
                {events.filter(e => !e.isPublished).length}
              </p>
              <p className="text-xs md:text-sm text-gray-600">Drafts</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaTicketAlt className="text-green-600 text-sm md:text-base" />
            </div>
            <div>
              <p className="text-lg md:text-2xl font-bold text-gray-800">
                {events.reduce((sum, event) => sum + getAvailableTickets(event), 0)}
              </p>
              <p className="text-xs md:text-sm text-gray-600">Available Tickets</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FaUsers className="text-purple-600 text-sm md:text-base" />
            </div>
            <div>
              <p className="text-lg md:text-2xl font-bold text-gray-800">
                {new Set(events.map(e => e.organizer?.id)).size}
              </p>
              <p className="text-xs md:text-sm text-gray-600">Organizers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEventListPage;