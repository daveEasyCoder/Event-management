// pages/CategoryEventsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaArrowLeft,
  FaTicketAlt,
  FaUser,
  FaTag,
  FaSpinner,
  FaExclamationCircle,
  FaDollarSign,
  FaUsers
} from 'react-icons/fa';
import { format, parseISO, isFuture, isPast } from 'date-fns';
import { useEventContext } from '../../context/EventContext';

const CategoryEventsPage = () => {
  const {BASE_URL} = useEventContext()
  const { categoryId } = useParams();
  const navigate = useNavigate();
  
  const [events, setEvents] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategoryEvents();
  }, [categoryId]);

  const fetchCategoryEvents = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`${BASE_URL}/api/events/get-eventByCategory/${categoryId}`,{withCredentials:true});
      
      if (response.data.success) {
        setEvents(response.data.events);
        setCategory(response.data.category);
        console.log(response.data);
        
      } else {
        setError('Failed to load events');
      }
    } catch (err) {
      console.error('Error fetching category events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  // Format time
  const formatTime = (dateString) => {
    try {
      return format(parseISO(dateString), 'hh:mm a');
    } catch {
      return 'Invalid time';
    }
  };

  // Get event status
  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : null;

    if (isFuture(startDate)) return 'upcoming';
    if (endDate && isPast(endDate)) return 'completed';
    return 'ongoing';
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      upcoming: { text: 'Upcoming', color: 'bg-green-100 text-green-800' },
      ongoing: { text: 'Live Now', color: 'bg-red-100 text-red-800' },
      completed: { text: 'Completed', color: 'bg-gray-100 text-gray-800' }
    };
    return badges[status] || badges.upcoming;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <FaSpinner className="animate-spin text-green-600 text-4xl" />
        <span className="ml-4 text-gray-600 text-lg">Loading events...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <FaExclamationCircle className="text-red-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Events</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={fetchCategoryEvents}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
            >
              Try Again
            </button>
            <Link
              to="/"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-linear-to-r from-green-600 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition mb-6"
          >
            <FaArrowLeft />
            Back to Categories
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <FaTag className="text-2xl" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {category?.name || 'Category'} Events
              </h1>
              <p className="text-white/80">
                {events.length} {events.length === 1 ? 'event' : 'events'} available
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <FaCalendarAlt className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Events Found</h3>
            <p className="text-gray-600 mb-6">
              There are currently no events available in this category.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
            >
              <FaArrowLeft />
              Browse All Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const status = getEventStatus(event);
              const statusBadge = getStatusBadge(status);
              
              return (
                <div 
                  key={event._id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Event Image */}
                  <div className="relative h-48">
                    {event.image ? (
                      <img
                        src={`${BASE_URL}/uploads/${event.image}`}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                        <FaCalendarAlt className="text-white text-4xl" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge.color}`}>
                        {statusBadge.text}
                      </span>
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="p-6">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                      {event.title}
                    </h3>
                    
                    {/* Organizer */}
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <FaUser className="text-sm" />
                      <span className="text-sm">{event.organizer?.name || 'Unknown'}</span>
                    </div>

                    {/* Event Details */}
                    <div className="space-y-3 mb-4">
                      {/* Date & Time */}
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <FaCalendarAlt className="text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{formatDate(event.startDate)}</p>
                          <p className="text-sm text-gray-600">{formatTime(event.startDate)}</p>
                        </div>
                      </div>

                      {/* Venue */}
                      {event.venue && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <FaMapMarkerAlt className="text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{event.venue.name}</p>
                            <p className="text-sm text-gray-600">{event.venue.city}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Ticket Info */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <FaTicketAlt className="text-gray-400" />
                          <span className="text-sm text-gray-600">Tickets:</span>
                        </div>
                        <div className="flex gap-2">
                          {event.hasNormalTicket && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              Normal: ${event.normalPrice?.price || 0}
                            </span>
                          )}
                          {event.hasVipTicket && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                              VIP: ${event.vipPrice?.price || 0}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Available Tickets */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <FaUsers className="text-xs" />
                          <span>Available: {event.totalTickets - event.ticketSold}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaDollarSign className="text-xs" />
                          <span>From ${Math.min(
                            event.normalPrice?.price || Infinity,
                            event.vipPrice?.price || Infinity
                          )}</span>
                        </div>
                      </div>
                    </div>

                    {/* View Event Button */}
                    <button
                      onClick={() => navigate(`/user-event-detail/${event._id}`)}
                      className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                      View Event Details
                      <span className="text-white/80">→</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryEventsPage;