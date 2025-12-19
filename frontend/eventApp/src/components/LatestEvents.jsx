// components/LatestEvents.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaTag, 
  FaDollarSign, 
  FaUsers,
  FaClock,
  FaTicketAlt,
  FaArrowRight,
  FaSpinner
} from 'react-icons/fa';
import { format, isPast, isFuture } from 'date-fns';
import { useEventContext } from '../context/EventContext';

const LatestEvents = () => {
  const {BASE_URL} = useEventContext()
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('upcoming');

  const navigate = useNavigate()

  useEffect(() => {
    fetchEvents();
  }, [activeFilter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let status = 'all';
      
      if (activeFilter === 'upcoming') {
        status = 'upcoming';
      } else if (activeFilter === 'trending') {
        status = 'published';
      }
      
      const response = await axios.get(`${BASE_URL}/api/events/get-all-events`, {
        params: {
          status: status,
          limit: 8 
        },
        withCredentials:true
      });
      
      if (response.data.success) {
       
        
        let eventsData = response.data.data || [];
        
          eventsData = eventsData.slice(0, 8);
        
        
        setEvents(eventsData);
      }
    } catch (err) {
       if(err.response){
          if(err.response.status === 401 || err.response.status === 403){
            navigate("/login")
          }
       }else{
        console.log("Server is not responding.");
       }
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'EEE, MMM dd • hh:mm a');
    } catch {
      return 'Date TBD';
    }
  };

  // Get event status
  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : null;

    if (!event.isPublished) return 'draft';
    if (isPast(startDate)) {
      if (endDate && isPast(endDate)) return 'completed';
      return 'ongoing';
    }
    if (isFuture(startDate)) return 'upcoming';
    return 'published';
  };

  // Get status badge
  const getStatusBadge = (event) => {
    const status = getEventStatus(event);
    const badges = {
      upcoming: { text: 'Upcoming', color: 'bg-green-100 text-green-800' },
      ongoing: { text: 'Live Now', color: 'bg-red-100 text-red-800' },
      completed: { text: 'Completed', color: 'bg-gray-100 text-gray-800' },
      draft: { text: 'Draft', color: 'bg-yellow-100 text-yellow-800' },
      published: { text: 'Published', color: 'bg-blue-100 text-blue-800' }
    };
    return badges[status] || badges.published;
  };

  // Format price
  const formatPrice = (event) => {
    if (event.normalPrice?.price > 0) {
      return `From $${event.normalPrice.price}`;
    } else if (event.normalPrice?.price === 0) {
      return 'Free';
    }
    return 'Price TBD';
  };

  // Get total capacity
  const getTotalCapacity = (event) => {
    const normal = event.normalPrice?.quantity || 0;
    const vip = event.vipPrice?.quantity || 0;
    return normal + vip;
  };

  return (
    <section className="py-16 px-4 md:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Discover <span className="text-green-600">Latest Events</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Find exciting events happening near you. From concerts to conferences, there's something for everyone.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white rounded-full p-1 shadow-md">
            <button
              onClick={() => setActiveFilter('upcoming')}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                activeFilter === 'upcoming'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Upcoming Events
            </button>
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                activeFilter === 'all'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-700 hover:text-green-600'
              }`}
            >
              All Events
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <FaSpinner className="animate-spin text-green-600 text-3xl" />
            <span className="ml-3 text-gray-600">Loading events...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow">
            <FaCalendarAlt className="text-gray-300 text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-800 mb-2">No events found</h3>
            <p className="text-gray-600">Check back later for upcoming events</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.map((event) => {
              const statusBadge = getStatusBadge(event);
              
              return (
                <div 
                  key={event.id} 
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group"
                >
                  {/* Event Image */}
                  <div className="relative h-48 overflow-hidden">
                    {event?.image ? (
                      <img
                        src={`${BASE_URL}/uploads/${event.image}`}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                        {statusBadge.text}
                      </span>
                    </div>
                    
                    {/* Category Badge */}
                    {event.category && (
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-black/70 text-white rounded-full text-xs font-medium backdrop-blur-sm">
                          {event.category.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Event Content */}
                  <div className="p-6">
                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
                      {event.title}
                    </h3>

                    {/* Date & Time */}
                    <div className="flex items-center text-gray-600 mb-3">
                      <FaClock className="mr-2 text-gray-400 shrink-0" />
                      <span className="text-sm">{formatDate(event.startDate)}</span>
                    </div>

                    {/* Location */}
                    {event.venue && (
                      <div className="flex items-center text-gray-600 mb-4">
                        <FaMapMarkerAlt className="mr-2 text-gray-400 shrink-0" />
                        <span className="text-sm truncate">
                          {event.venue.name}, {event.venue.city}
                        </span>
                      </div>
                    )}

                    {/* Pricing & Capacity */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <FaDollarSign className="text-green-500" />
                        <span className="font-bold text-gray-900">
                          {formatPrice(event)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <FaUsers className="text-blue-500" />
                        <span className="text-sm text-gray-600">
                          {getTotalCapacity(event)} spots
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link
                      to={`/user-event-detail/${event.id}`}
                      className="mt-6 w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2 group/btn"
                    >
                      View Details
                      <FaArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};

export default LatestEvents;