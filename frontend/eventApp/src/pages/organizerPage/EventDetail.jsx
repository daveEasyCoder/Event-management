// pages/EventDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaTag, 
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaDollarSign,
  FaUsers,
  FaClock,
  FaUser,
  FaImage,
  FaShare,
  FaPrint,
  FaCheckCircle,
  FaTimesCircle,
  FaGlobe,
  FaPhone,
  FaEnvelope,
  FaTicketAlt
} from 'react-icons/fa';
import { format, parseISO, isPast, isFuture } from 'date-fns';
import { useEventContext } from '../../context/EventContext';
import { toastSuccess } from '../../../utility/toast';


const EventDetail = () => {
 
  const {BASE_URL} = useEventContext()
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/api/events/get-eventById/${id}`,{withCredentials:true});
        
        if (response.data.success) {
          setEvent(response.data.event);
        } else {
          setError('Event not found');
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  // Handle delete
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await axios.delete(`${BASE_URL}/api/events/delete-event/${id}`,{withCredentials:true});
      
      if (response.data.success) {
        toastSuccess(response.data.message)
        navigate('/organizer/event-list'); 
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'EEEE, MMMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

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

    if (!event.isPublished) return { type: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' };
    if (isPast(startDate)) {
      if (endDate && isPast(endDate)) return { type: 'completed', label: 'Completed', color: 'bg-purple-100 text-purple-800' };
      return { type: 'ongoing', label: 'Ongoing', color: 'bg-yellow-100 text-yellow-800' };
    }
    if (isFuture(startDate)) return { type: 'upcoming', label: 'Upcoming', color: 'bg-green-100 text-green-800' };
    return { type: 'published', label: 'Published', color: 'bg-blue-100 text-blue-800' };
  };

  // Share event
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: event?.description || 'Check out this event!',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch(() => alert('Failed to copy link'));
    }
  };

  // Print event details
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="ml-64 p-8 flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-blue-600 text-4xl" />
        <span className="ml-4 text-gray-600 text-lg">Loading event details...</span>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Event Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The event you are looking for does not exist.'}</p>
            <Link
              to="/organizer/event-list"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              <FaArrowLeft />
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const status = getEventStatus(event);

  return (
    <div className="ml-64 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8">
          <Link
            to="/organizer/event-list"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition mb-6"
          >
            <FaArrowLeft />
            Back to Events
          </Link>
          
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-bold text-gray-800">{event.title}</h1>
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${status.color}`}>
                  {status.label}
                </span>
              </div>
              <p className="text-gray-600">
                Created on {formatDate(event.createdAt)} • Last updated on {formatDate(event.updatedAt)}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleShare}
                className="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                title="Share"
              >
                <FaShare />
              </button>
              <button
                onClick={handlePrint}
                className="p-3 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                title="Print"
              >
                <FaPrint />
              </button>
              <Link
                to={`/organizer/edit-event/${id}`}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                <FaEdit />
                Edit Event
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Image */}
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
              {event.image ? (
                <img
                  src={`${BASE_URL}/uploads/${event?.image}`}
                  alt={event.title}
                  className="w-full h-96 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/800x400?text=Event+Image';
                  }}
                />
              ) : (
                <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
                  <FaImage className="text-gray-300 text-6xl" />
                </div>
              )}
            </div>

            {/* Event Description */}
            <div className="bg-white rounded-xl shadow border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Event Description</h2>
              <div className="prose max-w-none">
                {event.description ? (
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {event.description}
                  </p>
                ) : (
                  <p className="text-gray-400 italic">No description provided for this event.</p>
                )}
              </div>
            </div>

            {/* Event Schedule */}
            <div className="bg-white rounded-xl shadow border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaCalendarAlt className="text-blue-600" />
                Event Schedule
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Start Date & Time</h3>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FaClock className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{formatDate(event.startDate)}</p>
                        <p className="text-gray-600">{formatTime(event.startDate)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {event.endDate && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">End Date & Time</h3>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <FaClock className="text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{formatDate(event.endDate)}</p>
                          <p className="text-gray-600">{formatTime(event.endDate)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Duration</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      {event.endDate ? (
                        <p className="text-gray-800 font-medium">
                          {Math.ceil((new Date(event.endDate) - new Date(event.startDate)) / (1000 * 60 * 60))} hours
                        </p>
                      ) : (
                        <p className="text-gray-800 font-medium">No end time specified</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Event Status</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {status.type === 'upcoming' && <FaCheckCircle className="text-green-500" />}
                        {status.type === 'ongoing' && <FaClock className="text-yellow-500" />}
                        {status.type === 'completed' && <FaTimesCircle className="text-purple-500" />}
                        {status.type === 'draft' && <FaTimesCircle className="text-gray-500" />}
                        <span className="font-medium text-gray-800">{status.label}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Event Information Card */}
            <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Event Information</h3>
              
              <div className="space-y-4">
                {/* Category */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FaTag className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-500">Category</span>
                  </div>
                  <p className="text-gray-800 font-medium">
                    {event.category?.name || 'No category assigned'}
                  </p>
                </div>

                {/* Venue */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FaMapMarkerAlt className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-500">Venue</span>
                  </div>
                  {event.venue ? (
                    <div>
                      <p className="text-gray-800 font-medium">{event.venue.name}</p>
                      {event.venue.city && (
                        <p className="text-gray-600 text-sm">{event.venue.city}</p>
                      )}
                      {event.venue.address && (
                        <p className="text-gray-600 text-sm">{event.venue.address}</p>
                      )}
                      {event.venue.capacity && (
                        <p className="text-gray-600 text-sm">Capacity: {event.venue.capacity} people</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-800 font-medium">No venue assigned</p>
                  )}
                </div>

                {/* Organizer */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FaUser className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-500">Organizer</span>
                  </div>
                  {event.organizer ? (
                    <div>
                      <p className="text-gray-800 font-medium">{event.organizer.name}</p>
                      {event.organizer.email && (
                        <p className="text-gray-600 text-sm flex items-center gap-1">
                          <FaEnvelope className="text-xs" /> {event.organizer.email}
                        </p>
                      )}
                      {event.organizer.phone && (
                        <p className="text-gray-600 text-sm flex items-center gap-1">
                          <FaPhone className="text-xs" /> {event.organizer.phone}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-800 font-medium">No organizer information</p>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaTicketAlt />
                Ticket Pricing
              </h3>
              
              <div className="space-y-4">
                {/* Normal Tickets */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800">Normal Tickets</span>
                    {event.normalPrice?.price > 0 ? (
                      <span className="text-lg font-bold text-green-600">
                        ${event.normalPrice.price}
                      </span>
                    ) : (
                      <span className="text-lg font-bold text-green-600">FREE</span>
                    )}
                  </div>
                  {event.normalPrice?.quantity > 0 ? (
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Available:</span>
                      <span>{event.normalPrice.quantity} tickets</span>
                    </div>
                  ) : event.normalPrice?.quantity === 0 ? (
                    <p className="text-sm text-gray-500 italic">Unlimited tickets</p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No quantity specified</p>
                  )}
                </div>

                {/* VIP Tickets */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800">VIP Tickets</span>
                    {event.vipPrice?.price > 0 ? (
                      <span className="text-lg font-bold text-purple-600">
                        ${event.vipPrice.price}
                      </span>
                    ) : event.vipPrice?.price === 0 ? (
                      <span className="text-lg font-bold text-green-600">FREE</span>
                    ) : (
                      <span className="text-lg font-bold text-gray-400">—</span>
                    )}
                  </div>
                  {event.vipPrice?.quantity > 0 ? (
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Available:</span>
                      <span>{event.vipPrice.quantity} tickets</span>
                    </div>
                  ) : event.vipPrice?.quantity === 0 ? (
                    <p className="text-sm text-gray-500 italic">Unlimited tickets</p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No VIP tickets</p>
                  )}
                </div>

                {/* Total Capacity */}
                {(event.normalPrice?.quantity > 0 || event.vipPrice?.quantity > 0) && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Total Capacity</span>
                      <span className="font-bold text-gray-800">
                        {(event.normalPrice?.quantity || 0) + (event.vipPrice?.quantity || 0)} tickets
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Actions</h3>
              
              <div className="space-y-3">
                <Link
                  to={`/organizer/edit-event/${id}`}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  <FaEdit />
                  Edit Event
                </Link>
                
                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  <FaShare />
                  Share Event
                </button>
                
                <button
                  onClick={handlePrint}
                  className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  <FaPrint />
                  Print Details
                </button>
                
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash />
                      Delete Event
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Event Stats */}
            <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Event Stats</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Publish Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    event.isPublished 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {event.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Created On</span>
                  <span className="text-sm font-medium text-gray-800">
                    {formatDate(event.createdAt)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Last Updated</span>
                  <span className="text-sm font-medium text-gray-800">
                    {formatDate(event.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links at Bottom */}
        <div className="mt-8 flex justify-between items-center">
          <Link
            to="/organizer/event-list"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
          >
            <FaArrowLeft />
            Back to Events List
          </Link>
          
          <div className="text-sm text-gray-500">
            Event ID: <span className="font-mono text-gray-700">{id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;