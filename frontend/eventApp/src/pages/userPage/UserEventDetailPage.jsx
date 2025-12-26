// pages/EventDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaTag,
  FaArrowLeft,
  FaDollarSign,
  FaUsers,
  FaClock,
  FaUser,
  FaImage,
  FaShare,
  FaTicketAlt,
  FaCreditCard,
  FaQrcode,
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaStar,
  FaRegStar,
  FaSpinner,
  FaExclamationCircle
} from 'react-icons/fa';
import { format, parseISO, isPast, isFuture } from 'date-fns';
import { useEventContext } from '../../context/EventContext';

import { toastError, toastSuccess } from '../../../utility/toast.js'

const UserEventDetailPage = () => {

  const { BASE_URL } = useEventContext()
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState('normal');
  const [quantity, setQuantity] = useState(1);
  const [orderLoading, setOrderLoading] = useState(false);

  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/api/events/get-eventById/${id}`, { withCredentials: true });

        if (response.data.success) {
          setEvent(response.data.event);
          console.log(response.data.event);

        } else {
          setError('Event not found');
        }
      } catch (err) {
        console.error('Error fetching event details:', err);
        if (err.response) {
          if (err.response.status === 401 || err.response.status === 403) {
            navigate("/login")
          }
        } else {
          setError('Server is not responding. please try again later!');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'EEEE, MMMM dd, yyyy');
    } catch {
      return 'Date TBD';
    }
  };

  const formatTime = (dateString) => {
    try {
      return format(parseISO(dateString), 'hh:mm a');
    } catch {
      return 'Time TBD';
    }
  };

  // Get event status
  const getEventStatus = () => {
    if (!event) return 'loading';
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
  const getStatusBadge = () => {
    const status = getEventStatus();
    const badges = {
      upcoming: { text: 'Upcoming', color: 'bg-green-100 text-green-800', icon: '🕒' },
      ongoing: { text: 'Live Now', color: 'bg-red-100 text-red-800', icon: '🔥' },
      completed: { text: 'Completed', color: 'bg-gray-100 text-gray-800', icon: '✅' },
      draft: { text: 'Draft', color: 'bg-yellow-100 text-yellow-800', icon: '📝' },
      published: { text: 'Published', color: 'bg-blue-100 text-blue-800', icon: '📢' },
      loading: { text: 'Loading...', color: 'bg-gray-100 text-gray-800', icon: '⏳' }
    };
    return badges[status] || badges.loading;
  };

  // Calculate ticket price
  const calculateTicketPrice = () => {
    if (!event) return 0;

    const ticket = selectedTicket === 'normal' ? event.normalPrice : event.vipPrice;
    if (!ticket || !ticket.price) return 0;

    return ticket.price * quantity;
  };

  // Handle order now
  const handleOrderNow = async () => {
    if (!event) return;

    const status = getEventStatus();
    if (status === 'completed') {
      alert('This event has already ended');
      return;
    }

    if (status === 'draft') {
      alert('This event is not published yet');
      return;
    }

    handleOrderSubmit()
  };


  // SUBMIT ORDER
  const handleOrderSubmit = async () => {
    setOrderLoading(true);

    try {

      const orderData = {
        eventId: event._id,
        ticketType: selectedTicket,
        quantity: quantity,
        totalAmount: ticketPrice,
        cardNumber: document.querySelector('input[name="cardNumber"]')?.value.trim(),
        expiryDate: document.querySelector('input[name="expiryDate"]')?.value.trim(),
        cvc: document.querySelector('input[name="cvc"]')?.value.trim(),
      };


      const response = await axios.post(
        `${BASE_URL}/api/orders/create-order`,
        orderData,
        { withCredentials: true }
      );

      if (response.data.success) {


        // If payment requires redirection
        if (response.data.paymentUrl) {
          window.location.href = response.data.paymentUrl;
        } else {
          setQuantity(1);
          toastSuccess(response.status.message || "Order created successully")

          // Refresh event data to update ticket availability
          const refreshResponse = await axios.get(`${BASE_URL}/api/events/get-eventById/${id}`, { withCredentials: true });
          if (refreshResponse.data.success) {
            setEvent(refreshResponse.data.event);
          }
        }
      } else {
        throw new Error(response.data.message || 'Order failed');
      }

    } catch (error) {
      console.error('Order submission error:', error);

      // Handle specific error types
      if (error.response) {
        switch (error.response.status) {
          case 400:
            alert('Invalid order data. Please check your information.');
            break;
          case 401:
            alert('Please login to place an order.');
            navigate('/login');
            break;
          case 403:
            alert('You cannot purchase tickets for this event.');
            break;
          case 409:
            toastError('Not enough tickets available. Please reduce quantity.');
            break;
          default:
            alert(error.response.data.message || 'Order failed. Please try again.');
        }
      } else {
        alert('Server is not responding. please try again later!');
      }
    } finally {
      setOrderLoading(false);
    }
  };





  // Share event
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <FaSpinner className="animate-spin text-green-600 text-4xl" />
        <span className="ml-4 text-gray-600 text-lg">Loading event...</span>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <FaExclamationCircle className="text-red-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The event you are looking for does not exist.'}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
          >
            <FaArrowLeft />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge();
  const ticketPrice = calculateTicketPrice();

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 transition mb-6"
        >
          <FaArrowLeft />
          Back to Events
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2">
            {/* Event Header */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                    <span className={`px-4 py-1 rounded-full text-sm font-medium ${statusBadge.color}`}>
                      {statusBadge.icon} {statusBadge.text}
                    </span>
                  </div>
                  <p className="text-gray-600">
                    Organized by <span className="font-semibold text-green-600">{event.organizer?.name || 'Unknown Organizer'}</span>
                  </p>
                </div>

                <button
                  onClick={handleShare}
                  className="p-3 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-full transition"
                  title="Share event"
                >
                  <FaShare />
                </button>
              </div>

              {/* Event Image */}
              <div className="relative h-96 rounded-xl overflow-hidden mb-6">
                {event.image ? (
                  <img
                    src={`${BASE_URL}/uploads/${event.image}`}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                    <FaCalendarAlt className="text-white text-6xl" />
                  </div>
                )}
              </div>

              {/* Event Description */}
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">About This Event</h2>
                <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {event.description || 'No description available for this event.'}
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Event Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date & Time */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Date & Time</h3>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FaCalendarAlt className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{formatDate(event.startDate)}</p>
                        <p className="text-gray-600">{formatTime(event.startDate)}</p>
                        {event.endDate && (
                          <p className="text-sm text-gray-500 mt-1">
                            Ends: {formatTime(event.endDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Category */}
                  {event.category && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Category</h3>
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FaTag className="text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-800">{event.category.name}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Venue */}
                {event.venue && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Venue</h3>
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <FaMapMarkerAlt className="text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{event.venue.name}</p>
                          <p className="text-gray-600">{event.venue.city}</p>
                          {event.venue.address && (
                            <p className="text-sm text-gray-500 mt-1">{event.venue.address}</p>
                          )}
                          {event.venue.capacity && (
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                              <FaUsers className="text-xs" /> Capacity: {event.venue.capacity}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Organizer */}
                    {event.organizer && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Organizer</h3>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <FaUser className="text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{event.organizer.name}</p>
                            {event.organizer.email && (
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <FaEnvelope className="text-xs" /> {event.organizer.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Order Section */}
          <div className="space-y-8">
            {/* Ticket Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaTicketAlt className="text-green-600" />
                Get Tickets
              </h2>

              {/* Ticket Type Selection */}
              <div className="space-y-4 mb-6">
                {/* Normal Ticket */}
                <div
                  onClick={() => setSelectedTicket('normal')}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedTicket === 'normal'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                    }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-800">Normal Ticket</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${event.normalPrice?.price || 0}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Standard access to the event
                  </p>
                  {event.normalPrice?.quantity && (
                    <p className="text-sm text-gray-500">
                      {event.normalPrice.quantity} tickets available
                    </p>
                  )}
                </div>

                {/* VIP Ticket */}
                {event.vipPrice?.price > 0 && (
                  <div
                    onClick={() => setSelectedTicket('vip')}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedTicket === 'vip'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                      }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-800">VIP Ticket</span>
                      <span className="text-2xl font-bold text-purple-600">
                        ${event.vipPrice.price}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Premium access with special benefits
                    </p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      <li className="flex items-center gap-1">
                        <FaStar className="text-yellow-500" /> Priority seating
                      </li>
                      <li className="flex items-center gap-1">
                        <FaQrcode /> Fast track entry
                      </li>
                      <li className="flex items-center gap-1">
                        <FaUsers /> VIP lounge access
                      </li>
                    </ul>
                    {event.vipPrice?.quantity && (
                      <p className="text-sm text-gray-500 mt-2">
                        {event.vipPrice.quantity} tickets available
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Quantity
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    -
                  </button>
                  <span className="text-2xl font-bold text-gray-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-800">
                    ${ticketPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Service fee</span>
                  <span>${(ticketPrice * 0.05).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-300 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800">Total</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${(ticketPrice * 1.05).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Now Button */}
              <button
                onClick={handleOrderNow}
                className="w-full bg-linear-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
              >
                <FaCreditCard className="text-xl" />
                Order Now
                <span className="text-white/80">→</span>
              </button>

              {/* Secure Payment Note */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <FaCreditCard className="text-green-500" />
                  Secure payment • 24/7 support • Instant confirmation
                </p>
              </div>
            </div>

            {/* Event Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Event Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ticket Availability</span>
                  <span className="font-bold text-green-600">
                    {((event.normalPrice?.quantity || 0) + (event.vipPrice?.quantity || 0)) > 0 ? 'Available' : 'Sold Out'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Event Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                    {statusBadge.text}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium text-gray-800">
                    {format(new Date(event.createdAt), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium text-gray-800">
                    {format(new Date(event.updatedAt), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>
            </div>

            {/* Need Help? */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-blue-800 mb-3">Need Help?</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FaPhone className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-800">Call Support</p>
                    <p className="text-sm text-blue-600">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FaEnvelope className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-800">Email Support</p>
                    <p className="text-sm text-blue-600">support@chillux.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FaGlobe className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-800">FAQs</p>
                    <p className="text-sm text-blue-600">Visit our help center</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserEventDetailPage;