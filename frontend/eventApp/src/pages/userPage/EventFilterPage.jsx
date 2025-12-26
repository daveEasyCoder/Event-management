// EventFilterPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Calendar, MapPin, Tag, User, Filter, X, ChevronUp, ChevronDown, Upload } from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { useNavigate } from 'react-router-dom';

const EventFilterPage = () => {

  const { BASE_URL } = useEventContext()
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const navigate = useNavigate()

  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    category: 'all',
    dateRange: 'all',
    organizer: '',
    venue: 'all',
    priceRange: { min: 0, max: 10000 },
    sortBy: 'createdAt',
    sortOrder: 'desc',
    isPublished: 'all'
  });

  // Sample data (replace with API calls)
  const categories = [
    'Music', 'Sports', 'Arts', 'Business', 'Technology',
    'Food & Drink', 'Health', 'Education', 'Other'
  ];

  const venues = [
    { id: 1, name: 'Madison Square Garden', city: 'New York' },
    { id: 2, name: 'Staples Center', city: 'Los Angeles' },
    { id: 3, name: 'Wembley Stadium', city: 'London' },
    { id: 4, name: 'Sydney Opera House', city: 'Sydney' }
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Next 7 Days' },
    { value: 'month', label: 'This Month' },
    { value: 'past', label: 'Past Events' },
    { value: 'future', label: 'Upcoming Events' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'startDate', label: 'Event Date' },
    { value: 'title', label: 'Title' },
    { value: 'normalPrice', label: 'Price' }
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Replace with your actual API call
      const response = await axios.get(`${BASE_URL}/api/events/get-all-events`, { withCredentials: true });
      if (response.data.success) {
        // console.log(response.data);
        
        setEvents(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];
  

    // Search filter
    if (filters.search.trim()) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(event =>
        event.category?.name === filters.category || event.category === filters.category
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      const now = new Date();

      switch (filters.status) {
        case 'draft':
          filtered = filtered.filter(event => !event.isPublished);
          break;
        case 'published':
          filtered = filtered.filter(event => event.isPublished);
          break;
        case 'upcoming':
          filtered = filtered.filter(event =>
            event.isPublished && new Date(event.startDate) > now
          );
          break;
        case 'ongoing':
          filtered = filtered.filter(event => {
            const startDate = new Date(event.startDate);
            const endDate = event.endDate ? new Date(event.endDate) : null;
            return (
              event.isPublished &&
              startDate <= now &&
              (!endDate || endDate > now)
            );
          });
          break;
        case 'completed':
          filtered = filtered.filter(event =>
            event.isPublished &&
            event.endDate &&
            new Date(event.endDate) < now
          );
          break;
        case 'cancelled':
          filtered = filtered.filter(event => event.status === 'cancelled');
          break;
      }
    }

   

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();

      switch (filters.dateRange) {
        case 'today':
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          const todayEnd = new Date();
          todayEnd.setHours(23, 59, 59, 999);
          filtered = filtered.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate >= todayStart && eventDate <= todayEnd;
          });
          break;
        case 'week':
          const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate >= now && eventDate <= weekEnd;
          });
          break;
        case 'month':
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          filtered = filtered.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate >= now && eventDate <= monthEnd;
          });
          break;
        case 'past':
          filtered = filtered.filter(event =>
            new Date(event.startDate) < now
          );
          break;
        case 'future':
          filtered = filtered.filter(event =>
            new Date(event.startDate) > now
          );
          break;
      }
    }

  

    // Organizer filter
    if (filters.organizer.trim()) {
      filtered = filtered.filter(event =>
        event.organizer?.name?.toLowerCase().includes(filters.organizer.toLowerCase()) ||
        event.organizer?.email?.toLowerCase().includes(filters.organizer.toLowerCase())
      );
    }

    // Venue filter
    if (filters.venue !== 'all') {
      filtered = filtered.filter(event =>
        event.venue?.name === filters.venue || event.venue === filters.venue
      );
    }

    // Price range filter
    filtered = filtered.filter(event => {
      const price = event.normalPrice.price || event.vipPrice.price || 0;
      return price >= filters.priceRange.min && price <= filters.priceRange.max;
    });

         console.log(filtered);
    // Published status filter
    if (filters.isPublished !== 'all') {
      filtered = filtered.filter(event =>
        filters.isPublished === 'yes' ? event.isPublished : !event.isPublished
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (filters.sortBy) {
        case 'startDate':
          aValue = new Date(a.startDate);
          bValue = new Date(b.startDate);
          break;
        case 'normalPrice':
          aValue = a.normalPrice || 0;
          bValue = b.normalPrice || 0;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    

    setFilteredEvents(filtered);
  };




  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handlePriceChange = (type, value) => {
    const numValue = parseInt(value) || 0;
    setFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [type]: numValue
      }
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      category: 'all',
      dateRange: 'all',
      organizer: '',
      venue: 'all',
      priceRange: { min: 0, max: 1000 },
      sortBy: 'createdAt',
      sortOrder: 'desc',
      isPublished: 'all'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : null;

    if (event.status === 'cancelled') {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Cancelled</span>;
    }

    if (!event.isPublished) {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Draft</span>;
    }

    if (startDate > now) {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Upcoming</span>;
    }

    if (startDate <= now && (!endDate || endDate > now)) {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Ongoing</span>;
    }

    if (endDate && endDate < now) {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Completed</span>;
    }

    return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Published</span>;
  };


  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'priceRange') return value.min > 0 || value.max < 1000;
    if (key === 'sortBy' || key === 'sortOrder') return false;
    return value !== '' && value !== 'all';
  }).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Events</h1>
              <p className="text-gray-600 mt-1">
                {loading ? 'Loading events...' : `Found ${filteredEvents.length} events`}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {activeFiltersCount} active filter{activeFiltersCount !== 1 ? 's' : ''}
                </span>
              </div>

              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Reset Filters
              </button>

              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="md:hidden flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showMobileFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Events
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by title..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="inline-block w-4 h-4 mr-1" />
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline-block w-4 h-4 mr-1" />
                  Date Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {dateRangeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Organizer */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline-block w-4 h-4 mr-1" />
                  Organizer
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search organizer..."
                    value={filters.organizer}
                    onChange={(e) => handleFilterChange('organizer', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Venue */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline-block w-4 h-4 mr-1" />
                  Venue
                </label>
                <select
                  value={filters.venue}
                  onChange={(e) => handleFilterChange('venue', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Venues</option>
                  {venues.map(venue => (
                    <option key={venue.id} value={venue.name}>
                      {venue.name}, {venue.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (${filters.priceRange.min} - ${filters.priceRange.max})
                </label>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      value={filters.priceRange.min}
                      onChange={(e) => handlePriceChange('min', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      value={filters.priceRange.max}
                      onChange={(e) => handlePriceChange('max', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Max"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={filters.priceRange.min}
                    onChange={(e) => handlePriceChange('min', e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={filters.priceRange.max}
                    onChange={(e) => handlePriceChange('max', e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <div className="flex gap-2">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {filters.sortOrder === 'asc' ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Published Status */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Published Status
                </label>
                <select
                  value={filters.isPublished}
                  onChange={(e) => handleFilterChange('isPublished', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All</option>
                  <option value="yes">Published Only</option>
                  <option value="no">Drafts Only</option>
                </select>
              </div>

              <button
                onClick={resetFilters}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Events Grid */}
          <div className="flex-1">
            {/* Mobile Filter Toggle */}
            {showMobileFilters && (
              <div className="lg:hidden mb-6">
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
                >
                  <X className="w-4 h-4" />
                  Hide Filters
                </button>
              </div>
            )}

            {/* Active Filters */}
            <div className="mb-6 flex flex-wrap gap-2">
              {filters.search && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  Search: "{filters.search}"
                  <button onClick={() => handleFilterChange('search', '')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.category !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  Category: {filters.category}
                  <button onClick={() => handleFilterChange('category', 'all')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.status !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                  Status: {statusOptions.find(o => o.value === filters.status)?.label}
                  <button onClick={() => handleFilterChange('status', 'all')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.dateRange !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                  Date: {dateRangeOptions.find(o => o.value === filters.dateRange)?.label}
                  <button onClick={() => handleFilterChange('dateRange', 'all')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {(filters.priceRange.min > 0 || filters.priceRange.max < 1000) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                  Price: ${filters.priceRange.min} - ${filters.priceRange.max}
                  <button onClick={() => handlePriceChange('min', 0) || handlePriceChange('max', 1000)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            {/* Events */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredEvents.map(event => (
                  <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    {/* Event Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={`${BASE_URL}/uploads/${event.image}`}
                        alt={event.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        {getStatusBadge(event)}
                      </div>
                    </div>

                    {/* Event Content */}
                    <div className="p-5">
                      <div className="mb-3">
                        <span className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          {event.category?.name || event.category}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                        {event.title}
                      </h3>

                      {/* Event Details */}
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(event.startDate)}</span>
                        </div>

                        {event.venue && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>
                              {event.venue.name || event.venue}{event.venue.city ? `, ${event.venue.city}` : ''}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{event.organizer?.name || event.organizer}</span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div className="font-medium text-gray-900">
                            ${event.normalPrice.price || event.vipPrice.price}
                            {event.vipPrice.price && event.normalPrice.price && (
                              <span className="text-gray-500 text-sm ml-1">- ${event.vipPrice.price}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/user-event-detail/${event.id}`)} className="flex-1 px-4 py-2 cursor-pointer text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventFilterPage;