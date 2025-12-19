// pages/VenueEventsPage.jsx
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
  FaUsers,
  FaBuilding,
  FaChair,
  FaGlobe,
  FaClock
} from 'react-icons/fa';
import { format, parseISO, isFuture, isPast } from 'date-fns';
import { useEventContext } from '../../context/EventContext';

const VenueEventsPage = () => {

  const {BASE_URL} = useEventContext()
  const { venueId } = useParams();
  const navigate = useNavigate();
  console.log("venue id is:" + venueId);
  
  
  const [events, setEvents] = useState([]);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVenueEvents();
  }, [venueId]);

  const fetchVenueEvents = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`${BASE_URL}/api/events/get-event-by-venue/${venueId}`,{withCredentials:true});
      
      if (response.data.success) {
        setEvents(response.data.events);
        setVenue(response.data.venue);
      } else {
        setError('Failed to load events');
      }
    } catch (err) {
      console.error('Error fetching venue events:', err);
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

  // Get upcoming events count
  const getUpcomingEventsCount = () => {
    const now = new Date();
    return events.filter(event => {
      const startDate = new Date(event.startDate);
      return isFuture(startDate);
    }).length;
  };

  // Get ongoing events count
  const getOngoingEventsCount = () => {
    const now = new Date();
    return events.filter(event => {
      const startDate = new Date(event.startDate);
      const endDate = event.endDate ? new Date(event.endDate) : null;
      
      if (startDate <= now) {
        if (endDate && endDate >= now) return true;
        if (!endDate) return true;
      }
      return false;
    }).length;
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
              onClick={fetchVenueEvents}
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
     
      <div className="bg-linear-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition mb-6"
          >
            <FaArrowLeft />
            Back to Venues
          </button>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
            <div className="lg:col-span-2">
              <div className="flex items-start gap-6 mb-6">
                <div className="shrink-0">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/20 flex items-center justify-center">
                    {venue?.image ? (
                      <img
                        src={`${BASE_URL}/uploads/${venue.image}`}
                        alt={venue.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaBuilding className="text-3xl" />
                    )}
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">{venue?.name || 'Venue'}</h1>
                  <div className="flex items-center gap-4 text-white/80">
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt />
                      <span>{venue?.city || 'City'}, {venue?.country || 'Country'}</span>
                    </div>
                    {venue?.capacity && (
                      <div className="flex items-center gap-2">
                        <FaUsers />
                        <span>Capacity: {venue.capacity.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {venue?.address && (
                <div className="bg-white/10 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="mt-1" />
                    <div>
                      <p className="font-medium mb-1">Address</p>
                      <p className="text-white/80">{venue.address}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Venue Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Events</span>
                  <span className="text-2xl font-bold">{events.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Upcoming</span>
                  <span className="text-xl font-bold text-green-300">{getUpcomingEventsCount()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Ongoing</span>
                  <span className="text-xl font-bold text-red-300">{getOngoingEventsCount()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Completed</span>
                  <span className="text-xl font-bold text-gray-300">
                    {events.length - getUpcomingEventsCount() - getOngoingEventsCount()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Events at {venue?.name}
          </h2>
          <p className="text-gray-600">
            {events.length} {events.length === 1 ? 'event' : 'events'} found
          </p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <FaCalendarAlt className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Events Found</h3>
            <p className="text-gray-600 mb-6">
              There are currently no events scheduled at this venue.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
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
                          e.target.src = '/imageNotFound.png';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                        <FaCalendarAlt className="text-white text-4xl" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge.color}`}>
                        {statusBadge.text}
                      </span>
                    </div>

                    {/* Category Badge */}
                    {event.category && (
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                          {event.category.name}
                        </span>
                      </div>
                    )}
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
                      <span className="text-sm">{event.organizer?.name || 'Unknown Organizer'}</span>
                    </div>

                    {/* Event Details */}
                    <div className="space-y-3 mb-4">
                      {/* Date & Time */}
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FaCalendarAlt className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{formatDate(event.startDate)}</p>
                          <p className="text-sm text-gray-600">{formatTime(event.startDate)}</p>
                        </div>
                      </div>

                      {/* Duration if endDate exists */}
                      {event.endDate && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            <FaClock className="text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">Duration</p>
                            <p className="text-sm text-gray-600">
                              {formatTime(event.startDate)} - {formatTime(event.endDate)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Ticket Info */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <FaTicketAlt className="text-gray-400" />
                          <span className="text-sm text-gray-600">Ticket Prices:</span>
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
                          <FaChair className="text-xs" />
                          <span>
                            Available: {event.totalTickets - event.ticketsSold}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaDollarSign className="text-xs" />
                          <span>From ${event.minPrice}</span>
                        </div>
                      </div>
                    </div>

                    {/* View Event Button */}
                    <button
                      onClick={() => navigate(`/user-event-detail/${event._id}`)}
                      className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
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

export default VenueEventsPage;